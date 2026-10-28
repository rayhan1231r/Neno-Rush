/**
 * NEON RUSH - 3D Endless Runner Game Engine
 * Implements 60fps Three.js simulation, software WebGL pacing via fenceSync (afterDraw),
 * procedural endless road recycling, 3-lane physics, hitstop, pooled particles,
 * and dynamic cyberpunk cityscape.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LANE_WIDTH, clampLane, getLaneX, calculateRunScore } from './rules';
import { CharacterMeshHandle, createCharacterMesh, createSkateboardMesh } from './models';
import { sound } from './audio';
import { ActivePowerUp, PowerUpType, RunStats } from '../types/game';

// Pre-allocated scratch math helpers outside render loop
const _vec3 = new THREE.Vector3();
const _playerBox = new THREE.Box3();
const _obstacleBox = new THREE.Box3();

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, distance: number, coins: number, multiplier: number) => void;
  onPowerUpUpdate: (powerUps: ActivePowerUp[]) => void;
  onHit: (remainingShield: number) => void;
  onGameOver: (stats: RunStats) => void;
  onStateChange: (state: 'ready' | 'running' | 'paused' | 'gameover') => void;
}

export interface ObstacleInstance {
  type: 'train' | 'barrier_high' | 'barrier_low' | 'crate';
  lane: -1 | 0 | 1;
  mesh: THREE.Group;
  z: number;
  width: number;
  height: number;
  depth: number;
  requiresSlide: boolean;
  requiresJump: boolean;
  canRamp?: boolean;
}

export interface CoinInstance {
  mesh: THREE.Mesh;
  lane: -1 | 0 | 1;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  isMagnetized: boolean;
}

export interface PowerUpItemInstance {
  type: PowerUpType;
  mesh: THREE.Group;
  lane: -1 | 0 | 1;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface TrackChunk {
  group: THREE.Group;
  zStart: number;
  length: number;
  obstacles: ObstacleInstance[];
  coins: CoinInstance[];
  powerUps: PowerUpItemInstance[];
}

export class NeonRushEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private isDestroyed: boolean = false;

  // Game States
  public state: 'ready' | 'running' | 'paused' | 'gameover' = 'ready';
  private currentLane: -1 | 0 | 1 = 0;
  private targetLaneX: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerVy: number = 0;
  private isGrounded: boolean = true;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private coyoteTimer: number = 0;
  private jumpBuffered: boolean = false;
  private jumpBufferTimer: number = 0;

  // Run metrics
  private distanceRun: number = 0;
  private coinsCollected: number = 0;
  private currentScore: number = 0;
  private baseSpeed: number = 24.0; // m/s
  private currentSpeed: number = 24.0;
  private speedMultiplier: number = 1.0;
  private hitstopTimer: number = 0;
  private cameraTrauma: number = 0;
  private baseScoreMultiplier: number = 1.0;
  private characterBonusMultiplier: number = 0;

  // Stats accumulator
  private totalJumps: number = 0;
  private totalSlides: number = 0;
  private totalPowerups: number = 0;
  private skateboardsUsed: number = 0;
  private hitCount: number = 0;
  private runDurationSec: number = 0;

  // Power-ups
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();
  private hasSkateboardShield: boolean = false;
  private skateboardMesh: THREE.Group | null = null;

  // Character
  private characterHandle!: CharacterMeshHandle;
  private playerGroup!: THREE.Group;
  private selectedCharacterId: string;
  private selectedSkateboardId: string;

  // World & Track
  private chunks: TrackChunk[] = [];
  private readonly CHUNK_LENGTH = 60;
  private readonly TOTAL_CHUNKS = 6;
  private nextChunkZ: number = 0;

  // City Scenery
  private sceneryGroup!: THREE.Group;

  // Reusable Shared Materials
  private roadMaterial!: THREE.MeshStandardMaterial;
  private coinGeometry!: THREE.CylinderGeometry;
  private coinMaterial!: THREE.MeshStandardMaterial;

  // Pooled Particle System
  private particleCount = 120;
  private particleGeo!: THREE.BufferGeometry;
  private particleMat!: THREE.PointsMaterial;
  private particlePoints!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private particleLifetimes!: Float32Array;

  // Input state
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;

  constructor(
    container: HTMLElement,
    callbacks: GameEngineCallbacks,
    characterId: string = 'char_starter',
    skateboardId: string = 'board_classic',
    charBonus: number = 0
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.selectedCharacterId = characterId;
    this.selectedSkateboardId = skateboardId;
    this.characterBonusMultiplier = charBonus;
    this.clock = new THREE.Clock();

    this.initEngine();
    this.initWorld();
    this.initPlayer();
    this.initParticles();
    this.bindInputs();

    this.startLoop();
  }

  private initEngine() {
    // Software WebGL Detection
    this.isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !this.isSoftwareGl,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050814); // Deep cyberpunk navy
    this.scene.fog = new THREE.FogExp2(0x050814, 0.009);

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    this.camera.position.set(0, 3.8, -5.5);
    this.camera.lookAt(0, 1.6, 6.0);

    // Studio Environment Reflections
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Fallback
    }

    // Warm Key Light + Cool Hemisphere Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 0.9);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e6, 1.8);
    keyLight.position.set(15, 25, 10);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 70;
      keyLight.shadow.camera.left = -15;
      keyLight.shadow.camera.right = 15;
      keyLight.shadow.camera.top = 25;
      keyLight.shadow.camera.bottom = -10;
    }
    this.scene.add(keyLight);

    // Neon Accent Lights
    const cyanLight = new THREE.PointLight(0x06b6d4, 2.5, 35);
    cyanLight.position.set(-6, 4, 15);
    this.scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xf43f5e, 2.5, 35);
    magentaLight.position.set(6, 4, 25);
    this.scene.add(magentaLight);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private initWorld() {
    // Shared Road Materials
    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.6,
      metalness: 0.2,
    });

    // Shared Coin geometry & glowing material
    this.coinGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    this.coinGeometry.rotateZ(Math.PI / 2);
    this.coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xeab308,
      emissiveIntensity: 0.65,
    });

    // Create Initial Endless Track Chunks
    this.nextChunkZ = -20;
    for (let i = 0; i < this.TOTAL_CHUNKS; i++) {
      this.generateChunk(i === 0); // First chunk is clear of obstacles
    }

    // Distant Cyber City Skyline
    this.initSkyline();
  }

  private initSkyline() {
    this.sceneryGroup = new THREE.Group();
    this.scene.add(this.sceneryGroup);

    const towerGeo = new THREE.BoxGeometry(1, 1, 1);
    const towerMat1 = new THREE.MeshStandardMaterial({ color: 0x090d1a, roughness: 0.8, metalness: 0.3 });
    const towerMat2 = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });

    // Buildings on left and right flanks
    for (let i = 0; i < 30; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? -18 - Math.random() * 25 : 18 + Math.random() * 25;
      const z = (i * 20) % 350;
      const h = 25 + Math.random() * 60;
      const w = 8 + Math.random() * 12;

      const building = new THREE.Mesh(towerGeo, Math.random() > 0.4 ? towerMat1 : towerMat2);
      building.scale.set(w, h, w);
      building.position.set(x, h / 2 - 2, z);
      this.sceneryGroup.add(building);

      // Holographic billboard accents
      if (Math.random() > 0.6) {
        const signMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x06b6d4 : 0xf43f5e,
        });
        const sign = new THREE.Mesh(towerGeo, signMat);
        sign.scale.set(w * 0.8, 4, 0.4);
        sign.position.set(x + (isLeft ? 2 : -2), h * 0.7, z);
        this.sceneryGroup.add(sign);
      }
    }
  }

  private generateChunk(isStartChunk: boolean = false) {
    const chunkGroup = new THREE.Group();
    chunkGroup.position.z = this.nextChunkZ;

    const obstacles: ObstacleInstance[] = [];
    const coins: CoinInstance[] = [];
    const powerUps: PowerUpItemInstance[] = [];

    // Roadway platform (3 lanes wide + shoulders)
    const roadWidth = LANE_WIDTH * 3 + 2.5;
    const roadGeo = new THREE.BoxGeometry(roadWidth, 0.8, this.CHUNK_LENGTH);
    const road = new THREE.Mesh(roadGeo, this.roadMaterial);
    road.position.set(0, -0.4, this.CHUNK_LENGTH / 2);
    road.receiveShadow = true;
    chunkGroup.add(road);

    // Neon Curbs & Lane Divider Lines
    const laneDividerMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
    });

    const dividerGeo = new THREE.BoxGeometry(0.12, 0.05, this.CHUNK_LENGTH);
    const divLeft = new THREE.Mesh(dividerGeo, laneDividerMat);
    divLeft.position.set(-LANE_WIDTH / 2, 0.02, this.CHUNK_LENGTH / 2);
    chunkGroup.add(divLeft);

    const divRight = new THREE.Mesh(dividerGeo, laneDividerMat);
    divRight.position.set(LANE_WIDTH / 2, 0.02, this.CHUNK_LENGTH / 2);
    chunkGroup.add(divRight);

    // Glowing Outer Barrier Rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.6,
    });
    const railGeo = new THREE.BoxGeometry(0.3, 0.8, this.CHUNK_LENGTH);
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(-roadWidth / 2 + 0.15, 0.4, this.CHUNK_LENGTH / 2);
    chunkGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(roadWidth / 2 - 0.15, 0.4, this.CHUNK_LENGTH / 2);
    chunkGroup.add(railR);

    // Spawn Obstacles & Collectibles (skip on initial spawn safety zone)
    if (!isStartChunk) {
      const zSteps = [12, 28, 44];
      for (const zOffset of zSteps) {
        const lane = ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)];
        const patternRoll = Math.random();

        if (patternRoll < 0.35) {
          // Cyber Train Obstacle
          const train = this.createCyberTrainMesh();
          train.position.set(getLaneX(lane), 0, zOffset);
          chunkGroup.add(train);
          obstacles.push({
            type: 'train',
            lane,
            mesh: train,
            z: this.nextChunkZ + zOffset,
            width: 2.2,
            height: 3.2,
            depth: 8.0,
            requiresSlide: false,
            requiresJump: false,
            canRamp: true,
          });
        } else if (patternRoll < 0.6) {
          // Low Laser Barrier (requires SLIDE)
          const barrier = this.createSlideBarrierMesh();
          barrier.position.set(getLaneX(lane), 0, zOffset);
          chunkGroup.add(barrier);
          obstacles.push({
            type: 'barrier_low',
            lane,
            mesh: barrier,
            z: this.nextChunkZ + zOffset,
            width: 2.2,
            height: 1.8,
            depth: 0.8,
            requiresSlide: true,
            requiresJump: false,
          });
        } else if (patternRoll < 0.85) {
          // High Laser Hurdle (requires JUMP)
          const hurdle = this.createJumpHurdleMesh();
          hurdle.position.set(getLaneX(lane), 0, zOffset);
          chunkGroup.add(hurdle);
          obstacles.push({
            type: 'barrier_high',
            lane,
            mesh: hurdle,
            z: this.nextChunkZ + zOffset,
            width: 2.2,
            height: 0.9,
            depth: 0.6,
            requiresSlide: false,
            requiresJump: true,
          });
        } else {
          // Tech Crate Stack
          const crate = this.createCrateMesh();
          crate.position.set(getLaneX(lane), 0, zOffset);
          chunkGroup.add(crate);
          obstacles.push({
            type: 'crate',
            lane,
            mesh: crate,
            z: this.nextChunkZ + zOffset,
            width: 1.8,
            height: 1.6,
            depth: 1.8,
            requiresSlide: false,
            requiresJump: true,
          });
        }

        // Spawn Coin Trails in adjacent or jumping lanes
        const coinLane = ([-1, 0, 1] as const).find((l) => l !== lane) || 0;
        for (let c = 0; c < 5; c++) {
          const coinMesh = new THREE.Mesh(this.coinGeometry, this.coinMaterial);
          const coinZ = zOffset - 4 + c * 2.2;
          const coinY = 0.9;
          coinMesh.position.set(getLaneX(coinLane), coinY, coinZ);
          coinMesh.castShadow = !this.isSoftwareGl;
          chunkGroup.add(coinMesh);

          coins.push({
            mesh: coinMesh,
            lane: coinLane,
            x: getLaneX(coinLane),
            y: coinY,
            z: this.nextChunkZ + coinZ,
            collected: false,
            isMagnetized: false,
          });
        }

        // Rare Power-Up Spawn (~20% chance)
        if (Math.random() < 0.22) {
          const pTypes: PowerUpType[] = ['skateboard', 'magnet', 'multiplier2x', 'neondash'];
          const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
          const pLane = ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)];
          const pMesh = this.createPowerUpMesh(pType);
          const pZ = zOffset + 7;
          pMesh.position.set(getLaneX(pLane), 1.2, pZ);
          chunkGroup.add(pMesh);

          powerUps.push({
            type: pType,
            mesh: pMesh,
            lane: pLane,
            x: getLaneX(pLane),
            y: 1.2,
            z: this.nextChunkZ + pZ,
            collected: false,
          });
        }
      }
    }

    this.scene.add(chunkGroup);
    this.chunks.push({
      group: chunkGroup,
      zStart: this.nextChunkZ,
      length: this.CHUNK_LENGTH,
      obstacles,
      coins,
      powerUps,
    });

    this.nextChunkZ += this.CHUNK_LENGTH;
  }

  private createCyberTrainMesh(): THREE.Group {
    const group = new THREE.Group();
    const trainMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });

    // Train Body
    const bodyGeo = new THREE.BoxGeometry(2.1, 2.6, 7.5);
    const body = new THREE.Mesh(bodyGeo, trainMat);
    body.position.set(0, 1.3, 0);
    body.castShadow = true;
    group.add(body);

    // Front Sloped Nose / Windshield
    const noseGeo = new THREE.BoxGeometry(1.9, 1.2, 0.4);
    const nose = new THREE.Mesh(noseGeo, windowMat);
    nose.position.set(0, 1.8, -3.76);
    group.add(nose);

    // Side illuminated neon windows
    const winGeo = new THREE.BoxGeometry(0.04, 0.6, 6.0);
    const winL = new THREE.Mesh(winGeo, windowMat);
    winL.position.set(-1.06, 1.6, 0);
    const winR = new THREE.Mesh(winGeo, windowMat);
    winR.position.set(1.06, 1.6, 0);
    group.add(winL, winR);

    // Top Roof Ramp (allows jumping on top!)
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const rampGeo = new THREE.BoxGeometry(1.8, 0.1, 7.2);
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(0, 2.65, 0);
    group.add(ramp);

    return group;
  }

  private createSlideBarrierMesh(): THREE.Group {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.7 });
    const laserMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 1.0,
    });

    // Left & Right Support Posts
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8);
    const postL = new THREE.Mesh(postGeo, frameMat);
    postL.position.set(-1.1, 1.2, 0);
    const postR = new THREE.Mesh(postGeo, frameMat);
    postR.position.set(1.1, 1.2, 0);
    group.add(postL, postR);

    // High beam that blocks jumps (must slide under!)
    const highBeamGeo = new THREE.BoxGeometry(2.3, 1.1, 0.35);
    const highBeam = new THREE.Mesh(highBeamGeo, frameMat);
    highBeam.position.set(0, 1.8, 0);
    group.add(highBeam);

    // Warning hologram strip
    const holoGeo = new THREE.BoxGeometry(2.1, 0.3, 0.38);
    const holo = new THREE.Mesh(holoGeo, laserMat);
    holo.position.set(0, 1.7, 0);
    group.add(holo);

    return group;
  }

  private createJumpHurdleMesh(): THREE.Group {
    const group = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const laserMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.2,
    });

    // Low hurdle beam (must jump over)
    const beamGeo = new THREE.BoxGeometry(2.2, 0.45, 0.3);
    const beam = new THREE.Mesh(beamGeo, postMat);
    beam.position.set(0, 0.35, 0);
    group.add(beam);

    // Glowing laser beam
    const glowGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    glowGeo.rotateZ(Math.PI / 2);
    const glow = new THREE.Mesh(glowGeo, laserMat);
    glow.position.set(0, 0.65, 0);
    group.add(glow);

    return group;
  }

  private createCrateMesh(): THREE.Group {
    const group = new THREE.Group();
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.6,
      metalness: 0.3,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
    });

    const boxGeo = new THREE.BoxGeometry(1.6, 1.4, 1.6);
    const box = new THREE.Mesh(boxGeo, crateMat);
    box.position.set(0, 0.7, 0);
    box.castShadow = true;
    group.add(box);

    const bandGeo = new THREE.BoxGeometry(1.65, 0.2, 1.65);
    const band = new THREE.Mesh(bandGeo, frameMat);
    band.position.set(0, 0.7, 0);
    group.add(band);

    return group;
  }

  private createPowerUpMesh(type: PowerUpType): THREE.Group {
    const group = new THREE.Group();
    let color = 0x06b6d4;
    if (type === 'skateboard') color = 0x10b981;
    if (type === 'multiplier2x') color = 0xf59e0b;
    if (type === 'neondash') color = 0xa855f7;

    const orbMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      metalness: 0.4,
      roughness: 0.2,
    });

    const orbGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    // Rotating ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.06, 8, 24);
    const ring = new THREE.Mesh(ringGeo, orbMat);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    return group;
  }

  private initPlayer() {
    this.playerGroup = new THREE.Group();
    this.playerGroup.position.set(0, 0, 0);
    this.scene.add(this.playerGroup);

    this.characterHandle = createCharacterMesh(this.selectedCharacterId);
    this.playerGroup.add(this.characterHandle.root);

    // Attach Skateboard Mesh
    this.skateboardMesh = createSkateboardMesh(this.selectedSkateboardId);
    this.skateboardMesh.position.set(0, -0.05, 0);
    this.skateboardMesh.visible = false; // Visible only when hoverboard shield active
    this.playerGroup.add(this.skateboardMesh);
  }

  public updateEquippedItems(characterId: string, skateboardId: string, charBonus: number) {
    this.selectedCharacterId = characterId;
    this.selectedSkateboardId = skateboardId;
    this.characterBonusMultiplier = charBonus;

    if (this.characterHandle) {
      this.playerGroup.remove(this.characterHandle.root);
    }
    if (this.skateboardMesh) {
      this.playerGroup.remove(this.skateboardMesh);
    }

    this.characterHandle = createCharacterMesh(characterId);
    this.playerGroup.add(this.characterHandle.root);

    this.skateboardMesh = createSkateboardMesh(skateboardId);
    this.skateboardMesh.position.set(0, -0.05, 0);
    this.skateboardMesh.visible = this.hasSkateboardShield;
    this.playerGroup.add(this.skateboardMesh);
  }

  private initParticles() {
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);
    this.particleLifetimes = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      this.particleLifetimes[i] = -1; // Inactive
    }

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    this.particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particlePoints);
  }

  public spawnParticles(x: number, y: number, z: number, count: number, colorHex: number = 0xfacc15) {
    this.particleMat.color.setHex(colorHex);
    let spawned = 0;
    for (let i = 0; i < this.particleCount && spawned < count; i++) {
      if (this.particleLifetimes[i] <= 0) {
        this.particlePositions[i * 3] = x;
        this.particlePositions[i * 3 + 1] = y;
        this.particlePositions[i * 3 + 2] = z;

        this.particleVelocities[i * 3] = (Math.random() - 0.5) * 8;
        this.particleVelocities[i * 3 + 1] = Math.random() * 6 + 1;
        this.particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 8;

        this.particleLifetimes[i] = 0.5 + Math.random() * 0.4;
        spawned++;
      }
    }
  }

  // Input bindings
  private bindInputs() {
    window.addEventListener('keydown', this.handleKeyDown);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', this.handleTouchEnd, { passive: true });

    // Focus / Blur Hygiene
    window.addEventListener('blur', this.handleWindowBlur);
  }

  private handleWindowBlur = () => {
    // Clear inputs on blur without forcefully showing modal
    this.jumpBuffered = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.state === 'ready') {
      if (e.key === ' ' || e.key === 'Enter') {
        this.startRun();
        return;
      }
    }

    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      this.togglePause();
      return;
    }

    if (this.state !== 'running') return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.switchLane(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.switchLane(1);
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      this.triggerJump();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.triggerSlide();
    } else if (e.key === 'b' || e.key === 'B') {
      // Activate Skateboard power-up via key
      this.activatePowerUp('skateboard', 12);
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (this.state === 'ready') {
      this.startRun();
      return;
    }
    if (this.state !== 'running') return;

    if (e.changedTouches.length > 0) {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const dt = performance.now() - this.touchStartTime;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Tap / Double tap
      if (absX < 20 && absY < 20 && dt < 250) {
        this.activatePowerUp('skateboard', 12);
        return;
      }

      if (absX > absY && absX > 30) {
        if (dx < 0) this.switchLane(-1);
        else this.switchLane(1);
      } else if (absY > absX && absY > 30) {
        if (dy < 0) this.triggerJump();
        else this.triggerSlide();
      }
    }
  };

  public switchLane(delta: -1 | 1) {
    if (this.state !== 'running') return;
    const nextLane = clampLane(this.currentLane, delta);
    if (nextLane !== this.currentLane) {
      this.currentLane = nextLane;
      this.targetLaneX = getLaneX(nextLane);
      sound.playLaneSwitch(delta);
    }
  }

  public triggerJump() {
    if (this.state !== 'running') return;

    // Coyote time or grounded check
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.playerVy = 13.5;
      this.isSliding = false;
      this.slideTimer = 0;
      this.totalJumps++;
      sound.playJump();
    } else {
      // Input buffering
      this.jumpBuffered = true;
      this.jumpBufferTimer = 0.12;
    }
  }

  public triggerSlide() {
    if (this.state !== 'running') return;
    this.isSliding = true;
    this.slideTimer = 0.65;
    this.totalSlides++;
    sound.playSlide();

    // Fast fall if mid-air
    if (!this.isGrounded) {
      this.playerVy = -18.0;
    }
  }

  public activatePowerUp(type: PowerUpType, durationSec: number = 10) {
    sound.playPowerUp();
    this.totalPowerups++;

    if (type === 'skateboard') {
      this.hasSkateboardShield = true;
      this.skateboardsUsed++;
      if (this.skateboardMesh) {
        this.skateboardMesh.visible = true;
      }
    }

    this.activePowerUps.set(type, {
      type,
      durationTotal: durationSec,
      durationRemaining: durationSec,
    });

    this.callbacks.onPowerUpUpdate(Array.from(this.activePowerUps.values()));
  }

  public startRun() {
    this.state = 'running';
    document.body.dataset.state = 'playing';
    this.clock.start();
    sound.startMusic();
    this.callbacks.onStateChange('running');
  }

  public pauseRun() {
    if (this.state !== 'running') return;
    this.state = 'paused';
    document.body.dataset.state = 'paused';
    this.callbacks.onStateChange('paused');
  }

  public resumeRun() {
    if (this.state !== 'paused') return;
    this.state = 'running';
    document.body.dataset.state = 'playing';
    this.clock.getDelta(); // Clear accumulated delta
    this.callbacks.onStateChange('running');
  }

  public togglePause() {
    if (this.state === 'running') this.pauseRun();
    else if (this.state === 'paused') this.resumeRun();
  }

  public restartRun() {
    this.state = 'ready';
    document.body.dataset.state = 'title';

    this.currentLane = 0;
    this.targetLaneX = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.distanceRun = 0;
    this.coinsCollected = 0;
    this.currentScore = 0;
    this.currentSpeed = this.baseSpeed;
    this.cameraTrauma = 0;
    this.hitstopTimer = 0;
    this.totalJumps = 0;
    this.totalSlides = 0;
    this.totalPowerups = 0;
    this.skateboardsUsed = 0;
    this.hitCount = 0;
    this.runDurationSec = 0;

    this.activePowerUps.clear();
    this.hasSkateboardShield = false;
    if (this.skateboardMesh) this.skateboardMesh.visible = false;
    this.callbacks.onPowerUpUpdate([]);

    // Clear and rebuild chunks
    for (const chunk of this.chunks) {
      this.scene.remove(chunk.group);
    }
    this.chunks = [];
    this.nextChunkZ = -20;
    for (let i = 0; i < this.TOTAL_CHUNKS; i++) {
      this.generateChunk(i === 0);
    }

    this.playerGroup.position.set(0, 0, 0);
    this.camera.position.set(0, 3.8, -5.5);
    this.camera.lookAt(0, 1.6, 6.0);

    this.callbacks.onScoreUpdate(0, 0, 0, 1);
    this.callbacks.onStateChange('ready');
  }

  // Loop & Pacing
  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamped dt

      this.update(dt);
      this.renderer.render(this.scene, this.camera);

      // Software WebGL pacing via fenceSync
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (gl && gl.fenceSync) {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDestroyed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 60);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 50);
    }
  }

  private update(dt: number) {
    const time = performance.now() * 0.001;

    // Ready Title Screen Turntable Showcase
    if (this.state === 'ready') {
      this.characterHandle.updateAnimation(time, false, false, false);
      this.characterHandle.root.rotation.y = Math.sin(time * 0.8) * 0.4;
      this.camera.position.set(Math.sin(time * 0.4) * 0.6, 1.5, 3.2);
      this.camera.lookAt(0, 1.0, 0);
      return;
    }

    if (this.state === 'paused' || this.state === 'gameover') {
      return;
    }

    // Hitstop freeze handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      // Visual camera shake continues during hitstop
      this.updateCamera(dt, 0);
      return;
    }

    this.runDurationSec += dt;

    // Speed progression ramp (reaches 34m/s over 3000m)
    const targetSpeed = Math.min(35.0, this.baseSpeed + Math.sqrt(this.distanceRun) * 0.2);
    const speedBoost = this.activePowerUps.has('neondash') ? 1.5 : 1.0;
    this.currentSpeed = targetSpeed * speedBoost;

    // Advance world distance
    const moveDist = this.currentSpeed * dt;
    this.distanceRun += moveDist;

    // Multiplier calculation
    const hasDouble = this.activePowerUps.has('multiplier2x');
    this.speedMultiplier = (1 + Math.floor(this.distanceRun / 500)) * (hasDouble ? 2 : 1);
    this.currentScore = calculateRunScore(
      this.distanceRun,
      this.coinsCollected,
      this.speedMultiplier,
      this.characterBonusMultiplier,
      hasDouble
    );

    // Update Power-up Timers
    if (this.activePowerUps.size > 0) {
      let changed = false;
      for (const [type, item] of this.activePowerUps.entries()) {
        item.durationRemaining -= dt;
        if (item.durationRemaining <= 0) {
          this.activePowerUps.delete(type);
          if (type === 'skateboard') {
            this.hasSkateboardShield = false;
            if (this.skateboardMesh) this.skateboardMesh.visible = false;
          }
          changed = true;
        }
      }
      if (changed) {
        this.callbacks.onPowerUpUpdate(Array.from(this.activePowerUps.values()));
      }
    }

    // Player Lane Damping
    this.playerX = THREE.MathUtils.damp(this.playerX, this.targetLaneX, 18, dt);

    // Jump Physics & Gravity
    const gravity = -34.0;
    if (!this.isGrounded) {
      this.playerVy += gravity * dt;
      this.playerY += this.playerVy * dt;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVy = 0;
        this.isGrounded = true;

        // Consume buffered jump
        if (this.jumpBuffered && this.jumpBufferTimer > 0) {
          this.triggerJump();
          this.jumpBuffered = false;
        }
      }
    } else {
      this.coyoteTimer = 0.08;
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.jumpBufferTimer <= 0) this.jumpBuffered = false;
    }

    // Sliding Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Apply Player Position
    this.playerGroup.position.set(this.playerX, this.playerY, this.distanceRun);
    this.characterHandle.updateAnimation(time, true, !this.isGrounded, this.isSliding);

    // Skateboard pitch tilt
    if (this.hasSkateboardShield && this.skateboardMesh) {
      this.skateboardMesh.rotation.z = (this.targetLaneX - this.playerX) * 0.25;
      this.skateboardMesh.position.y = this.isSliding ? 0.15 : -0.05;
    }

    // Check Collisions & Pickups
    this.checkCollisions();

    // Recycle Track Chunks
    this.updateTrackChunks();

    // Camera follow with damping & trauma shake
    this.updateCamera(dt, moveDist);

    // Update Particles
    this.updateParticles(dt);

    // Scenery infinite shift
    this.sceneryGroup.position.z = Math.floor(this.distanceRun / 150) * 150;

    // Report HUD throttled
    this.callbacks.onScoreUpdate(this.currentScore, Math.floor(this.distanceRun), this.coinsCollected, this.speedMultiplier);
  }

  private checkCollisions() {
    const playerZ = this.distanceRun;
    const playerX = this.playerX;
    const playerY = this.playerY;

    // Player Bounding Box
    const playerHeight = this.isSliding ? 0.75 : 1.7;
    const playerWidth = 0.7;
    const playerDepth = 0.7;

    _playerBox.min.set(playerX - playerWidth / 2, playerY, playerZ - playerDepth / 2);
    _playerBox.max.set(playerX + playerWidth / 2, playerY + playerHeight, playerZ + playerDepth / 2);

    const hasMagnet = this.activePowerUps.has('magnet');
    const magnetRadius = 7.5;

    for (const chunk of this.chunks) {
      // Coins
      for (const coin of chunk.coins) {
        if (coin.collected) continue;

        // Magnet attraction
        if (hasMagnet) {
          const dx = playerX - coin.x;
          const dy = playerY + 0.8 - coin.y;
          const dz = playerZ - coin.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < magnetRadius * magnetRadius) {
            coin.x += dx * 0.18;
            coin.y += dy * 0.18;
            coin.z += dz * 0.18;
            coin.mesh.position.set(coin.x, coin.y, coin.z - chunk.zStart);
          }
        }

        // Coin spin animation
        coin.mesh.rotation.y += 0.08;

        // Coin collection collision
        const distZ = Math.abs(coin.z - playerZ);
        const distX = Math.abs(coin.x - playerX);
        const distY = Math.abs(coin.y - (playerY + 0.8));

        if (distZ < 1.1 && distX < 1.2 && distY < 1.4) {
          coin.collected = true;
          coin.mesh.visible = false;
          this.coinsCollected++;
          sound.playCoin();
          this.spawnParticles(coin.x, coin.y, coin.z, 8, 0xfacc15);
        }
      }

      // Power-up Orbs
      for (const p of chunk.powerUps) {
        if (p.collected) continue;

        p.mesh.rotation.y += 0.05;

        const distZ = Math.abs(p.z - playerZ);
        const distX = Math.abs(p.x - playerX);
        if (distZ < 1.3 && distX < 1.2 && playerY < 2.0) {
          p.collected = true;
          p.mesh.visible = false;
          this.activatePowerUp(p.type, p.type === 'skateboard' ? 14 : 10);
          this.spawnParticles(p.x, p.y, p.z, 16, 0x38bdf8);
        }
      }

      // Obstacles
      for (const obs of chunk.obstacles) {
        const obsZ = obs.z;
        const obsX = getLaneX(obs.lane);

        // Near check
        if (Math.abs(obsZ - playerZ) > obs.depth / 2 + 2) continue;

        _obstacleBox.min.set(obsX - obs.width / 2, 0, obsZ - obs.depth / 2);
        _obstacleBox.max.set(obsX + obs.width / 2, obs.height, obsZ + obs.depth / 2);

        // Tolerance for fair arcade feel
        _obstacleBox.expandByScalar(-0.15);

        if (_playerBox.intersectsBox(_obstacleBox)) {
          // If obstacle allows sliding under and player is sliding
          if (obs.requiresSlide && this.isSliding && playerY <= 0.2) {
            continue; // Safely slided under!
          }

          // If obstacle requires jumping and player is high enough
          if (obs.requiresJump && playerY > obs.height - 0.2) {
            continue; // Safely cleared jump!
          }

          // Collision Occurred!
          this.handleCollision(obs);
          return;
        }
      }
    }
  }

  private handleCollision(obs: ObstacleInstance) {
    this.hitCount++;
    sound.playCrash();
    this.spawnParticles(this.playerX, this.playerY + 0.8, this.distanceRun, 35, 0xf43f5e);
    this.cameraTrauma = 1.0;
    this.hitstopTimer = 0.06; // 60ms hitstop freeze

    // If skateboard shield is active, sacrifice shield instead of death!
    if (this.hasSkateboardShield) {
      this.hasSkateboardShield = false;
      this.activePowerUps.delete('skateboard');
      if (this.skateboardMesh) this.skateboardMesh.visible = false;
      this.callbacks.onPowerUpUpdate(Array.from(this.activePowerUps.values()));
      this.callbacks.onHit(0);

      // Bounce back to safe center lane and clear current obstacle
      obs.mesh.visible = false;
      return;
    }

    // Game Over
    this.state = 'gameover';
    document.body.dataset.state = 'gameover';
    sound.stopMusic();

    const stats: RunStats = {
      score: this.currentScore,
      distance: Math.floor(this.distanceRun),
      coinsCollected: this.coinsCollected,
      multiplier: this.speedMultiplier,
      skateboardsUsed: this.skateboardsUsed,
      jumpCount: this.totalJumps,
      slideCount: this.totalSlides,
      powerUpsCollected: this.totalPowerups,
      hitCount: this.hitCount,
    };

    this.callbacks.onGameOver(stats);
  }

  private updateTrackChunks() {
    const playerZ = this.distanceRun;

    // If oldest chunk is behind camera by > 40m, recycle it to the front
    const oldest = this.chunks[0];
    if (oldest && playerZ - (oldest.zStart + oldest.length) > 35) {
      this.scene.remove(oldest.group);
      this.chunks.shift();
      this.generateChunk(false);
    }
  }

  private updateCamera(dt: number, moveDist: number) {
    // Dynamic camera follow target
    const targetZ = this.distanceRun - 5.5;
    const targetY = 3.6 + this.playerY * 0.35;
    const targetX = this.playerX * 0.65;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetX, 12, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetY, 14, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetZ, 20, dt);

    // Trauma shake decay
    if (this.cameraTrauma > 0) {
      this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 2.5);
      const shake = this.cameraTrauma * this.cameraTrauma;
      this.camera.position.x += (Math.random() - 0.5) * shake * 0.45;
      this.camera.position.y += (Math.random() - 0.5) * shake * 0.45;
      this.camera.rotation.z = (Math.random() - 0.5) * shake * 0.08;
    } else {
      this.camera.rotation.z = 0;
    }

    _vec3.set(this.playerX * 0.4, 1.4 + this.playerY * 0.3, this.distanceRun + 7.5);
    this.camera.lookAt(_vec3);
  }

  private updateParticles(dt: number) {
    let active = 0;
    for (let i = 0; i < this.particleCount; i++) {
      if (this.particleLifetimes[i] > 0) {
        this.particleLifetimes[i] -= dt;

        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * dt;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * dt;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * dt;

        this.particleVelocities[i * 3 + 1] -= 9.8 * dt; // Gravity
        active++;
      }
    }
    if (active > 0) {
      this.particleGeo.attributes.position.needsUpdate = true;
    }
  }

  public destroy() {
    this.isDestroyed = true;
    sound.stopMusic();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleWindowBlur);

    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

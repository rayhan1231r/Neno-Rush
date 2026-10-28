/**
 * NEON RUSH - Procedural 3D Character & Skateboard Factory
 * Built according to Three.js guidelines: 3-12 composite parts, grounded bottom-center pivots,
 * rich PBR materials, distinct silhouettes, and articulated limbs for animations.
 */

import * as THREE from 'three';
import { CharacterItem, SkateboardItem } from '../types/game';

export const CHARACTERS: CharacterItem[] = [
  {
    id: 'char_starter',
    name: 'Jax Turbo',
    title: 'The Street Prodigy',
    rarity: 'starter',
    costType: 'free',
    price: 0,
    description: 'Agile parkour specialist with turbocharged neon kicks and quick reflexes.',
    perkDescription: 'Standard balanced stats with +0% base coin bonus.',
    multiplierBonus: 0,
    unlocked: true,
    colors: {
      primary: '#06b6d4', // Cyan
      secondary: '#1e1b4b', // Deep indigo
      accent: '#facc15', // Gold visor
      glow: '#22d3ee',
    },
    styleType: 'runner',
  },
  {
    id: 'char_street',
    name: 'Kai Graffiti',
    title: 'Subway Tag Champion',
    rarity: 'street',
    costType: 'coins',
    price: 3500,
    description: 'Armed with aerosol spray canisters and retro urban streetwear.',
    perkDescription: '+15% coin magnet range bonus.',
    multiplierBonus: 0.1,
    unlocked: false,
    colors: {
      primary: '#f97316', // Orange
      secondary: '#334155', // Charcoal
      accent: '#38bdf8', // Neon sky blue
      glow: '#fb923c',
    },
    styleType: 'street',
  },
  {
    id: 'char_neon',
    name: 'Blaze Matrix',
    title: 'Grid Overclocker',
    rarity: 'neon',
    costType: 'coins',
    price: 8000,
    description: 'Synthesized cyber-runner pulsing with luminescent fiber optics.',
    perkDescription: '+25% score multiplier during active run.',
    multiplierBonus: 0.25,
    unlocked: false,
    colors: {
      primary: '#ec4899', // Hot Pink
      secondary: '#0f172a', // Jet black
      accent: '#06b6d4', // Cyan
      glow: '#f43f5e',
    },
    styleType: 'cyber',
  },
  {
    id: 'char_robot',
    name: 'Unit Volt-9',
    title: 'Heavy Drone Sentinel',
    rarity: 'robot',
    costType: 'coins',
    price: 15000,
    description: 'Chassis forged from hardened carbon-titanium with dual plasma cores.',
    perkDescription: '+30% shield barrier duration from skateboards.',
    multiplierBonus: 0.3,
    unlocked: false,
    colors: {
      primary: '#94a3b8', // Brushed steel
      secondary: '#0284c7', // Energy blue
      accent: '#ef4444', // Red sensor
      glow: '#38bdf8',
    },
    styleType: 'robot',
  },
  {
    id: 'char_ninja',
    name: 'Shadow Kage',
    title: 'Neon Shinobi',
    rarity: 'ninja',
    costType: 'coins',
    price: 25000,
    description: 'Stealth infiltrator equipped with cyber-ninjato and supersonic footwear.',
    perkDescription: '+35% jump height and rapid lane slide recovery.',
    multiplierBonus: 0.35,
    unlocked: false,
    colors: {
      primary: '#111827', // Obsidian
      secondary: '#a855f7', // Cyber violet
      accent: '#4ade80', // Toxic green
      glow: '#c084fc',
    },
    styleType: 'ninja',
  },
  {
    id: 'char_space',
    name: 'Astro Nova',
    title: 'Cosmic Pioneer',
    rarity: 'space',
    costType: 'gems',
    price: 80,
    description: 'Zero-G astronaut explorer with ionized propulsion thrusters.',
    perkDescription: 'Spawn with 3 seconds of hover invulnerability.',
    multiplierBonus: 0.5,
    unlocked: false,
    colors: {
      primary: '#f8fafc', // Solar pearl white
      secondary: '#2563eb', // Royal space blue
      accent: '#fbbf24', // Gold solar visor
      glow: '#60a5fa',
    },
    styleType: 'space',
  },
  {
    id: 'char_legendary',
    name: 'Chrono Lord',
    title: 'Time Weave Sentinel',
    rarity: 'legendary',
    costType: 'gems',
    price: 250,
    description: 'Master of temporal rift mechanics, cloaked in shifting chronite armor.',
    perkDescription: '+100% (2x) base score multiplier & auto-coin vacuum.',
    multiplierBonus: 1.0,
    unlocked: false,
    colors: {
      primary: '#eab308', // Radiant gold
      secondary: '#581c87', // Royal void purple
      accent: '#06b6d4', // Temporal teal
      glow: '#fde047',
    },
    styleType: 'chrono',
  },
  {
    id: 'char_special',
    name: 'Solar Empress V',
    title: 'Neon Celestial Archon',
    rarity: 'special',
    costType: 'gems',
    price: 500,
    description: 'Supreme champion of the Neon Grid with prismatic crystalline wings.',
    perkDescription: 'Supreme 2.5x score bonus and golden trail shockwaves.',
    multiplierBonus: 1.5,
    unlocked: false,
    colors: {
      primary: '#f43f5e', // Ruby crimson
      secondary: '#fef08a', // Sun gold
      accent: '#a855f7', // Astral magenta
      glow: '#fb7185',
    },
    styleType: 'empress',
  },
];

export const SKATEBOARDS: SkateboardItem[] = [
  {
    id: 'board_classic',
    name: 'Classic Turbo',
    rarity: 'common',
    costType: 'coins',
    price: 0,
    description: 'Standard maple composite hoverdeck with magnetic levitators.',
    shieldDurationSec: 8,
    jumpMultiplier: 1.0,
    unlocked: true,
    colors: {
      deck: '#334155',
      stripe: '#06b6d4',
      wheels: '#0284c7',
      trailGlow: '#38bdf8',
    },
  },
  {
    id: 'board_neon',
    name: 'Neon Glide',
    rarity: 'rare',
    costType: 'coins',
    price: 4000,
    description: 'Aerodynamic plexi-deck equipped with pulsing turquoise underglow.',
    shieldDurationSec: 10,
    jumpMultiplier: 1.15,
    unlocked: false,
    colors: {
      deck: '#0f172a',
      stripe: '#10b981',
      wheels: '#34d399',
      trailGlow: '#10b981',
    },
  },
  {
    id: 'board_flame',
    name: 'Flame Striker',
    rarity: 'rare',
    costType: 'coins',
    price: 9000,
    description: 'Custom hot-rod thruster board that scorches the highway tarmac.',
    shieldDurationSec: 12,
    jumpMultiplier: 1.25,
    unlocked: false,
    colors: {
      deck: '#450a0a',
      stripe: '#f97316',
      wheels: '#ef4444',
      trailGlow: '#f97316',
    },
  },
  {
    id: 'board_galaxy',
    name: 'Galaxy Pulse',
    rarity: 'epic',
    costType: 'coins',
    price: 18000,
    description: 'Infused with starlight antimatter crystals and ultraviolet hover pads.',
    shieldDurationSec: 15,
    jumpMultiplier: 1.35,
    unlocked: false,
    colors: {
      deck: '#2e1065',
      stripe: '#c084fc',
      wheels: '#e879f9',
      trailGlow: '#a855f7',
    },
  },
  {
    id: 'board_cyber',
    name: 'Cyber Deck 2077',
    rarity: 'legendary',
    costType: 'gems',
    price: 120,
    description: 'Military-grade stealth deck with omni-directional magnetic vectoring.',
    shieldDurationSec: 18,
    jumpMultiplier: 1.5,
    unlocked: false,
    colors: {
      deck: '#09090b',
      stripe: '#06b6d4',
      wheels: '#e11d48',
      trailGlow: '#00f2fe',
    },
  },
  {
    id: 'board_golden',
    name: 'Golden Mythic',
    rarity: 'mythic',
    costType: 'gems',
    price: 350,
    description: 'Forged from 24-karat astral gold with eternal prismatic flame wake.',
    shieldDurationSec: 25,
    jumpMultiplier: 1.7,
    unlocked: false,
    colors: {
      deck: '#78350f',
      stripe: '#fde047',
      wheels: '#fbbf24',
      trailGlow: '#eab308',
    },
  },
];

export interface CharacterMeshHandle {
  root: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
  body: THREE.Group;
  backpack?: THREE.Mesh;
  wings?: THREE.Group;
  updateAnimation: (time: number, isRunning: boolean, isJumping: boolean, isSliding: boolean) => void;
}

/**
 * Creates an articulated 3D cartoon character mesh composed of 8-12 composite parts.
 * Grounded at bottom-center (feet at y = 0).
 */
export function createCharacterMesh(characterId: string): CharacterMeshHandle {
  const char = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const root = new THREE.Group();
  root.name = `character_${char.id}`;

  const primaryMat = new THREE.MeshStandardMaterial({
    color: char.colors.primary,
    roughness: 0.45,
    metalness: char.rarity === 'robot' || char.rarity === 'legendary' ? 0.8 : 0.2,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: char.colors.secondary,
    roughness: 0.7,
    metalness: 0.1,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: char.colors.accent,
    roughness: 0.15,
    metalness: 0.7,
    emissive: char.colors.accent,
    emissiveIntensity: 0.35,
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: char.colors.glow,
    roughness: 0.2,
    metalness: 0.3,
    emissive: char.colors.glow,
    emissiveIntensity: 0.6,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: char.styleType === 'robot' ? '#64748b' : '#fbcfe8',
    roughness: 0.6,
    metalness: char.styleType === 'robot' ? 0.7 : 0.05,
  });

  // Body container (pivots above hips)
  const body = new THREE.Group();
  body.position.set(0, 0.7, 0);
  root.add(body);

  // Torso / Jacket
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.55, 0.32);
  const torso = new THREE.Mesh(torsoGeo, primaryMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torso.position.set(0, 0.28, 0);
  body.add(torso);

  // Chest emblem / stripes
  const chestGeo = new THREE.BoxGeometry(0.4, 0.22, 0.04);
  const chestPlate = new THREE.Mesh(chestGeo, glowMat);
  chestPlate.position.set(0, 0.3, 0.17);
  body.add(chestPlate);

  // Collar
  const collarGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.1, 8);
  const collar = new THREE.Mesh(collarGeo, secondaryMat);
  collar.position.set(0, 0.58, 0);
  body.add(collar);

  // Head group
  const head = new THREE.Group();
  head.position.set(0, 0.78, 0);
  body.add(head);

  // Main cartoon head
  const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.38);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Helmet / Hair cap
  const hairGeo = new THREE.BoxGeometry(0.46, 0.26, 0.42);
  const hairMesh = new THREE.Mesh(hairGeo, secondaryMat);
  hairMesh.position.set(0, 0.14, -0.02);
  head.add(hairMesh);

  // Visor / Cyber Goggles
  const visorGeo = new THREE.BoxGeometry(0.38, 0.14, 0.12);
  const visor = new THREE.Mesh(visorGeo, accentMat);
  visor.position.set(0, 0.02, 0.18);
  head.add(visor);

  // Backpack / Cyber Thruster
  const backpackGeo = new THREE.BoxGeometry(0.38, 0.42, 0.18);
  const backpack = new THREE.Mesh(backpackGeo, secondaryMat);
  backpack.position.set(0, 0.28, -0.22);
  body.add(backpack);

  // Jet exhaust nozzles
  const jetGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8);
  const jetLeft = new THREE.Mesh(jetGeo, glowMat);
  jetLeft.rotation.x = Math.PI;
  jetLeft.position.set(-0.12, 0.12, -0.24);
  body.add(jetLeft);

  const jetRight = new THREE.Mesh(jetGeo, glowMat);
  jetRight.rotation.x = Math.PI;
  jetRight.position.set(0.12, 0.12, -0.24);
  body.add(jetRight);

  // Empress or Chrono special wings
  let wings: THREE.Group | undefined;
  if (char.styleType === 'empress' || char.styleType === 'chrono') {
    wings = new THREE.Group();
    const wingShape = new THREE.BoxGeometry(0.65, 0.15, 0.02);
    const wingL = new THREE.Mesh(wingShape, glowMat);
    wingL.position.set(-0.45, 0.4, -0.26);
    wingL.rotation.z = 0.35;
    const wingR = new THREE.Mesh(wingShape, glowMat);
    wingR.position.set(0.45, 0.4, -0.26);
    wingR.rotation.z = -0.35;
    wings.add(wingL, wingR);
    body.add(wings);
  }

  // Arms with pivot at shoulder
  const armGeo = new THREE.BoxGeometry(0.14, 0.5, 0.14);
  armGeo.translate(0, -0.22, 0); // Pivot at top shoulder

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.5, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, primaryMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  body.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 0.5, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, primaryMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  body.add(rightArm);

  // Legs with pivot at hip (y = 0.7)
  const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);
  legGeo.translate(0, -0.32, 0); // Pivot at hip, feet at y = 0

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.7, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, secondaryMat);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Sneaker foot
  const shoeGeo = new THREE.BoxGeometry(0.2, 0.14, 0.32);
  const shoeLeft = new THREE.Mesh(shoeGeo, glowMat);
  shoeLeft.position.set(0, -0.6, 0.06);
  shoeLeft.castShadow = true;
  leftLeg.add(shoeLeft);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.7, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, secondaryMat);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const shoeRight = new THREE.Mesh(shoeGeo, glowMat);
  shoeRight.position.set(0, -0.6, 0.06);
  shoeRight.castShadow = true;
  rightLeg.add(shoeRight);
  root.add(rightLeg);

  // Contact shadow disc at foot level
  const shadowGeo = new THREE.CircleGeometry(0.42, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.015;
  root.add(shadowDisc);

  // Animation driver
  const updateAnimation = (time: number, isRunning: boolean, isJumping: boolean, isSliding: boolean) => {
    if (isSliding) {
      // Crouch / slide pose
      body.position.y = 0.32;
      body.rotation.x = 0.85;
      leftLeg.rotation.x = -1.2;
      rightLeg.rotation.x = -1.1;
      leftArm.rotation.x = 0.8;
      rightArm.rotation.x = 0.8;
      head.rotation.x = -0.4;
      return;
    }

    if (isJumping) {
      // Jump pose
      body.position.y = 0.82;
      body.rotation.x = -0.15;
      leftLeg.rotation.x = 0.6;
      rightLeg.rotation.x = -0.4;
      leftArm.rotation.x = -1.6;
      rightArm.rotation.x = -1.5;
      head.rotation.x = -0.1;
      return;
    }

    if (isRunning) {
      // Dynamic run stride
      const strideSpeed = 16;
      const legAngle = Math.sin(time * strideSpeed) * 0.75;
      leftLeg.rotation.x = legAngle;
      rightLeg.rotation.x = -legAngle;

      leftArm.rotation.x = -legAngle * 0.9;
      rightArm.rotation.x = legAngle * 0.9;

      body.position.y = 0.7 + Math.abs(Math.sin(time * strideSpeed)) * 0.08;
      body.rotation.z = Math.sin(time * strideSpeed) * 0.04;
      head.rotation.y = -Math.sin(time * strideSpeed) * 0.05;

      if (wings) {
        wings.rotation.y = Math.sin(time * 12) * 0.2;
      }
    } else {
      // Idle turntable breathing
      body.position.y = 0.7 + Math.sin(time * 2.5) * 0.02;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = Math.sin(time * 2.5) * 0.08;
      rightArm.rotation.x = -Math.sin(time * 2.5) * 0.08;
      head.rotation.y = Math.sin(time * 1.2) * 0.15;
    }
  };

  return {
    root,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    head,
    body,
    backpack,
    wings,
    updateAnimation,
  };
}

/**
 * Creates a detailed 3D Skateboard hoverdeck model
 */
export function createSkateboardMesh(skateboardId: string): THREE.Group {
  const board = SKATEBOARDS.find((b) => b.id === skateboardId) || SKATEBOARDS[0];
  const group = new THREE.Group();
  group.name = `board_${board.id}`;

  const deckMat = new THREE.MeshStandardMaterial({
    color: board.colors.deck,
    roughness: 0.35,
    metalness: 0.5,
  });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: board.colors.stripe,
    roughness: 0.2,
    metalness: 0.3,
    emissive: board.colors.stripe,
    emissiveIntensity: 0.5,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: board.colors.wheels,
    roughness: 0.15,
    metalness: 0.8,
    emissive: board.colors.wheels,
    emissiveIntensity: 0.4,
  });

  // Skateboard curved deck
  const deckShape = new THREE.BoxGeometry(0.7, 0.06, 1.6);
  const deck = new THREE.Mesh(deckShape, deckMat);
  deck.castShadow = true;
  deck.position.set(0, 0.15, 0);
  group.add(deck);

  // Upturned nose & kicktail
  const noseGeo = new THREE.BoxGeometry(0.68, 0.06, 0.25);
  const nose = new THREE.Mesh(noseGeo, deckMat);
  nose.position.set(0, 0.2, 0.85);
  nose.rotation.x = -0.3;
  group.add(nose);

  const tail = new THREE.Mesh(noseGeo, deckMat);
  tail.position.set(0, 0.2, -0.85);
  tail.rotation.x = 0.3;
  group.add(tail);

  // Glowing racing stripe down center
  const stripeGeo = new THREE.BoxGeometry(0.18, 0.065, 1.55);
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.152, 0);
  group.add(stripe);

  // Trucks / magnetic hover generators
  const truckGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
  truckGeo.rotateZ(Math.PI / 2);

  const frontTruck = new THREE.Mesh(truckGeo, wheelMat);
  frontTruck.position.set(0, 0.08, 0.5);
  group.add(frontTruck);

  const rearTruck = new THREE.Mesh(truckGeo, wheelMat);
  rearTruck.position.set(0, 0.08, -0.5);
  group.add(rearTruck);

  // 4 glowing wheels
  const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  const w1 = new THREE.Mesh(wheelGeo, wheelMat);
  w1.position.set(0.35, 0.08, 0.5);
  const w2 = new THREE.Mesh(wheelGeo, wheelMat);
  w2.position.set(-0.35, 0.08, 0.5);
  const w3 = new THREE.Mesh(wheelGeo, wheelMat);
  w3.position.set(0.35, 0.08, -0.5);
  const w4 = new THREE.Mesh(wheelGeo, wheelMat);
  w4.position.set(-0.35, 0.08, -0.5);

  group.add(w1, w2, w3, w4);

  // Rear thruster exhaust glow
  const thrusterGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.15, 8);
  thrusterGeo.rotateX(Math.PI / 2);
  const thruster = new THREE.Mesh(thrusterGeo, stripeMat);
  thruster.position.set(0, 0.12, -0.9);
  group.add(thruster);

  return group;
}

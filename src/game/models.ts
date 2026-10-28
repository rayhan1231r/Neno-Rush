/**
 * NEON RUSH - 18 Characters (A-Z) & 6 Skateboards Factory
 * Matches master design sheet: Aiden, Bella, Cipher, Dino, Echo, Frost, Gizmo,
 * Hana, Ivy, Jax, Kira, Luna, Max, Nova, Orion, Pixel, Queen, Rex.
 * Skateboards: Classic, Neon Blade, Fire Storm, Galaxy Ride, Cyber Wave, Golden Legend.
 */

import * as THREE from 'three';
import { CharacterItem, SkateboardItem } from '../types/game';

export const CHARACTERS: CharacterItem[] = [
  {
    id: 'char_aiden',
    name: 'Aiden',
    title: 'Street Freestyle Prodigy',
    rarity: 'Common',
    costType: 'free',
    price: 0,
    description: 'Energetic urban skater with backward snapback cap and high-traction sneakers.',
    perkDescription: 'Standard balanced stats with +0% base coin bonus.',
    multiplierBonus: 0,
    unlocked: true,
    avatarIcon: '🧢',
    colors: { primary: '#0ea5e9', secondary: '#1e293b', accent: '#f59e0b', glow: '#38bdf8' },
    styleType: 'runner',
  },
  {
    id: 'char_bella',
    name: 'Bella',
    title: 'Synthwave Beats',
    rarity: 'Common',
    costType: 'coins',
    price: 5000,
    description: 'Grooving to high-BPM synth melodies with oversized neon headphones.',
    perkDescription: '+10% coin magnet attraction duration.',
    multiplierBonus: 0.05,
    unlocked: false,
    avatarIcon: '🎧',
    colors: { primary: '#ec4899', secondary: '#312e81', accent: '#a855f7', glow: '#f43f5e' },
    styleType: 'runner',
  },
  {
    id: 'char_cipher',
    name: 'Cipher',
    title: 'Grid Decryption Android',
    rarity: 'Rare',
    costType: 'coins',
    price: 20000,
    description: 'Sleek cobalt droid with illuminated holographic data visors.',
    perkDescription: '+15% coin magnet range bonus.',
    multiplierBonus: 0.15,
    unlocked: false,
    avatarIcon: '🤖',
    colors: { primary: '#2563eb', secondary: '#0f172a', accent: '#38bdf8', glow: '#60a5fa' },
    styleType: 'cyber',
  },
  {
    id: 'char_dino',
    name: 'Dino',
    title: 'Prehistoric Parkour',
    rarity: 'Rare',
    costType: 'coins',
    price: 35000,
    description: 'Charming green dinosaur hoodie runner with stomping jump recovery.',
    perkDescription: '+20% obstacle hit tolerance window.',
    multiplierBonus: 0.2,
    unlocked: false,
    avatarIcon: '🦖',
    colors: { primary: '#22c55e', secondary: '#14532d', accent: '#facc15', glow: '#4ade80' },
    styleType: 'dino',
  },
  {
    id: 'char_echo',
    name: 'Echo',
    title: 'Sonic Pulse Diver',
    rarity: 'Epic',
    costType: 'coins',
    price: 60000,
    description: 'High-altitude sky glider with acoustic jetpack fins.',
    perkDescription: '+25% score multiplier during active runs.',
    multiplierBonus: 0.25,
    unlocked: false,
    avatarIcon: '👧',
    colors: { primary: '#06b6d4', secondary: '#164e63', accent: '#f43f5e', glow: '#22d3ee' },
    styleType: 'runner',
  },
  {
    id: 'char_frost',
    name: 'Frost',
    title: 'Glacial Cryo Knight',
    rarity: 'Epic',
    costType: 'coins',
    price: 75000,
    description: 'Carved from diamond ice with freezing crystalline armor plates.',
    perkDescription: '+30% hover shield barrier duration.',
    multiplierBonus: 0.3,
    unlocked: false,
    avatarIcon: '❄️',
    colors: { primary: '#e0f2fe', secondary: '#0284c7', accent: '#38bdf8', glow: '#bae6fd' },
    styleType: 'ice',
  },
  {
    id: 'char_gizmo',
    name: 'Gizmo',
    title: 'Autonomous Tech Drone',
    rarity: 'Epic',
    costType: 'coins',
    price: 90000,
    description: 'Compact robotic companion with dual sensory antennas and rocket boots.',
    perkDescription: 'Auto-absorbs nearby magnets and 2x multipliers.',
    multiplierBonus: 0.35,
    unlocked: false,
    avatarIcon: '🦾',
    colors: { primary: '#94a3b8', secondary: '#1e293b', accent: '#38bdf8', glow: '#06b6d4' },
    styleType: 'robot',
  },
  {
    id: 'char_hana',
    name: 'Hana',
    title: 'Shadow Shinobi Infiltrator',
    rarity: 'Legendary',
    costType: 'coins',
    price: 120000,
    description: 'Silent cyber ninja master equipped with dual ninjato and smoke boots.',
    perkDescription: '+50% jump height and supersonic slide recovery.',
    multiplierBonus: 0.5,
    unlocked: false,
    avatarIcon: '🥷',
    colors: { primary: '#09090b', secondary: '#a855f7', accent: '#f43f5e', glow: '#c084fc' },
    styleType: 'ninja',
  },
  {
    id: 'char_ivy',
    name: 'Ivy',
    title: 'Bio-Grid Architect',
    rarity: 'Legendary',
    costType: 'coins',
    price: 140000,
    description: 'Futuristic botanical researcher with kinetic bioluminescent suit.',
    perkDescription: '+50% coin collection density in all environments.',
    multiplierBonus: 0.5,
    unlocked: false,
    avatarIcon: '🌿',
    colors: { primary: '#10b981', secondary: '#064e3b', accent: '#fbbf24', glow: '#34d399' },
    styleType: 'tech',
  },
  {
    id: 'char_jax',
    name: 'Jax',
    title: 'Subway Overclocker',
    rarity: 'Rare',
    costType: 'coins',
    price: 30000,
    description: 'The iconic high-speed subway surfer with turbocharged neon kicks.',
    perkDescription: '+15% base speed boost.',
    multiplierBonus: 0.15,
    unlocked: false,
    avatarIcon: '⚡',
    colors: { primary: '#0284c7', secondary: '#0f172a', accent: '#facc15', glow: '#38bdf8' },
    styleType: 'runner',
  },
  {
    id: 'char_kira',
    name: 'Kira',
    title: 'Alleyway Tag Queen',
    rarity: 'Epic',
    costType: 'coins',
    price: 65000,
    description: 'Armed with aerosol spray canisters and high-visibility street jacket.',
    perkDescription: '+30% point multiplier combo streak.',
    multiplierBonus: 0.3,
    unlocked: false,
    avatarIcon: '🎨',
    colors: { primary: '#f97316', secondary: '#334155', accent: '#38bdf8', glow: '#fb923c' },
    styleType: 'runner',
  },
  {
    id: 'char_luna',
    name: 'Luna',
    title: 'Prismatic Celestial Archon',
    rarity: 'Legendary',
    costType: 'coins',
    price: 150000,
    description: 'Supreme empress of the Neon Cosmos with astral wings and crown.',
    perkDescription: '+100% (2x) base score multiplier & gold trail wake.',
    multiplierBonus: 1.0,
    unlocked: false,
    avatarIcon: '👑',
    colors: { primary: '#ec4899', secondary: '#4c1d95', accent: '#fde047', glow: '#f472b6' },
    styleType: 'royal',
  },
  {
    id: 'char_max',
    name: 'Max',
    title: 'Marathon Striker',
    rarity: 'Common',
    costType: 'coins',
    price: 8000,
    description: 'Athletic track champion built for endurance long-distance grinds.',
    perkDescription: '+10% distance point scaling.',
    multiplierBonus: 0.1,
    unlocked: false,
    avatarIcon: '🏃',
    colors: { primary: '#ea580c', secondary: '#1c1917', accent: '#facc15', glow: '#fb923c' },
    styleType: 'runner',
  },
  {
    id: 'char_nova',
    name: 'Nova',
    title: 'Starlight Void Walker',
    rarity: 'Epic',
    costType: 'coins',
    price: 85000,
    description: 'Interstellar explorer with ionized purple plasma aura.',
    perkDescription: 'Starts each run with 5s of auto hover shield.',
    multiplierBonus: 0.35,
    unlocked: false,
    avatarIcon: '✨',
    colors: { primary: '#8b5cf6', secondary: '#2e1065', accent: '#06b6d4', glow: '#a78bfa' },
    styleType: 'space',
  },
  {
    id: 'char_orion',
    name: 'Orion',
    title: 'Demon Void Vanguard',
    rarity: 'Legendary',
    costType: 'gems',
    price: 250,
    description: 'Crimson cyber warrior adorned with demonic visor horns.',
    perkDescription: 'Destroys first collided obstacle per run without penalty.',
    multiplierBonus: 0.8,
    unlocked: false,
    avatarIcon: '👹',
    colors: { primary: '#dc2626', secondary: '#450a0a', accent: '#f97316', glow: '#ef4444' },
    styleType: 'ninja',
  },
  {
    id: 'char_pixel',
    name: 'Pixel',
    title: '8-Bit Retro Glitch',
    rarity: 'Rare',
    costType: 'coins',
    price: 60000,
    description: 'Digital holographic anomaly shifting in voxel retro space.',
    perkDescription: '+20% coin collection value.',
    multiplierBonus: 0.2,
    unlocked: false,
    avatarIcon: '👾',
    colors: { primary: '#06b6d4', secondary: '#3b82f6', accent: '#ec4899', glow: '#22d3ee' },
    styleType: 'cyber',
  },
  {
    id: 'char_queen',
    name: 'Queen',
    title: 'Solar Neon Empress',
    rarity: 'Legendary',
    costType: 'gems',
    price: 350,
    description: 'Sovereign ruler cloaked in regal violet and solar gold crowns.',
    perkDescription: '+120% score bonus and dual magnet aura.',
    multiplierBonus: 1.2,
    unlocked: false,
    avatarIcon: '👸',
    colors: { primary: '#7c3aed', secondary: '#2e1065', accent: '#f59e0b', glow: '#c084fc' },
    styleType: 'royal',
  },
  {
    id: 'char_rex',
    name: 'Rex',
    title: 'Cybernetic Beast',
    rarity: 'Epic',
    costType: 'coins',
    price: 80000,
    description: 'Armored reptilian champion built for bulldozing highway barriers.',
    perkDescription: '+40% score boost in Desert and Jungle tracks.',
    multiplierBonus: 0.4,
    unlocked: false,
    avatarIcon: '🦎',
    colors: { primary: '#ef4444', secondary: '#1e1b4b', accent: '#3b82f6', glow: '#f87171' },
    styleType: 'dino',
  },
];

export const SKATEBOARDS: SkateboardItem[] = [
  {
    id: 'board_classic',
    name: 'Classic',
    rarity: 'Common',
    costType: 'free',
    price: 0,
    description: 'The timeless wooden deck with yellow star emblem and hover trucks.',
    shieldDurationSec: 8,
    jumpMultiplier: 1.0,
    speedBonusPct: 0,
    unlocked: true,
    colors: { deck: '#334155', stripe: '#facc15', wheels: '#0284c7', trailGlow: '#38bdf8' },
  },
  {
    id: 'board_neon_blade',
    name: 'Neon Blade',
    rarity: 'Rare',
    costType: 'coins',
    price: 25000,
    description: 'Electrified blade contour that leaves a luminescent cyan trail.',
    shieldDurationSec: 12,
    jumpMultiplier: 1.2,
    speedBonusPct: 10,
    unlocked: false,
    colors: { deck: '#0f172a', stripe: '#06b6d4', wheels: '#38bdf8', trailGlow: '#00f2fe' },
  },
  {
    id: 'board_fire_storm',
    name: 'Fire Storm',
    rarity: 'Epic',
    costType: 'coins',
    price: 50000,
    description: 'Dual rocket afterburners scorching the pavement in blazing flames.',
    shieldDurationSec: 15,
    jumpMultiplier: 1.35,
    speedBonusPct: 15,
    unlocked: false,
    colors: { deck: '#450a0a', stripe: '#f97316', wheels: '#ef4444', trailGlow: '#ff5722' },
  },
  {
    id: 'board_galaxy_ride',
    name: 'Galaxy Ride',
    rarity: 'Epic',
    costType: 'coins',
    price: 75000,
    description: 'Cosmic deep space hoverdeck pulsing with ultraviolet stardust.',
    shieldDurationSec: 18,
    jumpMultiplier: 1.45,
    speedBonusPct: 20,
    unlocked: false,
    colors: { deck: '#2e1065', stripe: '#c084fc', wheels: '#e879f9', trailGlow: '#a855f7' },
  },
  {
    id: 'board_cyber_wave',
    name: 'Cyber Wave',
    rarity: 'Legendary',
    costType: 'coins',
    price: 110000,
    description: 'Circuit-etched aerodynamic deck with magnetic levitation coils.',
    shieldDurationSec: 22,
    jumpMultiplier: 1.6,
    speedBonusPct: 25,
    unlocked: false,
    colors: { deck: '#042f2e', stripe: '#14b8a6', wheels: '#2dd4bf', trailGlow: '#00e5ff' },
  },
  {
    id: 'board_golden_legend',
    name: 'Golden Legend',
    rarity: 'Legendary',
    costType: 'gems',
    price: 200,
    description: 'Forged from 24-karat astral gold with eternal prismatic shockwaves.',
    shieldDurationSec: 30,
    jumpMultiplier: 1.8,
    speedBonusPct: 35,
    unlocked: false,
    colors: { deck: '#78350f', stripe: '#fde047', wheels: '#fbbf24', trailGlow: '#ffd700' },
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
  boardGroup?: THREE.Group;
  updateAnimation: (time: number, isRunning: boolean, isJumping: boolean, isSliding: boolean, onSkateboard: boolean) => void;
}

/**
 * Creates an articulated 3D cartoon character mesh matching the reference visual style.
 */
export function createCharacterMesh(characterId: string, skateboardId?: string): CharacterMeshHandle {
  const char = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const root = new THREE.Group();
  root.name = `character_${char.id}`;

  const primaryMat = new THREE.MeshStandardMaterial({
    color: char.colors.primary,
    roughness: 0.4,
    metalness: char.rarity === 'Legendary' ? 0.6 : 0.2,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: char.colors.secondary,
    roughness: 0.7,
    metalness: 0.1,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: char.colors.accent,
    roughness: 0.2,
    metalness: 0.5,
    emissive: char.colors.accent,
    emissiveIntensity: 0.4,
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: char.colors.glow,
    roughness: 0.2,
    metalness: 0.3,
    emissive: char.colors.glow,
    emissiveIntensity: 0.7,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: char.styleType === 'robot' || char.styleType === 'cyber' ? '#94a3b8' : char.styleType === 'ice' ? '#bae6fd' : '#fcd34d',
    roughness: 0.6,
    metalness: char.styleType === 'robot' ? 0.8 : 0.05,
  });

  // Body container
  const body = new THREE.Group();
  body.position.set(0, 0.7, 0);
  root.add(body);

  // Torso / Cool Hoodie Jacket
  const torsoGeo = new THREE.BoxGeometry(0.58, 0.58, 0.34);
  const torso = new THREE.Mesh(torsoGeo, primaryMat);
  torso.castShadow = true;
  torso.position.set(0, 0.28, 0);
  body.add(torso);

  // Glowing zipper / chest logo
  const chestGeo = new THREE.BoxGeometry(0.42, 0.24, 0.04);
  const chestPlate = new THREE.Mesh(chestGeo, glowMat);
  chestPlate.position.set(0, 0.3, 0.18);
  body.add(chestPlate);

  // Head group
  const head = new THREE.Group();
  head.position.set(0, 0.82, 0);
  body.add(head);

  // Cartoon Head
  const headGeo = new THREE.BoxGeometry(0.44, 0.44, 0.4);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Distinct Style Headgear
  if (char.styleType === 'runner') {
    // Snapback Cap
    const capGeo = new THREE.BoxGeometry(0.48, 0.18, 0.44);
    const cap = new THREE.Mesh(capGeo, secondaryMat);
    cap.position.set(0, 0.18, -0.02);
    head.add(cap);

    const brimGeo = new THREE.BoxGeometry(0.42, 0.04, 0.22);
    const brim = new THREE.Mesh(brimGeo, accentMat);
    brim.position.set(0, 0.12, 0.3);
    head.add(brim);
  } else if (char.styleType === 'dino') {
    // Dinosaur Horns/Spikes
    for (let s = 0; s < 3; s++) {
      const spikeGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
      const spike = new THREE.Mesh(spikeGeo, accentMat);
      spike.position.set(0, 0.28, -0.15 + s * 0.15);
      spike.rotation.x = -0.2;
      head.add(spike);
    }
  } else if (char.styleType === 'ninja') {
    // Ninja Mask & Headband
    const bandGeo = new THREE.BoxGeometry(0.46, 0.12, 0.42);
    const band = new THREE.Mesh(bandGeo, glowMat);
    band.position.set(0, 0.14, 0);
    head.add(band);

    const maskGeo = new THREE.BoxGeometry(0.4, 0.18, 0.12);
    const mask = new THREE.Mesh(maskGeo, secondaryMat);
    mask.position.set(0, -0.1, 0.16);
    head.add(mask);
  } else if (char.styleType === 'royal') {
    // Crown
    const crownGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.16, 5);
    const crown = new THREE.Mesh(crownGeo, accentMat);
    crown.position.set(0, 0.3, 0);
    head.add(crown);
  } else {
    // Cyber Visor / Goggles
    const visorGeo = new THREE.BoxGeometry(0.4, 0.14, 0.14);
    const visor = new THREE.Mesh(visorGeo, accentMat);
    visor.position.set(0, 0.02, 0.18);
    head.add(visor);
  }

  // Backpack / Jet Thruster
  const backpackGeo = new THREE.BoxGeometry(0.4, 0.44, 0.18);
  const backpack = new THREE.Mesh(backpackGeo, secondaryMat);
  backpack.position.set(0, 0.28, -0.24);
  body.add(backpack);

  // Jet exhausts
  const jetGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8);
  jetGeo.rotateX(Math.PI);
  const jetL = new THREE.Mesh(jetGeo, glowMat);
  jetL.position.set(-0.12, 0.12, -0.26);
  const jetR = new THREE.Mesh(jetGeo, glowMat);
  jetR.position.set(0.12, 0.12, -0.26);
  body.add(jetL, jetR);

  // Arms (shoulder pivots)
  const armGeo = new THREE.BoxGeometry(0.15, 0.52, 0.15);
  armGeo.translate(0, -0.23, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36, 0.52, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, primaryMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  body.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.36, 0.52, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, primaryMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  body.add(rightArm);

  // Legs (hip pivots)
  const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);
  legGeo.translate(0, -0.32, 0);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.7, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, secondaryMat);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const shoeGeo = new THREE.BoxGeometry(0.2, 0.15, 0.32);
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

  // Attached Skateboard
  let boardGroup: THREE.Group | undefined;
  if (skateboardId) {
    boardGroup = createSkateboardMesh(skateboardId);
    boardGroup.position.set(0, -0.02, 0);
    root.add(boardGroup);
  }

  // Animation controller
  const updateAnimation = (
    time: number,
    isRunning: boolean,
    isJumping: boolean,
    isSliding: boolean,
    onSkateboard: boolean
  ) => {
    if (boardGroup) {
      boardGroup.visible = onSkateboard;
    }

    if (onSkateboard) {
      // Skateboard surfing pose
      body.position.y = 0.68;
      body.rotation.y = 0.35; // Sideways surf stance
      body.rotation.x = isSliding ? 0.7 : 0.05;

      leftLeg.rotation.x = 0.2;
      leftLeg.rotation.z = -0.15;
      rightLeg.rotation.x = -0.2;
      rightLeg.rotation.z = 0.15;

      leftArm.rotation.x = -0.5;
      leftArm.rotation.z = -0.4;
      rightArm.rotation.x = 0.5;
      rightArm.rotation.z = 0.4;

      head.rotation.y = -0.35;
      return;
    }

    if (isSliding) {
      body.position.y = 0.32;
      body.rotation.x = 0.85;
      body.rotation.y = 0;
      leftLeg.rotation.x = -1.2;
      rightLeg.rotation.x = -1.1;
      leftArm.rotation.x = 0.8;
      rightArm.rotation.x = 0.8;
      head.rotation.x = -0.4;
      return;
    }

    if (isJumping) {
      body.position.y = 0.84;
      body.rotation.x = -0.15;
      body.rotation.y = 0;
      leftLeg.rotation.x = 0.6;
      rightLeg.rotation.x = -0.4;
      leftArm.rotation.x = -1.6;
      rightArm.rotation.x = -1.5;
      head.rotation.x = -0.1;
      return;
    }

    if (isRunning) {
      const strideSpeed = 16;
      const legAngle = Math.sin(time * strideSpeed) * 0.75;
      body.rotation.y = 0;
      leftLeg.rotation.x = legAngle;
      rightLeg.rotation.x = -legAngle;
      leftLeg.rotation.z = 0;
      rightLeg.rotation.z = 0;

      leftArm.rotation.x = -legAngle * 0.9;
      rightArm.rotation.x = legAngle * 0.9;

      body.position.y = 0.7 + Math.abs(Math.sin(time * strideSpeed)) * 0.08;
      body.rotation.z = Math.sin(time * strideSpeed) * 0.04;
      head.rotation.y = -Math.sin(time * strideSpeed) * 0.05;
    } else {
      // Idle turntable breathing
      body.position.y = 0.7 + Math.sin(time * 2.5) * 0.02;
      body.rotation.y = 0;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftLeg.rotation.z = 0;
      rightLeg.rotation.z = 0;
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
    boardGroup,
    updateAnimation,
  };
}

/**
 * Creates a 3D Skateboard hoverdeck matching the reference designs.
 */
export function createSkateboardMesh(skateboardId: string): THREE.Group {
  const board = SKATEBOARDS.find((b) => b.id === skateboardId) || SKATEBOARDS[0];
  const group = new THREE.Group();
  group.name = `board_${board.id}`;

  const deckMat = new THREE.MeshStandardMaterial({
    color: board.colors.deck,
    roughness: 0.35,
    metalness: board.rarity === 'Legendary' ? 0.8 : 0.4,
  });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: board.colors.stripe,
    roughness: 0.2,
    metalness: 0.4,
    emissive: board.colors.stripe,
    emissiveIntensity: 0.8,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: board.colors.wheels,
    roughness: 0.2,
    metalness: 0.7,
    emissive: board.colors.wheels,
    emissiveIntensity: 0.5,
  });

  // Contoured Deck
  const deckShape = new THREE.BoxGeometry(0.72, 0.06, 1.7);
  const deck = new THREE.Mesh(deckShape, deckMat);
  deck.castShadow = true;
  deck.position.set(0, 0.14, 0);
  group.add(deck);

  // Nose and Kicktail
  const noseGeo = new THREE.BoxGeometry(0.7, 0.06, 0.26);
  const nose = new THREE.Mesh(noseGeo, deckMat);
  nose.position.set(0, 0.19, 0.9);
  nose.rotation.x = -0.32;
  group.add(nose);

  const tail = new THREE.Mesh(noseGeo, deckMat);
  tail.position.set(0, 0.19, -0.9);
  tail.rotation.x = 0.32;
  group.add(tail);

  // Glowing Racing Inlay Stripe
  const stripeGeo = new THREE.BoxGeometry(0.22, 0.065, 1.65);
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.142, 0);
  group.add(stripe);

  // 4 Glowing Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  const w1 = new THREE.Mesh(wheelGeo, wheelMat);
  w1.position.set(0.36, 0.08, 0.55);
  const w2 = new THREE.Mesh(wheelGeo, wheelMat);
  w2.position.set(-0.36, 0.08, 0.55);
  const w3 = new THREE.Mesh(wheelGeo, wheelMat);
  w3.position.set(0.36, 0.08, -0.55);
  const w4 = new THREE.Mesh(wheelGeo, wheelMat);
  w4.position.set(-0.36, 0.08, -0.55);
  group.add(w1, w2, w3, w4);

  // Rear Jet Thrusters
  const thrusterGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.2, 8);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterL = new THREE.Mesh(thrusterGeo, stripeMat);
  thrusterL.position.set(-0.16, 0.14, -0.95);
  const thrusterR = new THREE.Mesh(thrusterGeo, stripeMat);
  thrusterR.position.set(0.16, 0.14, -0.95);
  group.add(thrusterL, thrusterR);

  // Hover Glow Light
  const hoverLight = new THREE.PointLight(new THREE.Color(board.colors.trailGlow), 1.2, 3);
  hoverLight.position.set(0, 0.05, 0);
  group.add(hoverLight);

  return group;
}

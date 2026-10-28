/**
 * NEON RUSH - 6 In-Game 3D Environments
 * Matches the reference image: City, Beach, Snow, Desert, Night City, Jungle.
 * Each environment defines procedural landmarks, lighting, fog, and road textures.
 */

import * as THREE from 'three';
import { EnvironmentType } from '../types/game';
import { ENVIRONMENTS } from './rules';

export interface EnvironmentPreset {
  fogColor: number;
  skyColor: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  keyLightColor: number;
  roadMat: THREE.MeshStandardMaterial;
  railMat: THREE.MeshStandardMaterial;
  dividerMat: THREE.MeshStandardMaterial;
  createLandmark: (x: number, z: number, isLeft: boolean) => THREE.Object3D;
}

export function buildEnvironmentPreset(type: EnvironmentType): EnvironmentPreset {
  const env = ENVIRONMENTS.find((e) => e.id === type) || ENVIRONMENTS[0];

  switch (type) {
    case 'beach': {
      // Beach: Tropical palms, turquoise water, warm gold
      const roadMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8, metalness: 0.1 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x0d9488, emissiveIntensity: 0.7 });
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.6 });

      return {
        fogColor: 0x0b2430,
        skyColor: 0x0f2b38,
        hemiSkyColor: 0x38bdf8,
        hemiGroundColor: 0xd97706,
        keyLightColor: 0xffedd5,
        roadMat,
        railMat,
        dividerMat,
        createLandmark: (x, z, _isLeft) => {
          const group = new THREE.Group();
          // Palm trunk
          const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 9, 8);
          const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.set(x, 4.5, z);
          trunk.rotation.z = (Math.random() - 0.5) * 0.2;
          group.add(trunk);

          // Palm fronds
          const frondGeo = new THREE.BoxGeometry(0.4, 0.08, 4.5);
          const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
          for (let f = 0; f < 5; f++) {
            const frond = new THREE.Mesh(frondGeo, frondMat);
            frond.position.set(x, 8.8, z);
            frond.rotation.y = (f * Math.PI) / 2.5;
            frond.rotation.x = 0.35;
            group.add(frond);
          }
          return group;
        },
      };
    }

    case 'snow': {
      // Snow: Glacial pines, ice mountains, frosty blue
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.3 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0xbae6fd, emissiveIntensity: 0.9 });

      return {
        fogColor: 0x081220,
        skyColor: 0x0a1628,
        hemiSkyColor: 0xbae6fd,
        hemiGroundColor: 0x1e293b,
        keyLightColor: 0xf0f9ff,
        roadMat,
        railMat,
        dividerMat,
        createLandmark: (x, z, _isLeft) => {
          const group = new THREE.Group();
          // Snowy Pine Tree
          const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 4, 8);
          const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.set(x, 2, z);
          group.add(trunk);

          // 3 tiers of snowy pine needles
          const pineMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.6 });
          const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
          for (let t = 0; t < 3; t++) {
            const coneGeo = new THREE.ConeGeometry(3.5 - t * 0.8, 3.2, 7);
            const cone = new THREE.Mesh(coneGeo, t === 2 ? snowMat : pineMat);
            cone.position.set(x, 4 + t * 2.2, z);
            group.add(cone);
          }
          return group;
        },
      };
    }

    case 'desert': {
      // Desert: Canyon sandstone arches & mesas, warm amber sun
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7, metalness: 0.2 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 });
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.8 });

      return {
        fogColor: 0x201208,
        skyColor: 0x27170a,
        hemiSkyColor: 0xfde047,
        hemiGroundColor: 0x78350f,
        keyLightColor: 0xffedd5,
        roadMat,
        railMat,
        dividerMat,
        createLandmark: (x, z, _isLeft) => {
          const group = new THREE.Group();
          // Sandstone Mesa Rock
          const rockGeo = new THREE.BoxGeometry(7, 14 + Math.random() * 8, 7);
          const rockMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
          const rock = new THREE.Mesh(rockGeo, rockMat);
          rock.position.set(x, 7, z);
          group.add(rock);

          // Giant Saguaro Cactus
          const cactusGeo = new THREE.CylinderGeometry(0.35, 0.4, 6, 8);
          const cactusMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
          const cactus = new THREE.Mesh(cactusGeo, cactusMat);
          cactus.position.set(x * 0.8, 3, z + 5);
          group.add(cactus);
          return group;
        },
      };
    }

    case 'night_city': {
      // Night City: Midnight Cyberpunk, neon purple & magenta skyscrapers
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.3, metalness: 0.6 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 1.0 });
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 1.0 });

      return {
        fogColor: 0x080412,
        skyColor: 0x090514,
        hemiSkyColor: 0xc084fc,
        hemiGroundColor: 0x1e1b4b,
        keyLightColor: 0xf43f5e,
        roadMat,
        railMat,
        dividerMat,
        createLandmark: (x, z, _isLeft) => {
          const group = new THREE.Group();
          const towerGeo = new THREE.BoxGeometry(8, 35 + Math.random() * 40, 8);
          const towerMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5, metalness: 0.8 });
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.set(x, 18, z);
          group.add(tower);

          // Hologram billboard
          const holoGeo = new THREE.BoxGeometry(6.5, 4.5, 0.2);
          const holoMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xa855f7 : 0xec4899 });
          const holo = new THREE.Mesh(holoGeo, holoMat);
          holo.position.set(x + (_isLeft ? 2 : -2), 24, z);
          group.add(holo);
          return group;
        },
      };
    }

    case 'jungle': {
      // Jungle: Canopy ruins, giant rainforest trees, emerald glow
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.7, metalness: 0.2 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 });
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.9 });

      return {
        fogColor: 0x041610,
        skyColor: 0x051b14,
        hemiSkyColor: 0x6ee7b7,
        hemiGroundColor: 0x022c22,
        keyLightColor: 0xa7f3d0,
        roadMat,
        railMat,
        dividerMat,
        createLandmark: (x, z, _isLeft) => {
          const group = new THREE.Group();
          // Giant Jungle Tree
          const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 16, 8);
          const trunkMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.set(x, 8, z);
          group.add(trunk);

          // Canopy Leaves
          const leavesGeo = new THREE.SphereGeometry(4.5, 8, 8);
          const leavesMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.8 });
          const leaves = new THREE.Mesh(leavesGeo, leavesMat);
          leaves.position.set(x, 17, z);
          group.add(leaves);

          // Ancient Mayan/Cyber Stone Column
          const colGeo = new THREE.BoxGeometry(1.6, 6, 1.6);
          const colMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.8 });
          const col = new THREE.Mesh(colGeo, colMat);
          col.position.set(x * 0.7, 3, z + 6);
          group.add(col);
          return group;
        },
      };
    }

    case 'city':
    default: {
      // City: Sunset metropolis, cyan & pink highway
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6, metalness: 0.2 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.7 });
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.8 });

      return {
        fogColor: 0x0a0d20,
        skyColor: 0x0c0f24,
        hemiSkyColor: 0x38bdf8,
        hemiGroundColor: 0x1e1b4b,
        keyLightColor: 0xffedd5,
        roadMat,
        railMat,
        dividerMat,
        createLandmark: (x, z, _isLeft) => {
          const group = new THREE.Group();
          const towerGeo = new THREE.BoxGeometry(8, 25 + Math.random() * 35, 8);
          const towerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 });
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.set(x, 14, z);
          group.add(tower);

          const signGeo = new THREE.BoxGeometry(6.5, 3.5, 0.2);
          const signMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x06b6d4 : 0xf43f5e });
          const sign = new THREE.Mesh(signGeo, signMat);
          sign.position.set(x + (_isLeft ? 1.5 : -1.5), 18, z);
          group.add(sign);
          return group;
        },
      };
    }
  }
}

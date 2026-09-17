import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { getZoneColor } from './digitalTwinData';
import { farmBoundaryProps, recommendedCameraPos } from './farmConfigUtils';

/* ────────────────────────────────────────────────────────────────────
   Low-poly crop plant representations
   ──────────────────────────────────────────────────────────────────── */

function WheatPlant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.02, 0.02, 0.36, 4]} /><meshLambertMaterial color="#c8a000" /></mesh>
      <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.08, 4, 4]} /><meshLambertMaterial color="#d4a847" /></mesh>
    </group>
  );
}
function RicePlant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.015, 0.015, 0.44, 4]} /><meshLambertMaterial color="#6ab04c" /></mesh>
      <mesh position={[0.04, 0.46, 0]} rotation={[0, 0, 0.4]}><sphereGeometry args={[0.06, 4, 3]} /><meshLambertMaterial color="#7db87d" /></mesh>
    </group>
  );
}
function SugarcanePlant({ position }) {
  return (
    <group position={position}>
      {[0, 0.06, -0.06].map((ox, i) => (<mesh key={i} position={[ox, 0.35, 0]}><cylinderGeometry args={[0.03, 0.03, 0.7, 5]} /><meshLambertMaterial color="#8bc34a" /></mesh>))}
      <mesh position={[0, 0.72, 0]}><coneGeometry args={[0.08, 0.18, 5]} /><meshLambertMaterial color="#aed581" /></mesh>
    </group>
  );
}
function CottonPlant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}><sphereGeometry args={[0.16, 5, 4]} /><meshLambertMaterial color="#4caf50" /></mesh>
      {[[0.14, 0.28, 0], [-0.12, 0.32, 0.08], [0, 0.34, -0.12]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.05, 4, 4]} /><meshLambertMaterial color="#f5f5dc" /></mesh>
      ))}
    </group>
  );
}
function MaizePlant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.025, 0.04, 0.56, 5]} /><meshLambertMaterial color="#84cc16" /></mesh>
      <mesh position={[0, 0.6, 0]}><coneGeometry args={[0.06, 0.22, 5]} /><meshLambertMaterial color="#f59e0b" /></mesh>
    </group>
  );
}
function GenericPlant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.02, 0.02, 0.3, 4]} /><meshLambertMaterial color="#4ade80" /></mesh>
      <mesh position={[0, 0.35, 0]}><sphereGeometry args={[0.1, 4, 4]} /><meshLambertMaterial color="#6ab04c" /></mesh>
    </group>
  );
}

const CROP_PLANTS = {
  wheat: WheatPlant, rice: RicePlant, sugarcane: SugarcanePlant,
  cotton: CottonPlant, maize: MaizePlant,
};

/* ────────────────────────────────────────────────────────────────────
   CropZone — dynamic: size and position come from layout algorithm
   ──────────────────────────────────────────────────────────────────── */
function CropZone({ zone, viewMode, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const zoneColor = getZoneColor(zone, viewMode);
  const Plant = CROP_PLANTS[zone.cropType] || GenericPlant;

  // Scale plant count to zone width
  const zW = zone.size[0];
  const zD = zone.size[2];
  const plantCols = Math.max(1, Math.floor(zW / 1.4));
  const plantRows = Math.max(1, Math.floor(zD / 1.4));
  const plantOffsets = [];
  for (let r = 0; r < plantRows; r++) {
    for (let c = 0; c < plantCols; c++) {
      const px = -zW / 2 + (zW / (plantCols + 1)) * (c + 1);
      const pz = -zD / 2 + (zD / (plantRows + 1)) * (r + 1);
      plantOffsets.push([px, 0, pz]);
    }
  }

  useFrame(() => {
    if (meshRef.current) {
      const targetY = hovered || isSelected ? 0.04 : 0;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.12;
    }
  });

  return (
    <group position={zone.position}>
      <mesh
        ref={meshRef}
        receiveShadow
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onClick(zone); }}
      >
        <boxGeometry args={zone.size} />
        <meshLambertMaterial color={zoneColor} transparent opacity={hovered || isSelected ? 0.95 : 0.82} />
      </mesh>

      {(hovered || isSelected) && (
        <mesh>
          <boxGeometry args={[zone.size[0] + 0.12, zone.size[1] + 0.02, zone.size[2] + 0.12]} />
          <meshLambertMaterial color={isSelected ? '#ffffff' : '#a3e635'} transparent opacity={0.18} />
        </mesh>
      )}

      {plantOffsets.map((offset, i) => (
        <Plant key={i} position={[offset[0], zone.size[1] / 2, offset[2]]} />
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Dynamic farm paths — generated between zones
   ──────────────────────────────────────────────────────────────────── */
function DynamicFarmPaths({ farmW, farmD }) {
  return (
    <group>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[farmW * 2 + 1, 0.05, 0.75]} />
        <meshLambertMaterial color="#a0856a" />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[0.75, 0.05, farmD * 2 + 1]} />
        <meshLambertMaterial color="#a0856a" />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Dynamic water pond — sized relative to farm
   ──────────────────────────────────────────────────────────────────── */
function WaterPond({ farmW, farmD }) {
  const ref = useRef();
  const pondW = Math.max(farmW * 0.18, 1.5);
  const pondD = Math.max(farmD * 0.25, 2);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.opacity = 0.68 + Math.sin(clock.getElapsedTime() * 1.4) * 0.06;
  });
  return (
    <mesh ref={ref} position={[farmW + pondW * 0.3, 0.06, 0]} receiveShadow>
      <boxGeometry args={[pondW, 0.12, pondD]} />
      <meshLambertMaterial color="#38bdf8" transparent opacity={0.72} />
    </mesh>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Dynamic farm boundary fence
   ──────────────────────────────────────────────────────────────────── */
function DynamicFarmBoundary({ farmW, farmD }) {
  const postPositions = [];
  const step = Math.max(2, farmW / 5);
  for (let x = -farmW - 0.5; x <= farmW + 0.6; x += step) {
    postPositions.push([x, 0.25, -(farmD + 0.5)]);
    postPositions.push([x, 0.25,  (farmD + 0.5)]);
  }
  for (let z = -(farmD + 0.5); z <= farmD + 0.6; z += step) {
    postPositions.push([-(farmW + 0.5), 0.25, z]);
    postPositions.push([ (farmW + 0.5), 0.25, z]);
  }
  const railH = 0.44;
  const railThick = 0.06;
  const totalW = (farmW + 0.5) * 2;
  const totalD = (farmD + 0.5) * 2;
  return (
    <group>
      {postPositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 4]} />
          <meshLambertMaterial color="#78350f" />
        </mesh>
      ))}
      <mesh position={[0, railH, -(farmD + 0.5)]}><boxGeometry args={[totalW, railThick, railThick]} /><meshLambertMaterial color="#92400e" /></mesh>
      <mesh position={[0, railH,  (farmD + 0.5)]}><boxGeometry args={[totalW, railThick, railThick]} /><meshLambertMaterial color="#92400e" /></mesh>
      <mesh position={[-(farmW + 0.5), railH, 0]}><boxGeometry args={[railThick, railThick, totalD]} /><meshLambertMaterial color="#92400e" /></mesh>
      <mesh position={[ (farmW + 0.5), railH, 0]}><boxGeometry args={[railThick, railThick, totalD]} /><meshLambertMaterial color="#92400e" /></mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main FarmScene — now fully driven by props
   zones:      layoutZones() output
   totalArea:  farmer's configured total area
   controlsRef: forwarded OrbitControls ref
   ──────────────────────────────────────────────────────────────────── */
export default function FarmScene({ viewMode, selectedZone, onZoneClick, controlsRef, zones, totalArea }) {
  const { farmW, farmD } = farmBoundaryProps(totalArea || 10);
  const camPos = recommendedCameraPos(totalArea || 10);
  const groundSize = Math.max(farmW, farmD) * 4;

  return (
    <Canvas
      shadows
      camera={{ position: camPos, fov: 45 }}
      style={{ background: '#0f172a', borderRadius: 12 }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight castShadow position={[10, 18, 10]} intensity={1.1} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight skyColor="#c7d2fe" groundColor="#166534" intensity={0.3} />

      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshLambertMaterial color="#4a7c59" />
      </mesh>

      {/* Dynamic farm elements */}
      <DynamicFarmBoundary farmW={farmW} farmD={farmD} />
      <DynamicFarmPaths farmW={farmW} farmD={farmD} />
      <WaterPond farmW={farmW} farmD={farmD} />

      {/* Dynamic crop zones */}
      {zones.map(zone => (
        <CropZone
          key={zone.id}
          zone={zone}
          viewMode={viewMode}
          isSelected={selectedZone?.id === zone.id}
          onClick={onZoneClick}
        />
      ))}

      <Grid
        args={[groundSize * 0.9, groundSize * 0.9]}
        position={[0, 0, 0]}
        cellSize={Math.max(1.5, farmW / 8)}
        cellThickness={0.3}
        cellColor="#1e3a2f"
        sectionSize={Math.max(4, farmW / 3)}
        sectionThickness={0.6}
        sectionColor="#166534"
        fadeDistance={groundSize}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={3}
        maxDistance={Math.max(farmW, farmD) * 4}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

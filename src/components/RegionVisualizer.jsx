// RegionVisualizer.jsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

function AxisLabels({ xRange, yRange, zRange, step = 1 }) {
  const labels = [];

  for (let i = Math.floor(xRange[0]); i <= Math.ceil(xRange[1]); i += step) {
    labels.push(
      <Text
        key={`x${i}`}
        position={[i, 0, 0]}
        fontSize={0.22}
        color="#d90429"
        fontWeight="bold"
        outlineWidth={0.04}
        outlineColor="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {i}
      </Text>
    );
  }

  for (let i = Math.floor(yRange[0]); i <= Math.ceil(yRange[1]); i += step) {
    labels.push(
      <Text
        key={`y${i}`}
        position={[0, 0, i]}
        fontSize={0.22}
        color="#198754"
        fontWeight="bold"
        outlineWidth={0.04}
        outlineColor="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {i}
      </Text>
    );
  }

  for (let i = Math.floor(zRange[0]); i <= Math.ceil(zRange[1]); i += step) {
    labels.push(
      <Text
        key={`z${i}`}
        position={[0, i, 0]}
        fontSize={0.22}
        color="#1d4ed8"
        fontWeight="bold"
        outlineWidth={0.04}
        outlineColor="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {i}
      </Text>
    );
  }

  return labels;
}

function BoxFaces({ corners }) {
  // corners: массив из 8 углов параллелепипеда
  // Индексы углов:
  // 0: [x0, z00, y0]
  // 1: [x0, z01, y1]
  // 2: [x0, z10, y0]
  // 3: [x0, z11, y1]
  // 4: [x1, z00, y0]
  // 5: [x1, z01, y1]
  // 6: [x1, z10, y0]
  // 7: [x1, z11, y1]

  // Каждая грань задаётся четырьмя углами (всегда в одном порядке)
  const faces = [
    // x = x0 (левая)
    [0, 1, 3, 2],
    // x = x1 (правая)
    [4, 5, 7, 6],
    // y = y0 (нижняя)
    [0, 2, 6, 4],
    // y = y1 (верхняя)
    [1, 3, 7, 5],
    // z = z0 (передняя)
    [0, 1, 5, 4],
    // z = z1 (задняя)
    [2, 3, 7, 6],
  ];

  const colors = [
    "rgba(255,0,0,0.25)", // красная
    "rgba(0,255,0,0.25)", // зелёная
    "rgba(0,0,255,0.25)", // синяя
    "rgba(255,255,0,0.25)", // жёлтая
    "rgba(0,255,255,0.25)", // голубая
    "rgba(255,0,255,0.25)", // фиолетовая
  ];

  return (
    <>
      {faces.map((idxs, i) => (
        <mesh key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={
                new Float32Array([
                  ...corners[idxs[0]],
                  ...corners[idxs[1]],
                  ...corners[idxs[2]],
                  ...corners[idxs[0]],
                  ...corners[idxs[2]],
                  ...corners[idxs[3]],
                ])
              }
              count={6}
              itemSize={3}
            />
          </bufferGeometry>
          <meshBasicMaterial
            color={colors[i]}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

function IntegralVolume({ integralData, showContours, showColorFaces }) {
  try {
    const { xRange, yRange, zRange, density } = integralData;

    const steps = density || 20;
    const dx = (xRange[1] - xRange[0]) / steps;
    const points = [];

    // Границы области
    const edgeVertices = [];

    // Собираем точки для визуализации объёма
    for (let i = 0; i < steps; i++) {
      let x = xRange[0] + i * dx;
      let yMin, yMax;
      try {
        yMin = yRange[0](x);
        yMax = yRange[1](x);
      } catch (e) {
        continue;
      }
      const dy = (yMax - yMin) / steps;

      for (let j = 0; j < steps; j++) {
        let y = yMin + j * dy;
        let z1, z2;
        try {
          z1 = zRange[0](x, y);
          z2 = zRange[1](x, y);
        } catch (e) {
          continue;
        }
        const dz = (z2 - z1) / steps;

        for (let k = 0; k < steps; k++) {
          let z = z1 + k * dz;
          points.push(x, z, y);
        }
      }
    }

    // 8 углов: [x, z, y] (three.js: x, y, z)
    let x0 = xRange[0],
      x1 = xRange[1];
    let y0_x0, y1_x0, y0_x1, y1_x1;
    try {
      y0_x0 = yRange[0](x0);
      y1_x0 = yRange[1](x0);
      y0_x1 = yRange[0](x1);
      y1_x1 = yRange[1](x1);
    } catch (e) {
      y0_x0 = y1_x0 = y0_x1 = y1_x1 = 0;
    }

    const corners = [
      [x0, safeEval(() => zRange[0](x0, y0_x0)), y0_x0], // 0
      [x0, safeEval(() => zRange[0](x0, y1_x0)), y1_x0], // 1
      [x0, safeEval(() => zRange[1](x0, y0_x0)), y0_x0], // 2
      [x0, safeEval(() => zRange[1](x0, y1_x0)), y1_x0], // 3
      [x1, safeEval(() => zRange[0](x1, y0_x1)), y0_x1], // 4
      [x1, safeEval(() => zRange[0](x1, y1_x1)), y1_x1], // 5
      [x1, safeEval(() => zRange[1](x1, y0_x1)), y0_x1], // 6
      [x1, safeEval(() => zRange[1](x1, y1_x1)), y1_x1], // 7
    ];

    // Рёбра по x (4)
    edgeVertices.push(
      ...corners[0],
      ...corners[4],
      ...corners[1],
      ...corners[5],
      ...corners[2],
      ...corners[6],
      ...corners[3],
      ...corners[7]
    );
    // Рёбра по y (4)
    edgeVertices.push(
      ...corners[0],
      ...corners[1],
      ...corners[2],
      ...corners[3],
      ...corners[4],
      ...corners[5],
      ...corners[6],
      ...corners[7]
    );
    // Рёбра по z (4)
    edgeVertices.push(
      ...corners[0],
      ...corners[2],
      ...corners[1],
      ...corners[3],
      ...corners[4],
      ...corners[6],
      ...corners[5],
      ...corners[7]
    );

    const vertices = new Float32Array(points);
    const edgeArray = new Float32Array(edgeVertices);

    return (
      <>
        {/* Грани параллелепипеда разными цветами */}
        {showColorFaces && <BoxFaces corners={corners} />}
        {/* Точки объёма */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={vertices}
              count={points.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.03} color="blue" />
        </points>
        {/* Рёбра */}
        {showContours && (
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={edgeArray}
                count={edgeVertices.length / 3}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="black" linewidth={2} />
          </lineSegments>
        )}
      </>
    );
  } catch (err) {
    alert("Ошибка визуализации (IntegralVolume): " + (err && err.toString()));
    return (
      <group>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#b91c1c"
          fontWeight="bold"
          outlineWidth={0.07}
          outlineColor="#fff"
          anchorX="center"
          anchorY="middle"
        >
          Ошибка визуализации
        </Text>
      </group>
    );
  }
}

// Безопасный вызов функции, возвращает 0 при ошибке
function safeEval(fn) {
  try {
    return fn();
  } catch {
    return 0;
  }
}

export default function RegionVisualizer({
  integralData,
  showContours = true,
  showColorFaces = true,
}) {
  try {
    if (!integralData) return null;

    const { xRange, yRange, zRange, density = 20 } = integralData;
    const dx = (xRange[1] - xRange[0]) / density;

    // Определяем диапазоны осей
    const xMin = xRange[0];
    const xMax = xRange[1];
    let yMin, yMax, zMin, zMax;
    try {
      yMin = Math.min(
        ...[...Array(density)].map((_, i) => yRange[0](xMin + i * dx))
      );
      yMax = Math.max(
        ...[...Array(density)].map((_, i) => yRange[1](xMin + i * dx))
      );
      zMin = Math.min(
        ...[...Array(density)].map((_, i) =>
          zRange[0](xMin, yMin + (i * (yMax - yMin)) / density)
        )
      );
      zMax = Math.max(
        ...[...Array(density)].map((_, i) =>
          zRange[1](xMax, yMax - (i * (yMax - yMin)) / density)
        )
      );
    } catch {
      yMin = yMax = zMin = zMax = 0;
    }

    return (
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          minWidth: 160,
          minHeight: 120,
          background:
            "radial-gradient(ellipse at 60% 40%, #f0fdfa 60%, #e0e7ff 100%)",
          borderRadius: 18,
          boxShadow: "0 4px 24px 0 rgba(31, 38, 135, 0.10)",
          touchAction: "none",
        }}
        camera={{ position: [6, 6, 6], fov: 45 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 12, 8]}
          intensity={0.7}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[5, 5, 5]} intensity={0.3} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        {/* Оси и сетка */}
        <axesHelper args={[5]} />
        <gridHelper args={[5, 10]} position={[0, 0, 0]} />

        {/* Названия осей */}
        <Text
          position={[5.5, 0, 0]}
          fontSize={0.32}
          color="#6366f1"
          fontWeight="bold"
          outlineWidth={0.07}
          outlineColor="#fff"
          anchorX="center"
          anchorY="middle"
        >
          X
        </Text>
        <Text
          position={[0, 5.5, 0]}
          fontSize={0.32}
          color="#1d4ed8"
          fontWeight="bold"
          outlineWidth={0.07}
          outlineColor="#fff"
          anchorX="center"
          anchorY="middle"
        >
          Z
        </Text>
        <Text
          position={[0, 0, 5.5]}
          fontSize={0.32}
          color="#198754"
          fontWeight="bold"
          outlineWidth={0.07}
          outlineColor="#fff"
          anchorX="center"
          anchorY="middle"
        >
          Y
        </Text>
        {/* Подписи осей */}
        <AxisLabels
          xRange={xRange}
          yRange={[yMin, yMax]}
          zRange={[zMin, zMax]}
          step={1}
        />

        {/* Объем под графиком */}
        <IntegralVolume
          integralData={integralData}
          showContours={showContours}
          showColorFaces={showColorFaces}
        />
      </Canvas>
    );
  } catch (err) {
    alert("Ошибка визуализации (RegionVisualizer): " + (err && err.toString()));
    return (
      <div
        style={{
          color: "#b91c1c",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          margin: "40px auto",
          fontSize: 18,
          textAlign: "center",
        }}
      >
        <b>Ошибка визуализации.</b>
        <div style={{ marginTop: 10, fontSize: 15 }}>
          {err && err.toString()}
        </div>
      </div>
    );
  }
}

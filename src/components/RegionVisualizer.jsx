import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';

function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function AxisLabels({ length = 4, step = 1 }) {
  const labels = [];
  for (let i = 0; i <= length; i += step) {
    labels.push(
      <Text key={`x${i}`} position={[i, -0.1, 0]} fontSize={0.1} color="red">{i}</Text>,
      <Text key={`y${i}`} position={[-0.2, i, 0]} fontSize={0.1} color="green">{i}</Text>,
      <Text key={`z${i}`} position={[-0.2, 0, i]} fontSize={0.1} color="blue">{i}</Text>
    );
  }
  return labels;
}

export default function RegionVisualizer({ bounds }) {
  const { xMin, xMax, yMin, yMax, zMin, zMax } = bounds;
  const allNumeric = [xMin, xMax, yMin, yMax, zMin, zMax].every(isNumeric);

  return (
    <Canvas style={{ width: '500px', height: '500px', background: '#eef' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} />
      <OrbitControls />
      <axesHelper args={[5]} />
      <gridHelper args={[5, 10]} position={[0, 0, 0]} />

      {/* Подписи осей */}
      <Text position={[5.5, 0, 0]} fontSize={0.2} color="red">X</Text>
      <Text position={[0, 5.5, 0]} fontSize={0.2} color="green">Y</Text>
      <Text position={[0, 0, 5.5]} fontSize={0.2} color="blue">Z</Text>

      {/* Размерная шкала по осям */}
      <AxisLabels length={5} step={1} />

      {allNumeric ? (
        <mesh position={[
          (parseFloat(xMin) + parseFloat(xMax)) / 2,
          (parseFloat(yMin) + parseFloat(yMax)) / 2,
          (parseFloat(zMin) + parseFloat(zMax)) / 2,
        ]}>
          <boxGeometry args={[
            parseFloat(xMax) - parseFloat(xMin),
            parseFloat(yMax) - parseFloat(yMin),
            parseFloat(zMax) - parseFloat(zMin),
          ]} />
          <meshStandardMaterial color="skyblue" opacity={0.4} transparent />
        </mesh>
      ) : (
        <Html>
          <div style={{ color: 'red', background: 'white' }}>
            Область визуализируется только при числовых границах
          </div>
        </Html>
      )}
    </Canvas>
  );
}

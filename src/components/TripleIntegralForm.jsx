import React, { useState } from 'react';
import { create, all } from 'mathjs';

const math = create(all);

export default function TripleIntegralForm({ onResult }) {
  const [expression, setExpression] = useState('x*y*z');
  const [bounds, setBounds] = useState({
    xMin: '0', xMax: '1',
    yMin: '0', yMax: '1',
    zMin: '0', zMax: '1'
  });

  const handleChange = (e) => {
    setBounds({ ...bounds, [e.target.name]: e.target.value });
  };

  const computeIntegral = () => {
    const N = 200000;
    let sum = 0;
    let count = 0;

    const fExpr = math.parse(expression);
    const yMinExpr = math.parse(bounds.yMin);
    const yMaxExpr = math.parse(bounds.yMax);
    const zMinExpr = math.parse(bounds.zMin);
    const zMaxExpr = math.parse(bounds.zMax);

    const xMinExpr = math.parse(bounds.xMin);
    const xMaxExpr = math.parse(bounds.xMax);

    for (let i = 0; i < N; i++) {
      const xScope = {};
      let xMin = xMinExpr.evaluate(xScope);
      let xMax = xMaxExpr.evaluate(xScope);
      let signX = 1;
      if (xMin > xMax) {
        [xMin, xMax] = [xMax, xMin];
        signX = -1;
      }
      const x = xMin + Math.random() * (xMax - xMin);

      const yScope = { x };
      let yMin = yMinExpr.evaluate(yScope);
      let yMax = yMaxExpr.evaluate(yScope);
      let signY = 1;
      if (yMin > yMax) {
        [yMin, yMax] = [yMax, yMin];
        signY = -1;
      }
      const y = yMin + Math.random() * (yMax - yMin);

      const zScope = { x, y };
      let zMin = zMinExpr.evaluate(zScope);
      let zMax = zMaxExpr.evaluate(zScope);
      let signZ = 1;
      if (zMin > zMax) {
        [zMin, zMax] = [zMax, zMin];
        signZ = -1;
      }
      const z = zMin + Math.random() * (zMax - zMin);

      const scope = { x, y, z };
      const val = fExpr.evaluate(scope);
      sum += val * signX * signY * signZ;
      count++;
    //   console.log(
    //     xScope,
    //     yScope,
    //     zScope
    //   )
    //   console.log("SUM:", sum)
    }

    const integral = sum / count;
    onResult(integral.toFixed(6), bounds);
  };

  return (
    <div>
      <h3>Функция f(x, y, z)</h3>
      <input value={expression} onChange={e => setExpression(e.target.value)} />

      <h4>Пределы</h4>
      <input name="xMin" value={bounds.xMin} onChange={handleChange} placeholder="xMin" />
      <input name="xMax" value={bounds.xMax} onChange={handleChange} placeholder="xMax" />
      <input name="yMin" value={bounds.yMin} onChange={handleChange} placeholder="yMin" />
      <input name="yMax" value={bounds.yMax} onChange={handleChange} placeholder="yMax" />
      <input name="zMin" value={bounds.zMin} onChange={handleChange} placeholder="zMin" />
      <input name="zMax" value={bounds.zMax} onChange={handleChange} placeholder="zMax" />

      <br /><br />
      <button onClick={computeIntegral}>Вычислить</button>
    </div>
  );
}

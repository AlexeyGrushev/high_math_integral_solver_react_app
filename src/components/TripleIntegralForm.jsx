// TripleIntegralForm.jsx
import React, { useState, useEffect } from "react";

// Добавляем функцию для автоподстановки Math.*
function autoMath(expr) {
  // Список функций и констант Math
  const mathNames = [
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "atan2",
    "sinh",
    "cosh",
    "tanh",
    "asinh",
    "acosh",
    "atanh",
    "exp",
    "log",
    "log10",
    "log2",
    "sqrt",
    "cbrt",
    "abs",
    "min",
    "max",
    "pow",
    "floor",
    "ceil",
    "round",
    "trunc",
    "sign",
    "PI",
    "E",
    "LN2",
    "LN10",
    "LOG2E",
    "LOG10E",
    "SQRT1_2",
    "SQRT2",
  ];
  // Сначала для функций (с аргументом)
  mathNames.forEach((name) => {
    // Для функций: sin(x), sqrt(...), min(a,b) и т.д.
    expr = expr.replace(new RegExp(`\\b${name}\\s*\\(`, "g"), `Math.${name}(`);
  });
  // Для констант (PI, E и т.д.), только если не уже Math.*
  mathNames.forEach((name) => {
    expr = expr.replace(
      new RegExp(`\\b${name}\\b`, "g"),
      (match, offset, string) => {
        // Не заменять если уже Math.*
        if (offset > 5 && string.slice(offset - 5, offset) === "Math.") {
          return match;
        }
        // Не заменять если это функция (уже обработано выше)
        if (string[offset + name.length] === "(") {
          return match;
        }
        return `Math.${match}`;
      }
    );
  });
  return expr;
}

// Вставляет знак умножения между числом и переменной (2x -> 2*x, 3xy -> 3*x*y)
function insertImplicitMultiplication(expr) {
  // 1. Между числом и переменной: 2x -> 2*x
  expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
  // 2. Между переменной и переменной: x y -> x*y
  expr = expr.replace(/([a-zA-Z])\s+([a-zA-Z])/g, "$1*$2");
  // 3. Между закрывающей скобкой и переменной: )x -> )*x
  expr = expr.replace(/(\))([a-zA-Z])/g, "$1*$2");
  // 4. Между переменной и открывающей скобкой: x( -> x*(
  expr = expr.replace(/([a-zA-Z])(\()/g, "$1*$2");
  // 5. Между числом и открывающей скобкой: 2( -> 2*(
  expr = expr.replace(/(\d)(\()/g, "$1*$2");
  return expr;
}

// Оборачивает выражение в функцию (если это число — возвращает константную функцию)
function wrapToFunction(expr, args = ["x"]) {
  // Если expr уже функция — вернуть как есть
  if (typeof expr === "function") return expr;
  // Если expr уже число — вернуть константную функцию
  if (typeof expr === "number") {
    if (args.length === 1) return () => expr;
    if (args.length === 2) return () => expr;
    return () => expr;
  }
  // Привести к строке (на случай если expr не строка)
  const trimmed = (expr ?? "").toString().trim();
  // Проверяем, является ли выражение числом
  if (/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(trimmed)) {
    if (args.length === 1) return () => Number(trimmed);
    if (args.length === 2) return () => Number(trimmed);
    return () => Number(trimmed);
  }
  // Подготовка выражения: вставить умножения
  const prepared = insertImplicitMultiplication(trimmed);
  // Иначе возвращаем функцию, вычисляющую выражение
  if (args.length === 1) {
    return (x) => eval(`(${autoMath(prepared).replace(/x/g, `(${x})`)})`);
  }
  if (args.length === 2) {
    return (x, y) =>
      eval(
        `(${autoMath(prepared)
          .replace(/x/g, `(${x})`)
          .replace(/y/g, `(${y})`)})`
      );
  }
  // Гарантия: если что-то пошло не так, вернуть константную функцию
  return () => Number(trimmed);
}

export default function TripleIntegralForm({ onIntegralSubmit, initialFormData }) {
  const [formData, setFormData] = useState({
    a: "0",
    b: "1",
    g1: "0",
    g2: "1",
    u1: "0",
    u2: "x * x + y * y",
    density: "20",
  });

  // Если initialFormData меняется (например, при открытии по ссылке), обновить поля формы
  useEffect(() => {
    if (initialFormData) {
      setFormData({
        a: initialFormData.a ?? "0",
        b: initialFormData.b ?? "1",
        g1: initialFormData.g1 ?? "0",
        g2: initialFormData.g2 ?? "1",
        u1: initialFormData.u1 ?? "0",
        u2: initialFormData.u2 ?? "x * x + y * y",
        density: initialFormData.density ?? "20",
      });
    }
  }, [initialFormData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Преобразуем строки в функции с автоподстановкой Math.*
      let xRangeA, xRangeB, y1, y2, u1, u2;
      try {
        xRangeA = eval(`(${formData.a})`);
        xRangeB = eval(`(${formData.b})`);
        y1 = wrapToFunction(formData.g1, ["x"]);
        y2 = wrapToFunction(formData.g2, ["x"]);
        u1 = wrapToFunction(formData.u1, ["x", "y"]);
        u2 = wrapToFunction(formData.u2, ["x", "y"]);
      } catch (err) {
        alert("Ошибка в выражении функции или диапазонах: " + (err && err.toString()));
        return;
      }
      const integralData = {
        xRange: [xRangeA, xRangeB],
        yRange: [y1, y2],
        zRange: [u1, u2],
        density: parseInt(formData.density),
      };
      onIntegralSubmit(integralData, formData); // <-- передаем formData вторым аргументом
    } catch (err) {
      alert("Ошибка в выражении функции или диапазонах: " + (err && err.toString()));
    }
  };

  return (
    <form className="triple-integral-form" onSubmit={handleSubmit}>
      <h3>Тройной интеграл</h3>
      <label>
        a =
        <input
          value={formData.a}
          onChange={(e) => setFormData({ ...formData, a: e.target.value })}
        />
      </label>
      <label>
        b =
        <input
          value={formData.b}
          onChange={(e) => setFormData({ ...formData, b: e.target.value })}
        />
      </label>
      <label>
        g<sub>1</sub>(x) =
        <input
          value={formData.g1}
          onChange={(e) => setFormData({ ...formData, g1: e.target.value })}
        />
      </label>
      <label>
        g<sub>2</sub>(x) =
        <input
          value={formData.g2}
          onChange={(e) => setFormData({ ...formData, g2: e.target.value })}
        />
      </label>
      <label>
        u<sub>1</sub>(x, y) =
        <input
          value={formData.u1}
          onChange={(e) => setFormData({ ...formData, u1: e.target.value })}
        />
      </label>
      <label>
        u<sub>2</sub>(x, y) =
        <input
          value={formData.u2}
          onChange={(e) => setFormData({ ...formData, u2: e.target.value })}
        />
      </label>
      <label>
        density =
        <input
          type="number"
          value={formData.density}
          onChange={(e) =>
            setFormData({ ...formData, density: e.target.value })
          }
        />
      </label>
      <button type="submit">Показать объем</button>
    </form>
  );
}

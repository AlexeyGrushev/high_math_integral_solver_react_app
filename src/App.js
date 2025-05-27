// App.js
import React, { useState } from "react";
import TripleIntegralForm from "./components/TripleIntegralForm";
import RegionVisualizer from "./components/RegionVisualizer";
import "./index.css"; // добавлено

function InstructionModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="instruction-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="instruction-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="instruction-modal-close"
          aria-label="Закрыть"
        >
          ×
        </button>
        <h2
          style={{
            marginTop: 0,
            color: "#3730a3",
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          Инструкция по вводу функций
        </h2>
        <div style={{ fontSize: 16, color: "#222", lineHeight: 1.7 }}>
          <b>Формулы вводятся на JavaScript:</b>
          <ul style={{ margin: "10px 0 0 18px", padding: 0 }}>
            <li>
              <b>Степень:</b> <code>x**2</code> (квадрат), <code>x**3</code>{" "}
              (куб)
            </li>
            <li>
              <b>Корень:</b> <code>Math.sqrt(x)</code> (квадратный),{" "}
              <code>Math.cbrt(x)</code> (кубический)
            </li>
            <li>
              <b>Синус:</b> <code>Math.sin(x)</code>
            </li>
            <li>
              <b>Косинус:</b> <code>Math.cos(x)</code>
            </li>
            <li>
              <b>Тангенс:</b> <code>Math.tan(x)</code>
            </li>
            <li>
              <b>Арксинус:</b> <code>Math.asin(x)</code>
            </li>
            <li>
              <b>Арккосинус:</b> <code>Math.acos(x)</code>
            </li>
            <li>
              <b>Арктангенс:</b> <code>Math.atan(x)</code>
            </li>
            <li>
              <b>Экспонента:</b> <code>Math.exp(x)</code>
            </li>
            <li>
              <b>Логарифм:</b> <code>Math.log(x)</code> (натуральный),{" "}
              <code>Math.log10(x)</code> (десятичный)
            </li>
            <li>
              <b>Число π:</b> <code>Math.PI</code>
            </li>
            <li>
              <b>Модуль:</b> <code>Math.abs(x)</code>
            </li>
            <li>
              <b>Минимум/максимум:</b> <code>Math.min(a, b)</code>,{" "}
              <code>Math.max(a, b)</code>
            </li>
          </ul>
          <div style={{ marginTop: 10 }}>
            <b>Примеры:</b>
            <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
              <li>
                <code>Math.sqrt(1 - x**2)</code> — верхняя полусфера
              </li>
              <li>
                <code>Math.sin(x) + y**2</code> — функция от x и y
              </li>
              <li>
                <code>-(1-x**2)**0.5</code> — нижняя полусфера
              </li>
              <li>
                <code>Math.PI/2</code> — константа π/2
              </li>
            </ul>
          </div>
          <div style={{ marginTop: 10, color: "#444", fontSize: 14 }}>
            <b>Внимание:</b> используйте <b>x</b> и <b>y</b> как переменные.
            <br />
            Все функции пишутся на <b>JavaScript</b>!<br />
            <b>Пример:</b> <code>Math.sqrt(x*x + y*y)</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Boundary для перехвата ошибок в дочерних компонентах
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    alert("Ошибка отображения (ErrorBoundary): " + (error && error.toString()));
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Можно логировать ошибку на сервер
    alert("Ошибка отображения (ErrorBoundary): " + (error && error.toString()));
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            color: "#b91c1c",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            margin: "40px auto",
            fontSize: 18,
            textAlign: "center",
          }}
        >
          <b>Произошла ошибка при отображении.</b>
          <div style={{ marginTop: 10, fontSize: 15 }}>
            {this.state.error && this.state.error.toString()}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#7f1d1d" }}>
            Попробуйте изменить параметры или перезагрузить страницу.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Добавить функции для работы с query string ---
function serializeIntegralData(data) {
  // Преобразует объект integralData в query string
  if (!data) return "";
  const params = new URLSearchParams();
  params.set("a", data.xRange?.[0]);
  params.set("b", data.xRange?.[1]);
  params.set("g1", data.yRange?.[0]?.src || "");
  params.set("g2", data.yRange?.[1]?.src || "");
  params.set("u1", data.zRange?.[0]?.src || "");
  params.set("u2", data.zRange?.[1]?.src || "");
  params.set("density", data.density);
  return params.toString();
}

function parseIntegralDataFromQuery(query) {
  // Преобразует query string в объект integralData (строки, не функции!)
  const params = new URLSearchParams(query);
  const a = params.get("a");
  const b = params.get("b");
  const g1 = params.get("g1");
  const g2 = params.get("g2");
  const u1 = params.get("u1");
  const u2 = params.get("u2");
  const density = params.get("density");
  if (
    [a, b, g1, g2, u1, u2].some((v) => v === null || v === undefined)
  ) {
    return null;
  }
  return {
    a,
    b,
    g1,
    g2,
    u1,
    u2,
    density: density || "20",
  };
}

function App() {
  const [integralData, setIntegralData] = useState(null);
  const [formData, setFormData] = useState(null); // <--- добавлено
  const [showContours, setShowContours] = useState(true);
  const [showColorFaces, setShowColorFaces] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // --- При монтировании: если есть параметры в URL, строим фигуру ---
  React.useEffect(() => {
    const parsed = parseIntegralDataFromQuery(window.location.search);
    if (parsed) {
      // Преобразуем в формат для TripleIntegralForm
      // TripleIntegralForm ожидает строки, а не функции
      // handleIntegralSubmit ожидает integralData с функциями, поэтому используем ту же логику, что и в TripleIntegralForm
      try {
        // Импортируем wrapToFunction из TripleIntegralForm
        // (или дублируем здесь, если не экспортируется)
        // Для краткости, дублируем минимально необходимое:
        function autoMath(expr) {
          const mathNames = [
            "sin","cos","tan","asin","acos","atan","atan2","sinh","cosh","tanh","asinh","acosh","atanh","exp","log","log10","log2","sqrt","cbrt","abs","min","max","pow","floor","ceil","round","trunc","sign","PI","E","LN2","LN10","LOG2E","LOG10E","SQRT1_2","SQRT2",
          ];
          mathNames.forEach((name) => {
            expr = expr.replace(new RegExp(`\\b${name}\\s*\\(`, "g"), `Math.${name}(`);
          });
          mathNames.forEach((name) => {
            expr = expr.replace(
              new RegExp(`\\b${name}\\b`, "g"),
              (match, offset, string) => {
                if (offset > 5 && string.slice(offset - 5, offset) === "Math.") return match;
                if (string[offset + name.length] === "(") return match;
                return `Math.${match}`;
              }
            );
          });
          return expr;
        }
        function insertImplicitMultiplication(expr) {
          expr = expr.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
          expr = expr.replace(/([a-zA-Z])\s+([a-zA-Z])/g, "$1*$2");
          expr = expr.replace(/(\))([a-zA-Z])/g, "$1*$2");
          expr = expr.replace(/([a-zA-Z])(\()/g, "$1*$2");
          expr = expr.replace(/(\d)(\()/g, "$1*$2");
          return expr;
        }
        function wrapToFunction(expr, args = ["x"]) {
          if (typeof expr === "function") return expr;
          if (typeof expr === "number") return () => expr;
          const trimmed = (expr ?? "").toString().trim();
          if (/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(trimmed)) return () => Number(trimmed);
          const prepared = insertImplicitMultiplication(trimmed);
          if (args.length === 1) {
            const fn = (x) => eval(`(${autoMath(prepared).replace(/x/g, `(${x})`)})`);
            fn.src = expr;
            return fn;
          }
          if (args.length === 2) {
            const fn = (x, y) =>
              eval(
                `(${autoMath(prepared)
                  .replace(/x/g, `(${x})`)
                  .replace(/y/g, `(${y})`)})`
              );
            fn.src = expr;
            return fn;
          }
          return () => Number(trimmed);
        }
        const xRangeA = eval(`(${parsed.a})`);
        const xRangeB = eval(`(${parsed.b})`);
        const y1 = wrapToFunction(parsed.g1, ["x"]);
        const y2 = wrapToFunction(parsed.g2, ["x"]);
        const u1 = wrapToFunction(parsed.u1, ["x", "y"]);
        const u2 = wrapToFunction(parsed.u2, ["x", "y"]);
        setIntegralData({
          xRange: [xRangeA, xRangeB],
          yRange: [y1, y2],
          zRange: [u1, u2],
          density: parseInt(parsed.density),
        });
        setFormData(parsed); // <--- сохраняем значения для формы
      } catch (err) {
        alert("Ошибка разбора параметров из URL: " + (err && err.toString()));
        // ignore parse errors
      }
    }
  }, []);

  // --- handleIntegralSubmit: обновлять URL при отправке формы ---
  const handleIntegralSubmit = (data, rawFormData) => {
    setIntegralData(null);
    setTimeout(() => setIntegralData(data), 0);
    setFormData(rawFormData); // <--- обновляем значения для формы
    // Обновить URL
    // rawFormData: {a, b, g1, g2, u1, u2, density}
    const params = new URLSearchParams({
      a: rawFormData?.a ?? "",
      b: rawFormData?.b ?? "",
      g1: rawFormData?.g1 ?? "",
      g2: rawFormData?.g2 ?? "",
      u1: rawFormData?.u1 ?? "",
      u2: rawFormData?.u2 ?? "",
      density: rawFormData?.density ?? "20",
    });
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, Arial, sans-serif",
        padding: 0,
        flexDirection: "column",
        width: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <header className="main-header">
        <div className="main-header-title">
          Тройной интеграл — 3D визуализация
        </div>
        <a
          className="main-header-github"
          href="https://github.com/AlexeyGrushev/high_math_integral_solver_react_app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub репозиторий"
        >
          {/* SVG GitHub logo */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ display: "block" }}
          >
            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
          </svg>
        </a>
      </header>
      <ErrorBoundary>
        <div className="main-flex">
          <div className="canvas-block">
            <RegionVisualizer
              integralData={integralData}
              showContours={showContours}
              showColorFaces={showColorFaces}
            />
          </div>
          <div className="side-panel">
            {/* Картинка с пояснениями */}
            <div
              style={{
                background: "rgba(245,245,255,0.85)",
                borderRadius: 16,
                boxShadow: "0 2px 12px 0 rgba(31, 38, 135, 0.07)",
                padding: 16,
                marginBottom: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: 400,
              }}
            >
              <img
                src={require("./integral_example.png")}
                alt="Тройной интеграл"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  marginBottom: 8,
                  borderRadius: 8,
                  background: "#eee",
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  color: "#444",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                <b>Как вписывать значения:</b>
                <br />
                <span>
                  <b>a</b>, <b>b</b> — пределы по <b>x</b>;<br />
                  <b>g₁(x)</b>, <b>g₂(x)</b> — пределы по <b>y</b> (функции от
                  x);
                  <br />
                  <b>u₁(x, y)</b>, <b>u₂(x, y)</b> — пределы по <b>z</b>{" "}
                  (функции от x и y).
                  <br />
                  <b>density</b> — плотность точек для построения.
                  <br />
                  Все функции вводятся на JavaScript (например:{" "}
                  <code>-(1-x**2)**0.5</code>).
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: 1,
                    boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)",
                    cursor: "pointer",
                    transition: "background 0.2s, box-shadow 0.2s",
                    minWidth: 170,
                  }}
                >
                  Инструкция
                </button>
                <CopyLinkButton />
              </div>
            </div>
            <TripleIntegralForm
              onIntegralSubmit={handleIntegralSubmit}
              initialFormData={formData}
            />
            <div style={{ marginTop: 10 }}>
              <label>
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={(e) => setShowContours(e.target.checked)}
                />
                Показывать контуры
              </label>
              <br />
              <label>
                <input
                  type="checkbox"
                  checked={showColorFaces}
                  onChange={(e) => setShowColorFaces(e.target.checked)}
                />
                Показывать цветные плоскости
              </label>
            </div>
          </div>
        </div>
      </ErrorBoundary>
      <InstructionModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

// --- Кнопка для копирования ссылки ---
function CopyLinkButton() {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: "7px 18px",
        borderRadius: 8,
        border: "none",
        background: "linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)",
        color: "#fff",
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: 1,
        boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)",
        cursor: "pointer",
        transition: "background 0.2s, box-shadow 0.2s",
        minWidth: 170,
      }}
      aria-label="Скопировать ссылку на этот график"
    >
      {copied ? "Ссылка скопирована!" : "Скопировать ссылку"}
    </button>
  );
}

export default App;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const GraphPlotter: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functionStr, setFunctionStr] = useState("x^2");
  const [error, setError] = useState("");
  const [range, setRange] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });
  const [, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [evaluationPoint, setEvaluationPoint] = useState<{ x: number; y: number | null } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    plotFunction();
  }, [functionStr, range]);

  const evaluateFunction = useCallback((x: number): number | null => {
    try {
      let expr = functionStr
        .replace(/\^/g, "**")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/π/g, "Math.PI")
        .replace(/pi/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/floor\(/g, "Math.floor(")
        .replace(/ceil\(/g, "Math.ceil(");

      // eslint-disable-next-line no-new-func
      const result = Function("x", "return " + expr)(x);

      if (isNaN(result) || !isFinite(result)) return null;
      return result;
    } catch {
      return null;
    }
  }, [functionStr]);

  const plotFunction = useCallback(() => {
    try {
      setError("");
      const newPoints: { x: number; y: number }[] = [];
      const step = (range.xMax - range.xMin) / 1000;

      for (let x = range.xMin; x <= range.xMax; x += step) {
        const y = evaluateFunction(x);
        if (y !== null) {
          newPoints.push({ x, y });
        }
      }

      setPoints(newPoints);
      drawGraph(newPoints);
    } catch {
      setError("Erreur dans la fonction");
    }
  }, [range, evaluateFunction]);

  const drawGraph = useCallback((points: { x: number; y: number }[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with anti-aliasing
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const width = rect.width;
    const height = rect.height;

    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw grid with better styling
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    const xStep = (range.xMax - range.xMin) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = range.xMin + i * xStep;
      const canvasX = ((x - range.xMin) / (range.xMax - range.xMin)) * width;

      ctx.beginPath();
      ctx.strokeStyle = i === 5 ? "#cbd5e1" : "#e2e8f0";
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();

      // X-axis labels
      ctx.fillStyle = "#475569";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(x.toFixed(1), canvasX, height - 8);
    }

    // Horizontal grid lines
    const yStep = (range.yMax - range.yMin) / 10;
    for (let i = 0; i <= 10; i++) {
      const y = range.yMin + i * yStep;
      const canvasY = height - ((y - range.yMin) / (range.yMax - range.yMin)) * height;

      ctx.beginPath();
      ctx.strokeStyle = i === 5 ? "#cbd5e1" : "#e2e8f0";
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "#475569";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(y.toFixed(1), width - 8, canvasY - 4);
    }

    // Draw axes with better styling
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;

    // X-axis
    const xAxisY = height - ((0 - range.yMin) / (range.yMax - range.yMin)) * height;
    if (xAxisY >= 0 && xAxisY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, xAxisY);
      ctx.lineTo(width, xAxisY);
      ctx.stroke();
      
      // X-axis arrow
      ctx.beginPath();
      ctx.moveTo(width - 10, xAxisY - 5);
      ctx.lineTo(width, xAxisY);
      ctx.lineTo(width - 10, xAxisY + 5);
      ctx.fillStyle = "#64748b";
      ctx.fill();
    }

    // Y-axis
    const yAxisX = ((0 - range.xMin) / (range.xMax - range.xMin)) * width;
    if (yAxisX >= 0 && yAxisX <= width) {
      ctx.beginPath();
      ctx.moveTo(yAxisX, 0);
      ctx.lineTo(yAxisX, height);
      ctx.stroke();
      
      // Y-axis arrow
      ctx.beginPath();
      ctx.moveTo(yAxisX - 5, 10);
      ctx.lineTo(yAxisX, 0);
      ctx.lineTo(yAxisX + 5, 10);
      ctx.fillStyle = "#64748b";
      ctx.fill();
    }

    // Draw function with gradient
    if (points.length > 0) {
      // Create gradient for the line
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#10b981");
      gradient.addColorStop(0.5, "#3b82f6");
      gradient.addColorStop(1, "#8b5cf6");
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      points.forEach((point, i) => {
        const canvasX = ((point.x - range.xMin) / (range.xMax - range.xMin)) * width;
        const canvasY = height - ((point.y - range.yMin) / (range.yMax - range.yMin)) * height;

        if (i === 0 || Math.abs(points[i-1].x - point.x) > step * 1.5) {
          ctx.moveTo(canvasX, canvasY);
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      });

      ctx.stroke();
    }

    // Draw evaluation point if exists
    if (evaluationPoint && evaluationPoint.y !== null) {
      const canvasX = ((evaluationPoint.x - range.xMin) / (range.xMax - range.xMin)) * width;
      const canvasY = height - ((evaluationPoint.y - range.yMin) / (range.yMax - range.yMin)) * height;

      if (canvasX >= 0 && canvasX <= width && canvasY >= 0 && canvasY <= height) {
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    }
  }, [range, evaluateFunction, evaluationPoint]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * (range.xMax - range.xMin) + range.xMin;
    const y = evaluateFunction(x);
    
    if (y !== null) {
      setEvaluationPoint({ x, y });
    }
  }, [range, evaluateFunction]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dx = ((dragStart.x - e.clientX) / rect.width) * (range.xMax - range.xMin);
    const dy = ((e.clientY - dragStart.y) / rect.height) * (range.yMax - range.yMin);

    setRange(prev => ({
      xMin: prev.xMin + dx,
      xMax: prev.xMax + dx,
      yMin: prev.yMin + dy,
      yMax: prev.yMax + dy,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, range]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setRange({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    setEvaluationPoint(null);
  }, []);

  const zoomIn = useCallback(() => {
    setRange(prev => ({
      xMin: prev.xMin * 0.8,
      xMax: prev.xMax * 0.8,
      yMin: prev.yMin * 0.8,
      yMax: prev.yMax * 0.8,
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setRange(prev => ({
      xMin: prev.xMin * 1.2,
      xMax: prev.xMax * 1.2,
      yMin: prev.yMin * 1.2,
      yMax: prev.yMax * 1.2,
    }));
  }, []);

  const step = (range.xMax - range.xMin) / 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/tools")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                Traceur de Courbes
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Aide"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Aide</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• <span className="font-semibold">Cliquez</span> sur le graphique pour évaluer la fonction</p>
                <p>• <span className="font-semibold">Glissez</span> pour déplacer la vue</p>
                <p>• Utilisez les boutons <span className="font-semibold">+/-</span> pour zoomer</p>
                <p>• Fonctions supportées : sin, cos, tan, sqrt, log, ln, abs, floor, ceil</p>
                <p>• Constantes : π (pi), e</p>
                <p>• Exemples : x^2, sin(x), 2*x + 1, e^x, ln(x)</p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Compris
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          {/* Input Section - Improved */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">f(x) =</span>
              {evaluationPoint && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  Point: ({evaluationPoint.x.toFixed(2)}, {evaluationPoint.y?.toFixed(2)})
                </motion.div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={functionStr}
                  onChange={(e) => setFunctionStr(e.target.value)}
                  className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 font-mono text-lg bg-gray-50"
                  placeholder="x^2, sin(x), cos(x), etc."
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    onClick={resetView}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium transition-colors"
                    title="Réinitialiser la vue"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={plotFunction}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Tracer
                </button>
                <button
                  onClick={zoomIn}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Zoom avant"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={zoomOut}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Zoom arrière"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Quick Examples - Improved */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Exemples rapides</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { expr: "x^2", label: "x²" },
                { expr: "sin(x)", label: "sin(x)" },
                { expr: "cos(x)", label: "cos(x)" },
                { expr: "tan(x)", label: "tan(x)" },
                { expr: "sqrt(x)", label: "√x" },
                { expr: "x^3", label: "x³" },
                { expr: "1/x", label: "1/x" },
                { expr: "e^x", label: "eˣ" },
                { expr: "ln(x)", label: "ln(x)" },
                { expr: "abs(x)", label: "|x|" },
                { expr: "x^2 + 2*x + 1", label: "x²+2x+1" },
                { expr: "sin(x) + cos(x)", label: "sin+cos" },
              ].map((ex) => (
                <button
                  key={ex.expr}
                  onClick={() => {
                    setFunctionStr(ex.expr);
                    setEvaluationPoint(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                    functionStr === ex.expr
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas with improved styling */}
          <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="w-full h-[500px] cursor-grab active:cursor-grabbing"
              style={{ touchAction: "none" }}
            />
            
            {/* Coordinate display */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-mono">
              x: [{range.xMin.toFixed(1)}, {range.xMax.toFixed(1)}] | y: [{range.yMin.toFixed(1)}, {range.yMax.toFixed(1)}]
            </div>
          </div>

          {/* Range Controls - Improved */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "X min", key: "xMin", value: range.xMin },
              { label: "X max", key: "xMax", value: range.xMax },
              { label: "Y min", key: "yMin", value: range.yMin },
              { label: "Y max", key: "yMax", value: range.yMax },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    setRange({ ...range, [key]: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
                  step="any"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
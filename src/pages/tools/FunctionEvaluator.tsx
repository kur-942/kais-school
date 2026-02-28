import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  function: string;
  x: number;
  result: number;
}

export const FunctionEvaluator: React.FC = () => {
  const navigate = useNavigate();
  const [functionStr, setFunctionStr] = useState('x^2 + 2*x + 1');
  const [xValue, setXValue] = useState('0');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const evaluate = () => {
    try {
      setError('');
      
      const x = parseFloat(xValue);
      if (isNaN(x)) {
        throw new Error('Valeur de x invalide');
      }

      // Replace mathematical expressions
      let expr = functionStr
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // eslint-disable-next-line no-new-func
      const result = Function('x', 'return ' + expr)(x);
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Résultat invalide');
      }

      const formattedResult = parseFloat(result.toFixed(8));
      setResult(formattedResult);

      // Add to history
      setHistory(prev => [
        { function: functionStr, x, result: formattedResult },
        ...prev
      ].slice(0, 10));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de calcul');
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/tools')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                Calculateur de Fonction
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          {/* Function Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              f(x) =
            </label>
            <input
              type="text"
              value={functionStr}
              onChange={(e) => setFunctionStr(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 font-mono text-lg"
              placeholder="x^2 + 2*x + 1"
            />
          </div>

          {/* X Value Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              x =
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={xValue}
                onChange={(e) => setXValue(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-lg"
                step="any"
                placeholder="0"
              />
              <button
                onClick={evaluate}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                Calculer
              </button>
            </div>
          </div>

          {/* Result */}
          {result !== null && !error && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700 mb-1">Résultat:</div>
              <div className="text-3xl font-bold text-green-700">
                f({xValue}) = {result}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-700 mb-1">Erreur:</div>
              <div className="text-lg text-red-700">{error}</div>
            </div>
          )}

          {/* Quick Examples */}
          <div className="mb-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Exemples rapides</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { expr: 'x^2 + 2*x + 1', desc: 'Polynôme' },
                { expr: 'sin(x)', desc: 'Sinus' },
                { expr: 'cos(x)', desc: 'Cosinus' },
                { expr: 'sqrt(x)', desc: 'Racine carrée' },
                { expr: 'log(x)', desc: 'Logarithme' },
                { expr: 'e^x', desc: 'Exponentielle' }
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setFunctionStr(ex.expr)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  title={ex.desc}
                >
                  {ex.expr}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Historique</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setFunctionStr(item.function);
                      setXValue(item.x.toString());
                      setResult(item.result);
                    }}
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="text-sm font-mono">
                      f(x) = {item.function}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      x = {item.x} → f(x) = {item.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
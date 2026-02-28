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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      evaluate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate('/tools')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Retour aux outils"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
                Calculateur de Fonction
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-gray-200">
              {/* Function Input */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  f(x) =
                </label>
                <input
                  type="text"
                  value={functionStr}
                  onChange={(e) => setFunctionStr(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 font-mono text-base sm:text-lg transition-all"
                  placeholder="x^2 + 2*x + 1"
                />
              </div>

              {/* X Value Input */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  x =
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={xValue}
                      onChange={(e) => setXValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base sm:text-lg transition-all"
                      step="any"
                      placeholder="0"
                    />
                  </div>
                  <button
                    onClick={evaluate}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base shadow-sm hover:shadow-md active:scale-95 transform"
                  >
                    Calculer
                  </button>
                </div>
              </div>

              {/* Result */}
              {result !== null && !error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                  <div className="text-xs sm:text-sm text-green-700 mb-1">Résultat:</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 break-all">
                    f({xValue}) = {result}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                  <div className="text-xs sm:text-sm text-red-700 mb-1">Erreur:</div>
                  <div className="text-base sm:text-lg text-red-700 break-all">{error}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Quick Examples */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
                Exemples rapides
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
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
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs sm:text-sm transition-colors text-left truncate border border-gray-200 hover:border-gray-300"
                    title={ex.desc}
                  >
                    <span className="font-mono">{ex.expr}</span>
                    <span className="text-gray-500 text-xs ml-1 hidden sm:inline">({ex.desc})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
                  Historique
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setFunctionStr(item.function);
                        setXValue(item.x.toString());
                        setResult(item.result);
                      }}
                      className="p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      <div className="text-xs sm:text-sm font-mono truncate">
                        f(x) = {item.function}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        x = {item.x} → f(x) = {item.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Astuces
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm text-blue-700">• Utilisez ^ pour les puissances</div>
              <div className="text-xs sm:text-sm text-blue-700">• sin(), cos(), tan() disponibles</div>
              <div className="text-xs sm:text-sm text-blue-700">• log() pour log base 10</div>
              <div className="text-xs sm:text-sm text-blue-700">• ln() pour log naturel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
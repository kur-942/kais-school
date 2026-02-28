import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type MathFunction = 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'log' | 'ln' | 'sqrt' | 'pow' | 'fact';

export const Calculator: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const calculate = (expr: string) => {
    try {
      setError('');
      
      // Handle implicit multiplication (e.g., 5x -> 5*x, 2sin(30) -> 2*sin(30))
      let processed = expr
        // Add * between number and variable/function/π/(
        .replace(/(\d+)(?=[a-zA-Z(π])/g, '$1*')
        // Add * between ) and ( or number or variable
        .replace(/\)\s*(?=[a-zA-Z(π\d])/g, ')*')
        // Add * between variable and number (e.g., x5 -> x*5)
        .replace(/([a-zA-Z)])\s*(?=\d)/g, '$1*')
        // Add * between π and number/variable
        .replace(/π\s*(?=[a-zA-Z\d])/g, 'π*')
        .replace(/([a-zA-Z\d])\s*π/g, '$1*π')
        // Replace ^ with ** for exponentiation
        .replace(/\^/g, '**')
        // Replace mathematical functions
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/π/g, 'Math.PI')
        .replace(/e(?!\w)/g, 'Math.E'); // Replace e only when it's a standalone variable

      // Handle factorial
      if (processed.includes('!')) {
        const match = processed.match(/(\d+)!/);
        if (match) {
          const num = parseInt(match[1]);
          let fact = 1;
          for (let i = 2; i <= num; i++) fact *= i;
          processed = processed.replace(match[0], fact.toString());
        }
      }

      // Handle degree conversion for trig functions
      if (angleMode === 'deg') {
        processed = processed
          .replace(/Math\.sin\(/g, 'Math.sin((Math.PI/180)*')
          .replace(/Math\.cos\(/g, 'Math.cos((Math.PI/180)*')
          .replace(/Math\.tan\(/g, 'Math.tan((Math.PI/180)*')
          .replace(/Math\.asin\(/g, '(180/Math.PI)*Math.asin(')
          .replace(/Math\.acos\(/g, '(180/Math.PI)*Math.acos(')
          .replace(/Math\.atan\(/g, '(180/Math.PI)*Math.atan(');
      }

      // Add closing parentheses for degree conversion if needed
      if (angleMode === 'deg') {
        // Count opening and closing parentheses
        const openParens = (processed.match(/\(/g) || []).length;
        const closeParens = (processed.match(/\)/g) || []).length;
        
        // Add missing closing parentheses
        for (let i = 0; i < openParens - closeParens; i++) {
          processed += ')';
        }
      }

      // Safe evaluation
      // eslint-disable-next-line no-new-func
      const calcResult = Function('"use strict";return (' + processed + ')')();
      
      if (isNaN(calcResult) || !isFinite(calcResult)) {
        throw new Error('Résultat invalide');
      }

      const formattedResult = calcResult.toFixed(8).replace(/\.?0+$/, '');
      setResult(formattedResult);
      
      // Add to history
      setHistory(prev => [`${expr} = ${formattedResult}`, ...prev].slice(0, 10));
    } catch (err) {
      setError('Expression invalide');
      setResult('');
    }
  };

  const handleButtonClick = (value: string) => {
    setInput(prev => prev + value);
  };

  const handleFunction = (func: MathFunction) => {
    setInput(prev => prev + func + '(');
  };

  const clear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const backspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const buttons = [
    ['7', '8', '9', '/', 'C'],
    ['4', '5', '6', '*', '⌫'],
    ['1', '2', '3', '-', '='],
    ['0', '.', 'π', '+', '^'],
  ];

  const functions: { label: string; func: MathFunction }[] = [
    { label: 'sin', func: 'sin' },
    { label: 'cos', func: 'cos' },
    { label: 'tan', func: 'tan' },
    { label: 'asin', func: 'asin' },
    { label: 'acos', func: 'acos' },
    { label: 'atan', func: 'atan' },
    { label: 'log', func: 'log' },
    { label: 'ln', func: 'ln' },
    { label: '√', func: 'sqrt' },
    { label: 'x²', func: 'pow' },
    { label: 'x!', func: 'fact' },
    { label: 'e', func: 'pow' },
  ];

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
                Calculatrice Scientifique
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAngleMode('deg')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  angleMode === 'deg' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => setAngleMode('rad')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  angleMode === 'rad' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                RAD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          {/* Display */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <div className="text-right text-gray-500 text-sm mb-1 font-mono overflow-x-auto whitespace-nowrap">
                {input || '0'}
              </div>
              <div className="text-right text-3xl sm:text-4xl font-bold text-gray-800 font-mono">
                {result || '0'}
              </div>
            </div>
            {error && (
              <div className="mt-2 text-red-500 text-sm text-right">
                {error}
              </div>
            )}
          </div>

          {/* Functions Grid */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {functions.map((f, i) => (
              <button
                key={i}
                onClick={() => {
                  if (f.func === 'pow') {
                    setInput(prev => prev + '^');
                  } else if (f.func === 'fact') {
                    setInput(prev => prev + '!');
                  } else if (f.func === 'sqrt') {
                    setInput(prev => prev + 'sqrt(');
                  } else if (f.label === 'e') {
                    setInput(prev => prev + 'e');
                  } else {
                    handleFunction(f.func);
                  }
                }}
                className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-5 gap-2">
            {buttons.map((row, i) => (
              <React.Fragment key={i}>
                {row.map((btn, j) => {
                  if (btn === 'C') {
                    return (
                      <button
                        key={j}
                        onClick={clear}
                        className="col-span-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        C
                      </button>
                    );
                  }
                  if (btn === '⌫') {
                    return (
                      <button
                        key={j}
                        onClick={backspace}
                        className="col-span-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      >
                        ⌫
                      </button>
                    );
                  }
                  if (btn === '=') {
                    return (
                      <button
                        key={j}
                        onClick={() => calculate(input)}
                        className="col-span-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        =
                      </button>
                    );
                  }
                  return (
                    <button
                      key={j}
                      onClick={() => handleButtonClick(btn)}
                      className="col-span-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      {btn}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Historique</h3>
              <div className="space-y-1">
                {history.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const parts = item.split(' = ');
                      setInput(parts[0]);
                      setResult(parts[1]);
                    }}
                    className="text-sm text-gray-600 hover:bg-gray-50 p-2 rounded cursor-pointer"
                  >
                    {item}
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
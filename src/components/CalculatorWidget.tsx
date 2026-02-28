import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export const CalculatorWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const calculate = (expr: string) => {
    try {
      setError('');
      
      // Preprocess for implicit multiplication and functions
      let processed = expr
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Handle implicit multiplication: 2x -> 2*x
      processed = processed.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
      
      // eslint-disable-next-line no-new-func
      const calcResult = Function('"use strict";return (' + processed + ')')();
      
      if (isNaN(calcResult) || !isFinite(calcResult)) {
        throw new Error('Résultat invalide');
      }

      setResult(calcResult.toString());
    } catch (err) {
      setError('Expression invalide');
      setResult('');
    }
  };

  const handleButtonClick = (value: string) => {
    setInput(prev => prev + value);
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (input) calculate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const buttons = [
    ['7', '8', '9', '/', 'C'],
    ['4', '5', '6', '*', '⌫'],
    ['1', '2', '3', '-', '='],
    ['0', '.', 'π', '+', '^'],
    ['sin', 'cos', 'tan', 'sqrt', 'e'],
  ];

  // Fixed variants with proper typing
  const panelVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };
  if (location.pathname === '/login') {
  return null;
}

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Calculator Icon - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="Calculatrice rapide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Calculator Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-16 left-0 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculatrice rapide
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Display */}
            <div className="p-3 bg-gray-50">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-right text-lg"
                placeholder="0"
                autoFocus
              />
              {result && (
                <div className="mt-1 text-right text-blue-600 font-bold">
                  = {result}
                </div>
              )}
              {error && (
                <div className="mt-1 text-right text-red-500 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Buttons Grid */}
            <div className="p-3 space-y-1">
              {buttons.map((row, i) => (
                <div key={i} className="grid grid-cols-5 gap-1">
                  {row.map((btn, j) => {
                    if (btn === 'C') {
                      return (
                        <button
                          key={j}
                          onClick={handleClear}
                          className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          C
                        </button>
                      );
                    }
                    if (btn === '⌫') {
                      return (
                        <button
                          key={j}
                          onClick={handleBackspace}
                          className="py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          ⌫
                        </button>
                      );
                    }
                    if (btn === '=') {
                      return (
                        <button
                          key={j}
                          onClick={handleCalculate}
                          className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors col-span-1"
                        >
                          =
                        </button>
                      );
                    }
                    if (btn === 'sin' || btn === 'cos' || btn === 'tan' || btn === 'sqrt') {
                      return (
                        <button
                          key={j}
                          onClick={() => handleButtonClick(btn + '(')}
                          className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          {btn}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={j}
                        onClick={() => handleButtonClick(btn)}
                        className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Quick hint */}
            <div className="px-3 pb-2 text-[10px] text-gray-400 flex justify-between">
              <span>sin, cos, tan, sqrt</span>
              <span>π = pi, e = 2.718</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useWeatherStore, tunisianStates } from '../../store/weatherStore';
import { motion, AnimatePresence } from 'framer-motion';

export const WeatherWidget: React.FC = () => {
  const { 
    currentWeather, 
    forecast, 
    selectedCity,
    favorites,
    isLoading, 
    error, 
    fetchWeather, 
    fetchForecast,
    setSelectedCity,
    toggleFavorite,
    loadFavorites
  } = useWeatherStore();

  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFavorites();
    fetchWeather('Tunis');
    fetchForecast('Tunis');
  }, []);

  const filteredStates = tunisianStates.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };


  const isFavorite = favorites.includes(selectedCity);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-green-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Météo en Tunisie
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCitySelector(!showCitySelector)}
            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
          >
            <span>{selectedCity}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => toggleFavorite(selectedCity)}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCitySelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 mt-2 w-64 bg-white rounded-xl shadow-xl border border-green-100 p-3"
          >
            <div className="mb-2">
              <input
                type="text"
                placeholder="Rechercher une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
                autoFocus
              />
            </div>
            
            {/* Favorites section */}
            {favorites.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-1 px-2">Favoris</p>
                {favorites.filter(city => city.toLowerCase().includes(searchTerm.toLowerCase())).map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCitySelector(false);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-yellow-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="text-yellow-500">★</span>
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            )}

            {/* All cities */}
            <div className="max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 mb-1 px-2">Toutes les villes</p>
              {filteredStates.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setShowCitySelector(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 rounded-lg transition-colors ${
                    city === selectedCity ? 'bg-green-50 text-green-700 font-medium' : ''
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : currentWeather && (
        <div>
          {/* Current Weather */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-gray-800">
                {currentWeather.temp}°C
              </p>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {currentWeather.description}
              </p>
            </div>
            <img 
              src={getWeatherIcon(currentWeather.icon)} 
              alt={currentWeather.description}
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <svg className="w-4 h-4 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-xs text-gray-500">Ressenti</p>
              <p className="text-sm font-semibold">{currentWeather.feels_like}°C</p>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <svg className="w-4 h-4 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-xs text-gray-500">Humidité</p>
              <p className="text-sm font-semibold">{currentWeather.humidity}%</p>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <svg className="w-4 h-4 mx-auto text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <p className="text-xs text-gray-500">Vent</p>
              <p className="text-sm font-semibold">{currentWeather.wind_speed} km/h</p>
            </div>
          </div>

          {/* 5-Day Forecast */}
          {forecast.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Prévisions 5 jours</h3>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {forecast.map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{day.date}</p>
                    <img 
                      src={getWeatherIcon(day.icon)} 
                      alt={day.description}
                      className="w-8 h-8 mx-auto"
                    />
                    <p className="text-xs font-semibold mt-1">
                      <span className="text-gray-800">{day.temp_max}°</span>
                      <span className="text-gray-400 ml-1">{day.temp_min}°</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
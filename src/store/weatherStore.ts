import { create } from 'zustand';

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  city: string;
}

export interface ForecastData {
  date: string;
  temp_max: number;
  temp_min: number;
  icon: string;
  description: string;
}

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: ForecastData[];
  selectedCity: string;
  isLoading: boolean;
  error: string | null;
  favorites: string[];
  fetchWeather: (city: string) => Promise<void>;
  fetchForecast: (city: string) => Promise<void>;
  setSelectedCity: (city: string) => void;
  toggleFavorite: (city: string) => void;
  loadFavorites: () => void;
}

const API_KEY = '7c1edab21ff40151a4e7968415a4a8a0';

export const tunisianStates = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Kairouan",
  "Gabès",
  "Bizerte",
  "Ariana",
  "Gafsa",
  "Sidi bouzid",
  "Monastir",
  "Ben Arous",
  "Kasserine",
  "Médenine",
  "Nabeul",
  "Tataouine",
  "Béja",
  "Jendouba",
  "Kébili",
  "Le Kef",
  "Mahdia",
  "Manouba",
  "Siliana",
  "Zaghouan",
  "Tozeur"
].sort();

// In your WeatherState interface, make sure it includes:
interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: ForecastData[];
  selectedCity: string;
  isLoading: boolean;
  error: string | null;
  favorites: string[];
  fetchWeather: (city: string) => Promise<void>;
  fetchForecast: (city: string) => Promise<void>;
  setSelectedCity: (city: string) => void;
  toggleFavorite: (city: string) => void;
  loadFavorites: () => void;
}
export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: null,
  forecast: [],
  selectedCity: "Tunis",
  isLoading: false,
  error: null,
  favorites: [],

  loadFavorites: () => {
    const saved = localStorage.getItem('weatherFavorites');
    if (saved) {
      set({ favorites: JSON.parse(saved) });
    }
  },

fetchWeather: async (city: string) => {
  set({ isLoading: true, error: null });
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},TN&units=metric&appid=${API_KEY}&lang=fr`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de chargement');
    }
    
    // Important: The city name might be returned as "Tunisia" for some queries
    // Use the requested city instead of the returned name
    set({
      currentWeather: {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: Math.round(data.wind.speed * 3.6), // Convert to km/h
        city: city // Use the requested city name, not data.name
      },
      selectedCity: city,
      isLoading: false
    });
  } catch (error: any) {
    set({ 
      error: error.message || 'Erreur de chargement', 
      isLoading: false 
    });
  }
},

  fetchForecast: async (city: string) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},TN&units=metric&appid=${API_KEY}&lang=fr`
    );
    
    if (!response.ok) throw new Error('Prévisions non disponibles');
    
    const data = await response.json();
    
    // Get one forecast per day (at 12:00)
    const dailyForecasts = data.list
      .filter((item: any) => item.dt_txt.includes('12:00:00'))
      .slice(0, 5)
      .map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric' 
        }),
        temp_max: Math.round(item.main.temp_max),
        temp_min: Math.round(item.main.temp_min),
        icon: item.weather[0].icon,
        description: item.weather[0].description
      }));
    
    set({ forecast: dailyForecasts });
  } catch (error: any) {
  }
},

  setSelectedCity: (city: string) => {
    set({ selectedCity: city });
    get().fetchWeather(city);
    get().fetchForecast(city);
  },

  toggleFavorite: (city: string) => {
    set(state => {
      const newFavorites = state.favorites.includes(city)
        ? state.favorites.filter(c => c !== city)
        : [...state.favorites, city];
      
      localStorage.setItem('weatherFavorites', JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    });
  }
}));
// Local Storage utilities for user preferences

const STORAGE_KEYS = {
  PREFERENCES: 'cinemind_preferences',
  FAVORITES: 'cinemind_favorites',
};

// All available genres
export const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History',
  'Horror', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
  'Thriller', 'War', 'Western'
];

// All available languages
export const ALL_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Japanese', 'Korean', 'Chinese (Mandarin)', 'Chinese (Cantonese)',
  'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Arabic', 'Turkish', 'Thai',
  'Vietnamese', 'Indonesian', 'Dutch', 'Swedish', 'Danish', 'Norwegian',
  'Finnish', 'Polish', 'Greek', 'Hebrew', 'Persian', 'Urdu'
];

// All mood options
export const ALL_MOODS = [
  { value: 'happy', label: 'Happy & Uplifting', emoji: '😊' },
  { value: 'relaxed', label: 'Relaxed & Calm', emoji: '😌' },
  { value: 'adventurous', label: 'Adventurous & Exciting', emoji: '🚀' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'thrilling', label: 'Thrilling & Intense', emoji: '😰' },
  { value: 'thought-provoking', label: 'Thought-provoking', emoji: '🤔' },
  { value: 'nostalgic', label: 'Nostalgic', emoji: '🥹' },
  { value: 'inspiring', label: 'Inspiring & Motivational', emoji: '✨' },
  { value: 'dark', label: 'Dark & Mysterious', emoji: '🌑' },
  { value: 'funny', label: 'Funny & Lighthearted', emoji: '😂' },
];

// Default preferences structure
const DEFAULT_PREFERENCES = {
  favorite_genres: [],
  favorite_languages: [],
  favorite_movies: [],
  current_mood: null,
};

// Get preferences from local storage
export const getPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error reading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Save preferences to local storage
export const savePreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

// Update a specific preference field
export const updatePreference = (key, value) => {
  const current = getPreferences();
  current[key] = value;
  return savePreferences(current);
};

// Get favorites from local storage
export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

// Save favorites to local storage
export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error saving favorites:', error);
    return false;
  }
};

// Add a movie to favorites
export const addToFavorites = (movieTitle) => {
  const favorites = getFavorites();
  if (!favorites.includes(movieTitle)) {
    favorites.unshift(movieTitle);
    saveFavorites(favorites);
    
    // Also update favorite_movies in preferences
    const prefs = getPreferences();
    if (!prefs.favorite_movies.includes(movieTitle)) {
      prefs.favorite_movies.unshift(movieTitle);
      savePreferences(prefs);
    }
  }
  return favorites;
};

// Remove a movie from favorites
export const removeFromFavorites = (movieTitle) => {
  let favorites = getFavorites();
  favorites = favorites.filter(m => m !== movieTitle);
  saveFavorites(favorites);
  
  // Also update favorite_movies in preferences
  const prefs = getPreferences();
  prefs.favorite_movies = prefs.favorite_movies.filter(m => m !== movieTitle);
  savePreferences(prefs);
  
  return favorites;
};

// Check if a movie is in favorites
export const isFavorite = (movieTitle) => {
  const favorites = getFavorites();
  return favorites.includes(movieTitle);
};

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  localStorage.removeItem(STORAGE_KEYS.FAVORITES);
};

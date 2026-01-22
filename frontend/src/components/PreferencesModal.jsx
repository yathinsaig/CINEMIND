import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Settings2, 
  Heart, 
  Globe, 
  Film, 
  Sparkles,
  Trash2,
  Check
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { 
  getPreferences, 
  savePreferences, 
  getFavorites,
  removeFromFavorites,
  ALL_GENRES, 
  ALL_LANGUAGES,
  ALL_MOODS 
} from "../utils/storage";
import { toast } from "sonner";

const PreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [preferences, setPreferences] = useState({
    favorite_genres: [],
    favorite_languages: [],
    favorite_movies: [],
    current_mood: null,
  });
  const [favorites, setFavorites] = useState([]);
  const [newFavoriteMovie, setNewFavoriteMovie] = useState("");
  const [activeTab, setActiveTab] = useState("genres");

  useEffect(() => {
    if (isOpen) {
      setPreferences(getPreferences());
      setFavorites(getFavorites());
    }
  }, [isOpen]);

  const toggleGenre = (genre) => {
    setPreferences(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...prev.favorite_genres, genre]
    }));
  };

  const toggleLanguage = (language) => {
    setPreferences(prev => ({
      ...prev,
      favorite_languages: prev.favorite_languages.includes(language)
        ? prev.favorite_languages.filter(l => l !== language)
        : [...prev.favorite_languages, language]
    }));
  };

  const setMood = (mood) => {
    setPreferences(prev => ({
      ...prev,
      current_mood: prev.current_mood === mood ? null : mood
    }));
  };

  const addFavoriteMovie = () => {
    if (newFavoriteMovie.trim()) {
      const movie = newFavoriteMovie.trim();
      if (!preferences.favorite_movies.includes(movie)) {
        setPreferences(prev => ({
          ...prev,
          favorite_movies: [...prev.favorite_movies, movie]
        }));
        setFavorites(prev => [...prev, movie]);
      }
      setNewFavoriteMovie("");
    }
  };

  const removeFavoriteMovie = (movie) => {
    setPreferences(prev => ({
      ...prev,
      favorite_movies: prev.favorite_movies.filter(m => m !== movie)
    }));
    removeFromFavorites(movie);
    setFavorites(prev => prev.filter(m => m !== movie));
  };

  const handleSave = () => {
    savePreferences(preferences);
    onSave(preferences);
    toast.success("Preferences saved!");
    onClose();
  };

  const tabs = [
    { id: "genres", label: "Genres", icon: Film },
    { id: "languages", label: "Languages", icon: Globe },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "mood", label: "Mood", icon: Sparkles },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl glass-card rounded-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          data-testid="preferences-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bebas text-2xl tracking-wide">YOUR PREFERENCES</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-white/10"
              data-testid="close-preferences"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`font-manrope ${activeTab === tab.id ? 'bg-primary' : 'hover:bg-white/10'}`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="h-[400px] p-6">
            {/* Genres Tab */}
            {activeTab === "genres" && (
              <div className="space-y-4">
                <p className="text-muted-foreground font-manrope text-sm mb-4">
                  Select your favorite genres to get personalized recommendations
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={preferences.favorite_genres.includes(genre) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 font-manrope ${
                        preferences.favorite_genres.includes(genre)
                          ? 'bg-primary hover:bg-primary/80'
                          : 'hover:bg-white/10 border-white/20'
                      }`}
                      onClick={() => toggleGenre(genre)}
                      data-testid={`genre-${genre.toLowerCase()}`}
                    >
                      {preferences.favorite_genres.includes(genre) && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === "languages" && (
              <div className="space-y-4">
                <p className="text-muted-foreground font-manrope text-sm mb-4">
                  Select your preferred languages for movie recommendations
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_LANGUAGES.map((language) => (
                    <Badge
                      key={language}
                      variant={preferences.favorite_languages.includes(language) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 font-manrope ${
                        preferences.favorite_languages.includes(language)
                          ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                          : 'hover:bg-white/10 border-white/20'
                      }`}
                      onClick={() => toggleLanguage(language)}
                      data-testid={`language-${language.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {preferences.favorite_languages.includes(language) && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div className="space-y-4">
                <p className="text-muted-foreground font-manrope text-sm mb-4">
                  Add your favorite movies to improve recommendations
                </p>
                
                {/* Add new favorite */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a favorite movie..."
                    value={newFavoriteMovie}
                    onChange={(e) => setNewFavoriteMovie(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFavoriteMovie()}
                    className="bg-secondary/50 border-white/10"
                    data-testid="add-favorite-input"
                  />
                  <Button
                    onClick={addFavoriteMovie}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="add-favorite-button"
                  >
                    Add
                  </Button>
                </div>

                {/* Favorites list */}
                <div className="space-y-2 mt-4">
                  {preferences.favorite_movies.length === 0 ? (
                    <p className="text-muted-foreground/60 text-sm text-center py-8">
                      No favorites yet. Add movies you love!
                    </p>
                  ) : (
                    preferences.favorite_movies.map((movie, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-primary fill-primary" />
                          <span className="font-manrope">{movie}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavoriteMovie(movie)}
                          className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                          data-testid={`remove-favorite-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Mood Tab */}
            {activeTab === "mood" && (
              <div className="space-y-4">
                <p className="text-muted-foreground font-manrope text-sm mb-4">
                  What's your current mood? (Optional - helps tailor recommendations)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_MOODS.map((mood) => (
                    <div
                      key={mood.value}
                      onClick={() => setMood(mood.value)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        preferences.current_mood === mood.value
                          ? 'bg-primary/20 border-primary'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`mood-${mood.value}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="font-manrope">{mood.label}</span>
                        {preferences.current_mood === mood.value && (
                          <Check className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10 bg-black/20">
            <div className="text-sm text-muted-foreground font-manrope">
              {preferences.favorite_genres.length} genres • {preferences.favorite_languages.length} languages • {preferences.favorite_movies.length} favorites
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 font-bebas tracking-wide"
                data-testid="save-preferences"
              >
                SAVE PREFERENCES
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PreferencesModal;

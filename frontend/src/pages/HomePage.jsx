import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Film, Loader2, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [movieTitle, setMovieTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!movieTitle.trim()) {
      toast.error("Please enter a movie or series name");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/analyze-movie`, {
        movie_title: movieTitle.trim()
      });
      
      navigate("/results", { state: { analysis: response.data } });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(error.response?.data?.detail || "Failed to analyze movie. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="hero-section min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80')`,
      }}
    >
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Film className="w-12 h-12 text-primary" />
            <h1 
              className="font-bebas text-6xl md:text-8xl tracking-tight text-white"
              data-testid="app-title"
            >
              CINEMIND
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p 
            className="text-muted-foreground text-lg md:text-xl font-manrope mb-12 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            AI-Powered Movie Intelligence • Professional Analysis • Smart Recommendations
          </motion.p>

          {/* Search Form */}
          <motion.form
            onSubmit={handleAnalyze}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="glass-card rounded-2xl p-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter a movie or TV series name..."
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  disabled={isLoading}
                  className="search-input pl-12 h-14 md:h-16 text-lg bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                  data-testid="movie-input"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !movieTitle.trim()}
                className="h-12 md:h-14 px-6 md:px-8 font-bebas text-lg tracking-wide bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                data-testid="analyze-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    ANALYZE
                  </>
                )}
              </Button>
            </div>
          </motion.form>

          {/* Loading State Info */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-muted-foreground font-manrope"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>AI agents are analyzing your movie...</span>
              </div>
              <p className="text-sm text-muted-foreground/60">
                This may take 15-30 seconds
              </p>
            </motion.div>
          )}

          {/* Features */}
          <motion.div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {[
              { label: "Critic Analysis", icon: "🎬" },
              { label: "Sentiment", icon: "💭" },
              { label: "Recommendations", icon: "🎯" },
              { label: "Social Captions", icon: "📱" },
            ].map((feature, index) => (
              <div
                key={feature.label}
                className="glass-card rounded-xl p-4 text-center"
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <span className="text-sm text-muted-foreground font-manrope">
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-muted-foreground/40 text-sm font-mono tracking-wider">
          POWERED BY AI MULTI-AGENT SYSTEM
        </p>
      </div>
    </div>
  );
};

export default HomePage;

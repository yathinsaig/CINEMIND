import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Film, 
  Star, 
  TrendingUp, 
  FileText, 
  Clapperboard, 
  Instagram,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Heart,
  Sparkles,
  Tv,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { addToFavorites, removeFromFavorites, isFavorite, getPreferences } from "../utils/storage";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMovieFavorite, setIsMovieFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingMovie, setLoadingMovie] = useState(null);
  const analysis = location.state?.analysis;

  useEffect(() => {
    if (!analysis) {
      navigate("/");
    } else {
      setIsMovieFavorite(isFavorite(analysis.movie_title));
      setImageLoaded(false); // Reset image state when analysis changes
    }
  }, [analysis, navigate]);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Caption copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const toggleFavorite = () => {
    if (isMovieFavorite) {
      removeFromFavorites(analysis.movie_title);
      setIsMovieFavorite(false);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(analysis.movie_title);
      setIsMovieFavorite(true);
      toast.success("Added to favorites! This will improve your recommendations.");
    }
  };

  const handleRecommendationClick = async (movieTitle) => {
    if (loadingMovie) return; // Prevent multiple clicks
    
    setLoadingMovie(movieTitle);
    toast.info(`Analyzing "${movieTitle}"...`, { duration: 2000 });
    
    try {
      // Build request with user preferences
      const requestBody = { movie_title: movieTitle };
      
      const currentPrefs = getPreferences();
      if (currentPrefs.favorite_genres.length > 0 || 
          currentPrefs.favorite_languages.length > 0 || 
          currentPrefs.favorite_movies.length > 0 ||
          currentPrefs.current_mood) {
        requestBody.preferences = {
          favorite_genres: currentPrefs.favorite_genres,
          favorite_languages: currentPrefs.favorite_languages,
          favorite_movies: currentPrefs.favorite_movies,
          current_mood: currentPrefs.current_mood
        };
      }

      const response = await axios.post(`${API}/analyze-movie`, requestBody);
      
      // Reset image loaded state for new movie
      setImageLoaded(false);
      
      // Navigate to the same page with new data (this will update the state)
      navigate("/results", { state: { analysis: response.data }, replace: true });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast.success(`Now viewing: ${movieTitle}`);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(error.response?.data?.detail || "Failed to analyze movie. Please try again.");
    } finally {
      setLoadingMovie(null);
    }
  };

  const getSentimentIcon = (sentiment) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes("positive")) return <ThumbsUp className="w-6 h-6 text-green-500" />;
    if (s.includes("negative")) return <ThumbsDown className="w-6 h-6 text-red-500" />;
    return <Minus className="w-6 h-6 text-yellow-500" />;
  };

  const getSentimentColor = (sentiment) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes("positive")) return "text-green-500 bg-green-500/10 border-green-500/30";
    if (s.includes("negative")) return "text-red-500 bg-red-500/10 border-red-500/30";
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-full max-w-4xl h-96" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const hasPersonalizedRecs = Array.isArray(analysis.personalized_recommendations) && analysis.personalized_recommendations.length > 0;
  
  // Get images from analysis
  const images = analysis.images || {};
  const hasBackground = images.background || images.poster;
  const backgroundImage = images.background || images.poster;
  const posterImage = images.poster;
  const logoImage = images.logo;
  const isTV = analysis.media_type?.toLowerCase().includes('tv') || analysis.media_type?.toLowerCase().includes('series');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Dynamic Background Image */}
      {hasBackground && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Gradient overlays for better readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/90" />
        </div>
      )}
      
      {/* Fallback background if no images */}
      {!hasBackground && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1571850447508-b0e0de962e87?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/95" />
        </div>
      )}

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-white/10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="font-manrope hover:bg-white/10"
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Search
            </Button>
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-primary" />
              <span className="font-bebas text-2xl tracking-tight">CINEMIND</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Hero Section with Poster */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-12"
            >
              <div className="glass-card rounded-2xl p-6 md:p-8 overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  {/* Poster Image */}
                  {posterImage && (
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                      <div className="relative w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                        {!imageLoaded && (
                          <div className="absolute inset-0 skeleton-shimmer bg-muted" />
                        )}
                        <img
                          src={posterImage}
                          alt={analysis.movie_title}
                          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => setImageLoaded(true)}
                          data-testid="movie-poster"
                        />
                        {/* Poster glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>
                    </div>
                  )}
                  
                  {/* Title and Meta */}
                  <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className="font-mono text-xs tracking-wider border-primary/50 text-primary"
                      >
                        AI ANALYSIS COMPLETE
                      </Badge>
                      {isTV && (
                        <Badge 
                          variant="outline" 
                          className="font-mono text-xs tracking-wider border-accent/50 text-accent"
                        >
                          <Tv className="w-3 h-3 mr-1" />
                          TV SERIES
                        </Badge>
                      )}
                    </div>
                    
                    {/* Logo or Title */}
                    {logoImage ? (
                      <div className="mb-4 flex justify-center md:justify-start">
                        <img
                          src={logoImage}
                          alt={`${analysis.movie_title} logo`}
                          className="h-16 md:h-24 w-auto object-contain drop-shadow-lg"
                          data-testid="movie-logo"
                        />
                      </div>
                    ) : (
                      <h1 
                        className="font-bebas text-4xl md:text-6xl lg:text-7xl tracking-tight text-white mb-2 drop-shadow-lg"
                        data-testid="movie-title"
                      >
                        {analysis.movie_title}
                      </h1>
                    )}
                    
                    {/* Show title below logo if logo exists */}
                    {logoImage && (
                      <p className="text-muted-foreground font-manrope text-lg mb-3">{analysis.movie_title}</p>
                    )}
                    
                    <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap mb-4">
                      <Badge variant="secondary" className="font-manrope">
                        {analysis.genre}
                      </Badge>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getSentimentColor(analysis.overall_sentiment)}`}>
                        {getSentimentIcon(analysis.overall_sentiment)}
                        <span className="font-manrope text-sm font-medium">
                          {analysis.overall_sentiment}
                        </span>
                      </div>
                    </div>
                    
                    {/* Add to Favorites Button */}
                    <div className="flex justify-center md:justify-start">
                      <Button
                        variant={isMovieFavorite ? "default" : "outline"}
                        onClick={toggleFavorite}
                        className={`font-manrope transition-all duration-300 ${
                          isMovieFavorite 
                            ? 'bg-primary hover:bg-primary/80' 
                            : 'border-white/20 hover:bg-white/10'
                        }`}
                        data-testid="favorite-button"
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isMovieFavorite ? 'fill-white' : ''}`} />
                        {isMovieFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Critic Analysis */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-8"
            >
              <Card className="glass-card border-white/10 h-full analysis-card backdrop-blur-md" data-testid="critic-analysis-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    CRITIC ANALYSIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-manrope leading-relaxed whitespace-pre-wrap">
                    {analysis.critic_analysis}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sentiment Section */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-4"
            >
              <Card className="glass-card border-white/10 h-full analysis-card backdrop-blur-md" data-testid="sentiment-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    AUDIENCE SENTIMENT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${getSentimentColor(analysis.overall_sentiment)}`}>
                      {getSentimentIcon(analysis.overall_sentiment)}
                    </div>
                  </div>
                  <p className="text-muted-foreground font-manrope text-sm leading-relaxed">
                    {analysis.audience_sentiment}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Spoiler-Free Summary */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-12"
            >
              <Card className="glass-card border-white/10 analysis-card backdrop-blur-md" data-testid="summary-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    SPOILER-FREE SUMMARY
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-foreground font-manrope leading-relaxed">
                    {analysis.summary}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personalized Recommendations (if available) */}
            {hasPersonalizedRecs && (
              <motion.div 
                variants={itemVariants}
                className="col-span-1 md:col-span-12"
              >
                <Card className="glass-card border-primary/30 bg-primary/5 backdrop-blur-md" data-testid="personalized-recommendations-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      PERSONALIZED FOR YOU
                      <Badge variant="outline" className="ml-2 border-primary/50 text-primary font-mono text-xs">
                        Based on your preferences
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {analysis.personalized_recommendations.map((rec, index) => (
                        <div
                          key={index}
                          onClick={() => handleRecommendationClick(rec.title)}
                          className={`recommendation-card p-4 rounded-xl border border-primary/20 bg-primary/10 
                            hover:bg-primary/25 hover:border-primary/40 hover:scale-[1.02] 
                            transition-all duration-300 cursor-pointer group relative
                            ${loadingMovie === rec.title ? 'opacity-70 pointer-events-none' : ''}`}
                          data-testid={`personalized-rec-${index}`}
                        >
                          {loadingMovie === rec.title && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                              <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2">
                              <Heart className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                              <h4 className="font-bebas text-lg text-white tracking-wide group-hover:text-primary transition-colors">
                                {rec.title}
                              </h4>
                            </div>
                            <ExternalLink className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
                          </div>
                          <p className="text-muted-foreground text-sm font-manrope">
                            {rec.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Similar Recommendations */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-12"
            >
              <Card className="glass-card border-white/10 backdrop-blur-md" data-testid="recommendations-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Clapperboard className="w-5 h-5 text-purple-400" />
                    </div>
                    SIMILAR RECOMMENDATIONS
                    <span className="ml-auto text-xs text-muted-foreground font-manrope font-normal normal-case tracking-normal">
                      Click to explore
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analysis.recommendations?.map((rec, index) => (
                      <div
                        key={index}
                        onClick={() => handleRecommendationClick(rec.title)}
                        className={`recommendation-card p-4 rounded-xl border border-white/10 bg-white/5 
                          hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] 
                          transition-all duration-300 cursor-pointer group relative
                          ${loadingMovie === rec.title ? 'opacity-70 pointer-events-none' : ''}`}
                        data-testid={`recommendation-${index}`}
                      >
                        {loadingMovie === rec.title && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bebas text-lg text-white tracking-wide group-hover:text-purple-400 transition-colors">
                            {rec.title}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" />
                        </div>
                        <p className="text-muted-foreground text-sm font-manrope">
                          {rec.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instagram Captions */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-12"
            >
              <Card className="glass-card border-white/10 backdrop-blur-md" data-testid="captions-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      <Instagram className="w-5 h-5 text-pink-400" />
                    </div>
                    INSTAGRAM CAPTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.instagram_captions?.map((caption, index) => (
                      <div
                        key={index}
                        className="caption-card relative p-4 rounded-xl border border-white/10 bg-white/5 group"
                        data-testid={`caption-${index}`}
                      >
                        <p className="text-foreground font-manrope text-sm pr-8">
                          {caption}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="copy-btn absolute top-3 right-3 h-8 w-8 hover:bg-white/10"
                          onClick={() => copyToClipboard(caption, index)}
                          data-testid={`copy-caption-${index}`}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analyze Another */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-12 text-center py-8"
            >
              <Button
                onClick={() => navigate("/")}
                className="font-bebas text-lg tracking-wide px-8 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                data-testid="analyze-another-button"
              >
                ANALYZE ANOTHER MOVIE
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ResultsPage;

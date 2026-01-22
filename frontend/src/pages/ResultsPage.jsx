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
  Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { addToFavorites, removeFromFavorites, isFavorite } from "../utils/storage";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMovieFavorite, setIsMovieFavorite] = useState(false);
  const analysis = location.state?.analysis;

  useEffect(() => {
    if (!analysis) {
      navigate("/");
    } else {
      setIsMovieFavorite(isFavorite(analysis.movie_title));
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

  const hasPersonalizedRecs = analysis.personalized_recommendations && analysis.personalized_recommendations.length > 0;

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1571850447508-b0e0de962e87?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-white/10">
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
            {/* Title & Meta Section */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-12"
            >
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Badge 
                      variant="outline" 
                      className="mb-3 font-mono text-xs tracking-wider border-primary/50 text-primary"
                    >
                      AI ANALYSIS COMPLETE
                    </Badge>
                    <h1 
                      className="font-bebas text-4xl md:text-6xl tracking-tight text-white mb-2"
                      data-testid="movie-title"
                    >
                      {analysis.movie_title}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
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
                  </div>
                  {/* Add to Favorites Button */}
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
            </motion.div>

            {/* Critic Analysis */}
            <motion.div 
              variants={itemVariants}
              className="col-span-1 md:col-span-8"
            >
              <Card className="glass-card border-white/10 h-full analysis-card" data-testid="critic-analysis-card">
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
              <Card className="glass-card border-white/10 h-full analysis-card" data-testid="sentiment-card">
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
              <Card className="glass-card border-white/10 analysis-card" data-testid="summary-card">
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
                <Card className="glass-card border-primary/30 bg-primary/5" data-testid="personalized-recommendations-card">
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
                          className="recommendation-card p-4 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/15 transition-colors"
                          data-testid={`personalized-rec-${index}`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <Heart className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <h4 className="font-bebas text-lg text-white tracking-wide">
                              {rec.title}
                            </h4>
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
              <Card className="glass-card border-white/10" data-testid="recommendations-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-bebas text-2xl tracking-wide">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Clapperboard className="w-5 h-5 text-purple-400" />
                    </div>
                    SIMILAR RECOMMENDATIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analysis.recommendations?.map((rec, index) => (
                      <div
                        key={index}
                        className="recommendation-card p-4 rounded-xl border border-white/10 bg-white/5"
                        data-testid={`recommendation-${index}`}
                      >
                        <h4 className="font-bebas text-lg text-white mb-2 tracking-wide">
                          {rec.title}
                        </h4>
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
              <Card className="glass-card border-white/10" data-testid="captions-card">
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

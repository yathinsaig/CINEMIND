from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Request/Response Models
class UserPreferences(BaseModel):
    favorite_genres: List[str] = []
    favorite_languages: List[str] = []
    favorite_movies: List[str] = []
    current_mood: Optional[str] = None

class MovieAnalysisRequest(BaseModel):
    movie_title: str
    preferences: Optional[UserPreferences] = None

class Recommendation(BaseModel):
    title: str
    reason: str

class MovieAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    movie_title: str
    genre: str
    overall_sentiment: str
    critic_analysis: str
    audience_sentiment: str
    summary: str
    recommendations: List[Recommendation]
    personalized_recommendations: List[Recommendation] = []
    instagram_captions: List[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Multi-Agent System
class MultiAgentOrchestrator:
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def _create_chat(self, system_message: str) -> LlmChat:
        chat = LlmChat(
            api_key=self.api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        return chat
    
    async def planner_agent(self, movie_title: str) -> dict:
        """Plans the analysis workflow and extracts basic movie info"""
        chat = await self._create_chat(
            "You are a Planner Agent for movie analysis. Your job is to understand the movie/series and provide basic metadata. "
            "Respond ONLY with a JSON object (no markdown, no code blocks) with these exact keys: "
            '{"genre": "main genre(s)", "year": "release year or N/A", "type": "Movie or TV Series"}'
        )
        
        message = UserMessage(text=f"Analyze this movie/series: '{movie_title}'. Provide the genre, approximate year, and whether it's a Movie or TV Series.")
        response = await chat.send_message(message)
        
        try:
            import json
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except:
            return {"genre": "Drama", "year": "N/A", "type": "Movie"}
    
    async def critic_agent(self, movie_title: str, genre: str) -> str:
        """Provides professional movie critique"""
        chat = await self._create_chat(
            "You are a professional Film Critic Agent. Provide insightful analysis covering: "
            "story & screenplay quality, acting performances, cinematography, music & sound design, and direction & pacing. "
            "Be professional but engaging. NEVER include spoilers. Keep response under 300 words."
        )
        
        message = UserMessage(text=f"Provide a professional critique of '{movie_title}' ({genre}). Focus on technical and artistic merits without spoilers.")
        response = await chat.send_message(message)
        return response
    
    async def sentiment_agent(self, movie_title: str) -> dict:
        """Analyzes audience sentiment"""
        chat = await self._create_chat(
            "You are a Sentiment Analysis Agent. Analyze general audience reaction to movies/series. "
            "Respond ONLY with a JSON object (no markdown, no code blocks) with these exact keys: "
            '{"overall": "Positive/Mixed/Negative", "analysis": "2-3 sentences about common praise and complaints"}'
        )
        
        message = UserMessage(text=f"Analyze the general audience sentiment for '{movie_title}'. What do audiences typically praise or criticize?")
        response = await chat.send_message(message)
        
        try:
            import json
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except:
            return {"overall": "Mixed", "analysis": "Audience reception varies based on individual preferences."}
    
    async def summary_agent(self, movie_title: str, genre: str) -> str:
        """Creates spoiler-free summary"""
        chat = await self._create_chat(
            "You are a Summary Agent. Write compelling, spoiler-free summaries that help viewers decide whether to watch. "
            "Keep summaries under 120 words. Focus on premise, tone, and what makes it worth watching. NEVER reveal plot twists or endings."
        )
        
        message = UserMessage(text=f"Write a spoiler-free summary for '{movie_title}' ({genre}) in under 120 words.")
        response = await chat.send_message(message)
        return response
    
    async def recommendation_agent(self, movie_title: str, genre: str) -> List[dict]:
        """Recommends similar movies/series"""
        chat = await self._create_chat(
            "You are a Recommendation Agent. Suggest exactly 5 similar movies or TV series based on genre, tone, and themes. "
            "Respond ONLY with a JSON array (no markdown, no code blocks) with this exact format: "
            '[{"title": "Movie Name", "reason": "One sentence why it\'s similar"}]'
        )
        
        message = UserMessage(text=f"Recommend 5 movies/series similar to '{movie_title}' ({genre}). Consider genre, tone, themes, and style.")
        response = await chat.send_message(message)
        
        try:
            import json
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except:
            return [{"title": "Similar Movie", "reason": "Based on similar themes and genre."}]
    
    async def social_media_agent(self, movie_title: str, genre: str) -> List[str]:
        """Generates Instagram captions"""
        chat = await self._create_chat(
            "You are a Social Media Agent specializing in Instagram content. Create catchy, emoji-friendly captions for movie posts. "
            "Respond ONLY with a JSON array (no markdown, no code blocks) of exactly 3 caption strings. "
            "Each caption should be short (under 150 chars), include relevant emojis and 3-5 hashtags."
        )
        
        message = UserMessage(text=f"Create 3 Instagram captions for a post about '{movie_title}' ({genre}). Make them engaging and shareable.")
        response = await chat.send_message(message)
        
        try:
            import json
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except:
            return [
                f"Just watched {movie_title}! 🎬✨ #MovieNight #Cinema",
                f"{movie_title} hits different 🔥 #MustWatch #Film",
                f"This one's a gem 💎 {movie_title} #Movies #Recommended"
            ]
    
    async def personalized_recommendation_agent(self, movie_title: str, genre: str, preferences: Optional[dict] = None) -> List[dict]:
        """Recommends movies based on user preferences"""
        if not preferences or (not preferences.get('favorite_genres') and not preferences.get('favorite_languages') and not preferences.get('favorite_movies') and not preferences.get('current_mood')):
            return []
        
        pref_context = []
        if preferences.get('favorite_genres'):
            pref_context.append(f"Preferred genres: {', '.join(preferences['favorite_genres'])}")
        if preferences.get('favorite_languages'):
            pref_context.append(f"Preferred languages: {', '.join(preferences['favorite_languages'])}")
        if preferences.get('favorite_movies'):
            pref_context.append(f"Favorite movies: {', '.join(preferences['favorite_movies'][:5])}")
        if preferences.get('current_mood'):
            pref_context.append(f"Current mood: {preferences['current_mood']}")
        
        pref_str = ". ".join(pref_context)
        
        chat = await self._create_chat(
            "You are a Personalized Recommendation Agent. Suggest exactly 5 movies or TV series tailored to the user's specific preferences. "
            "Consider their favorite genres, languages, favorite movies, and current mood to make highly relevant suggestions. "
            "Respond ONLY with a JSON array (no markdown, no code blocks) with this exact format: "
            '[{"title": "Movie Name", "reason": "Why this matches their preferences"}]'
        )
        
        message = UserMessage(
            text=f"Based on the movie '{movie_title}' ({genre}) and the user's preferences: {pref_str}. "
            f"Recommend 5 movies/series that would perfectly match their taste and current mood."
        )
        response = await chat.send_message(message)
        
        try:
            import json
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except:
            return []
    
    async def validator_agent(self, analysis_data: dict) -> dict:
        """Validates and cleans the final output"""
        # Ensure no spoilers in content (basic check)
        spoiler_words = ['dies', 'killed', 'murder', 'twist is', 'ending', 'final scene', 'plot twist']
        
        for key in ['critic_analysis', 'summary', 'audience_sentiment']:
            if key in analysis_data:
                content = analysis_data[key].lower()
                for word in spoiler_words:
                    if word in content:
                        logger.warning(f"Potential spoiler detected in {key}")
        
        # Ensure recommendations are properly formatted
        if 'recommendations' in analysis_data:
            recs = analysis_data['recommendations']
            if not isinstance(recs, list):
                analysis_data['recommendations'] = []
            else:
                # Ensure max 5 recommendations
                analysis_data['recommendations'] = recs[:5]
        
        # Ensure captions are properly formatted
        if 'instagram_captions' in analysis_data:
            caps = analysis_data['instagram_captions']
            if not isinstance(caps, list):
                analysis_data['instagram_captions'] = []
            else:
                # Ensure max 3 captions
                analysis_data['instagram_captions'] = caps[:3]
        
        return analysis_data
    
    async def analyze_movie(self, movie_title: str, preferences: Optional[dict] = None) -> dict:
        """Main orchestration method"""
        logger.info(f"Starting analysis for: {movie_title}")
        
        # Step 1: Planner Agent - Get movie metadata
        logger.info("Running Planner Agent...")
        plan_data = await self.planner_agent(movie_title)
        genre = plan_data.get('genre', 'Drama')
        
        # Step 2: Run agents sequentially (as per spec)
        logger.info("Running Critic Agent...")
        critic_analysis = await self.critic_agent(movie_title, genre)
        
        logger.info("Running Sentiment Agent...")
        sentiment_data = await self.sentiment_agent(movie_title)
        
        logger.info("Running Summary Agent...")
        summary = await self.summary_agent(movie_title, genre)
        
        logger.info("Running Recommendation Agent...")
        recommendations = await self.recommendation_agent(movie_title, genre)
        
        logger.info("Running Social Media Agent...")
        captions = await self.social_media_agent(movie_title, genre)
        
        # Step 3: Personalized Recommendations (if preferences provided)
        personalized_recs = []
        if preferences:
            logger.info("Running Personalized Recommendation Agent...")
            personalized_recs = await self.personalized_recommendation_agent(movie_title, genre, preferences)
        
        # Assemble response
        analysis_result = {
            "movie_title": movie_title,
            "genre": genre,
            "overall_sentiment": sentiment_data.get('overall', 'Mixed'),
            "critic_analysis": critic_analysis,
            "audience_sentiment": sentiment_data.get('analysis', ''),
            "summary": summary,
            "recommendations": recommendations,
            "personalized_recommendations": personalized_recs,
            "instagram_captions": captions
        }
        
        # Step 4: Validator Agent
        logger.info("Running Validator Agent...")
        validated_result = await self.validator_agent(analysis_result)
        
        logger.info("Analysis complete!")
        return validated_result


# API Routes
@api_router.get("/")
async def root():
    return {"message": "CineMind AI - Movie Intelligence System"}

@api_router.post("/analyze-movie", response_model=MovieAnalysisResponse)
async def analyze_movie(request: MovieAnalysisRequest):
    if not request.movie_title or len(request.movie_title.strip()) < 1:
        raise HTTPException(status_code=400, detail="Movie title is required")
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM API key not configured")
    
    try:
        orchestrator = MultiAgentOrchestrator(EMERGENT_LLM_KEY)
        analysis_result = await orchestrator.analyze_movie(request.movie_title.strip())
        
        # Create response object
        response = MovieAnalysisResponse(**analysis_result)
        
        # Store in MongoDB
        doc = response.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        doc['recommendations'] = [r if isinstance(r, dict) else r.model_dump() for r in doc['recommendations']]
        await db.movie_analyses.insert_one(doc)
        
        return response
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.get("/analyses", response_model=List[MovieAnalysisResponse])
async def get_recent_analyses(limit: int = 10):
    """Get recent movie analyses"""
    analyses = await db.movie_analyses.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    
    for analysis in analyses:
        if isinstance(analysis.get('timestamp'), str):
            analysis['timestamp'] = datetime.fromisoformat(analysis['timestamp'])
    
    return analyses

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

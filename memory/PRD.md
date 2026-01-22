# CineMind AI - Movie Intelligence System PRD

## Original Problem Statement
Build an AI-powered Movie Intelligence System that analyzes movies or TV series and generates intelligent insights using a multi-agent architecture. The system performs professional movie analysis, audience sentiment analysis, spoiler-free summaries, similar movie recommendations, and Instagram-ready caption generation.

## User Choices
- **LLM Provider:** Gemini 3 Flash via Emergent Universal Key
- **Movie Metadata:** AI-only analysis (no TMDB)
- **Theme:** Dark cinematic (movie theater vibes)

## Architecture

### Multi-Agent System
```
Frontend (React) → FastAPI Backend → Multi-Agent Orchestrator → Gemini 3 Flash LLM

Agents:
1. Planner Agent - Extracts movie metadata (genre, type)
2. Critic Agent - Professional film critique
3. Sentiment Agent - Audience reaction analysis
4. Summary Agent - Spoiler-free 120-word summary
5. Recommendation Agent - 5 similar movies/series
6. Social Media Agent - 3 Instagram captions
7. Validator Agent - Quality assurance
```

### API Endpoints
- `POST /api/analyze-movie` - Main analysis endpoint
- `GET /api/analyses` - Recent analyses history
- `GET /api/` - Health check

### Frontend Routes
- `/` - HomePage with search input
- `/results` - Analysis results with bento grid

## User Personas
1. **Movie Enthusiasts** - Want quick insights before watching
2. **Content Creators** - Need shareable captions and summaries
3. **Film Bloggers** - Require professional critique material
4. **Social Media Managers** - Need ready-to-post content

## Core Requirements (Static)
- [x] Multi-agent AI architecture
- [x] Professional movie critique
- [x] Audience sentiment classification
- [x] Spoiler-free summaries (max 120 words)
- [x] 5 similar recommendations with reasons
- [x] 3 Instagram captions with emojis/hashtags
- [x] Copy-to-clipboard functionality
- [x] Dark cinematic UI theme
- [x] Responsive design

## What's Been Implemented
| Date | Feature | Status |
|------|---------|--------|
| 2025-01-22 | Multi-agent orchestrator with 7 agents | ✅ Complete |
| 2025-01-22 | Gemini 3 Flash LLM integration | ✅ Complete |
| 2025-01-22 | Movie analysis API endpoint | ✅ Complete |
| 2025-01-22 | HomePage with search UI | ✅ Complete |
| 2025-01-22 | ResultsPage with bento grid | ✅ Complete |
| 2025-01-22 | Copy-to-clipboard for captions | ✅ Complete |
| 2025-01-22 | Dark cinematic theme | ✅ Complete |
| 2025-01-22 | MongoDB storage for analyses | ✅ Complete |

## Prioritized Backlog

### P0 (Critical) - MVP ✅ Complete
- All core features implemented

### P1 (High Priority)
- User authentication (JWT/Google OAuth)
- Save favorite analyses
- Analysis history on homepage

### P2 (Medium Priority)
- TV series season-specific analysis
- Share analysis with unique link
- Export analysis as PDF
- Rate limiting for API

### P3 (Nice to Have)
- TMDB integration for movie posters
- User taste profile (Vector DB)
- Watchlist integration
- Social media auto-posting

## Next Tasks
1. Implement user authentication
2. Add analyses history view on homepage
3. Create shareable analysis links
4. Add TV series season selector

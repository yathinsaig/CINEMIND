import requests
import sys
import json
import time
from datetime import datetime

class MovieIntelligenceAPITester:
    def __init__(self, base_url="https://movieminds.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Root Endpoint", False, str(e))
            return False

    def test_analyze_movie_valid(self, movie_title="The Matrix", preferences=None):
        """Test movie analysis with valid input"""
        try:
            payload = {"movie_title": movie_title}
            if preferences:
                payload["preferences"] = preferences
                
            print(f"\n🔍 Testing movie analysis for: '{movie_title}'")
            if preferences:
                print(f"   With preferences: {preferences}")
            print("⏳ This may take 15-30 seconds due to AI processing...")
            
            start_time = time.time()
            response = requests.post(
                f"{self.api_url}/analyze-movie", 
                json=payload, 
                timeout=60  # Increased timeout for AI processing
            )
            end_time = time.time()
            
            success = response.status_code == 200
            processing_time = round(end_time - start_time, 2)
            
            if success:
                data = response.json()
                # Validate response structure
                required_fields = [
                    'id', 'movie_title', 'genre', 'overall_sentiment',
                    'critic_analysis', 'audience_sentiment', 'summary',
                    'recommendations', 'instagram_captions', 'timestamp'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Validate data quality
                    validation_errors = []
                    
                    if not data.get('critic_analysis') or len(data['critic_analysis']) < 50:
                        validation_errors.append("Critic analysis too short or empty")
                    
                    if not data.get('summary') or len(data['summary']) < 30:
                        validation_errors.append("Summary too short or empty")
                    
                    if not isinstance(data.get('recommendations'), list) or len(data['recommendations']) == 0:
                        validation_errors.append("No recommendations provided")
                    
                    if not isinstance(data.get('instagram_captions'), list) or len(data['instagram_captions']) == 0:
                        validation_errors.append("No Instagram captions provided")
                    
                    # Check personalized recommendations if preferences were provided
                    if preferences:
                        if 'personalized_recommendations' not in data:
                            validation_errors.append("Missing personalized_recommendations field when preferences provided")
                        elif not isinstance(data.get('personalized_recommendations'), list):
                            validation_errors.append("personalized_recommendations should be a list")
                    
                    if validation_errors:
                        success = False
                        details = f"Validation errors: {validation_errors}"
                    else:
                        details = f"Processing time: {processing_time}s, Genre: {data.get('genre')}, Sentiment: {data.get('overall_sentiment')}"
                        print(f"📊 Analysis Results:")
                        print(f"   Genre: {data.get('genre')}")
                        print(f"   Sentiment: {data.get('overall_sentiment')}")
                        print(f"   Recommendations: {len(data.get('recommendations', []))}")
                        print(f"   Personalized Recs: {len(data.get('personalized_recommendations', []))}")
                        print(f"   Captions: {len(data.get('instagram_captions', []))}")
                        
            else:
                try:
                    error_data = response.json()
                    details = f"Status: {response.status_code}, Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            test_name = f"Analyze Movie - {movie_title}"
            if preferences:
                test_name += " (with preferences)"
            self.log_test(test_name, success, details)
            return success, response.json() if success else None
            
        except requests.exceptions.Timeout:
            test_name = f"Analyze Movie - {movie_title}"
            if preferences:
                test_name += " (with preferences)"
            self.log_test(test_name, False, "Request timeout (>60s)")
            return False, None
        except Exception as e:
            test_name = f"Analyze Movie - {movie_title}"
            if preferences:
                test_name += " (with preferences)"
            self.log_test(test_name, False, str(e))
            return False, None

    def test_analyze_movie_empty_title(self):
        """Test movie analysis with empty title"""
        try:
            payload = {"movie_title": ""}
            response = requests.post(f"{self.api_url}/analyze-movie", json=payload, timeout=10)
            
            # Should return 400 for empty title
            success = response.status_code == 400
            details = f"Status: {response.status_code}"
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:100]}"
            
            self.log_test("Empty Title Validation", success, details)
            return success
        except Exception as e:
            self.log_test("Empty Title Validation", False, str(e))
            return False

    def test_analyze_movie_whitespace_title(self):
        """Test movie analysis with whitespace-only title"""
        try:
            payload = {"movie_title": "   "}
            response = requests.post(f"{self.api_url}/analyze-movie", json=payload, timeout=10)
            
            # Should return 400 for whitespace-only title
            success = response.status_code == 400
            details = f"Status: {response.status_code}"
            
            self.log_test("Whitespace Title Validation", success, details)
            return success
        except Exception as e:
            self.log_test("Whitespace Title Validation", False, str(e))
            return False

    def test_get_analyses(self):
        """Test getting recent analyses"""
        try:
            response = requests.get(f"{self.api_url}/analyses", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {response.status_code}, Count: {len(data)} analyses"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Get Recent Analyses", success, details)
            return success
        except Exception as e:
            self.log_test("Get Recent Analyses", False, str(e))
            return False

    def test_status_endpoints(self):
        """Test status check endpoints"""
        try:
            # Test POST status
            payload = {"client_name": "test_client"}
            response = requests.post(f"{self.api_url}/status", json=payload, timeout=10)
            post_success = response.status_code == 200
            
            # Test GET status
            response = requests.get(f"{self.api_url}/status", timeout=10)
            get_success = response.status_code == 200
            
            success = post_success and get_success
            details = f"POST: {post_success}, GET: {get_success}"
            
            self.log_test("Status Endpoints", success, details)
            return success
        except Exception as e:
            self.log_test("Status Endpoints", False, str(e))
            return False

    def test_personalized_recommendations(self):
        """Test personalized recommendations with user preferences"""
        try:
            # Test with comprehensive preferences
            preferences = {
                "favorite_genres": ["Action", "Sci-Fi", "Thriller"],
                "favorite_languages": ["English", "Japanese"],
                "favorite_movies": ["The Matrix", "Blade Runner", "Ghost in the Shell"],
                "current_mood": "adventurous"
            }
            
            success, data = self.test_analyze_movie_valid("Inception", preferences)
            
            if success and data:
                # Validate personalized recommendations
                personalized_recs = data.get('personalized_recommendations', [])
                if len(personalized_recs) > 0:
                    print(f"   ✅ Generated {len(personalized_recs)} personalized recommendations")
                    for i, rec in enumerate(personalized_recs[:3]):  # Show first 3
                        print(f"      {i+1}. {rec.get('title', 'N/A')}: {rec.get('reason', 'N/A')[:50]}...")
                    return True
                else:
                    self.log_test("Personalized Recommendations Generation", False, "No personalized recommendations generated despite preferences")
                    return False
            else:
                return False
                
        except Exception as e:
            self.log_test("Personalized Recommendations", False, str(e))
            return False

    def test_preferences_optional(self):
        """Test that preferences are optional and don't break regular analysis"""
        try:
            # Test with empty preferences
            empty_preferences = {
                "favorite_genres": [],
                "favorite_languages": [],
                "favorite_movies": [],
                "current_mood": None
            }
            
            success, data = self.test_analyze_movie_valid("Interstellar", empty_preferences)
            
            if success and data:
                # Should have empty or no personalized recommendations
                personalized_recs = data.get('personalized_recommendations', [])
                if len(personalized_recs) == 0:
                    print(f"   ✅ Correctly handled empty preferences - no personalized recs generated")
                    return True
                else:
                    self.log_test("Empty Preferences Handling", False, f"Generated {len(personalized_recs)} recs despite empty preferences")
                    return False
            else:
                return False
                
        except Exception as e:
            self.log_test("Empty Preferences Handling", False, str(e))
            return False

    def run_all_tests(self):
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Movie Intelligence API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_root_endpoint():
            print("\n❌ Root endpoint failed - API may be down")
            return False
        
        # Test core functionality
        self.test_analyze_movie_valid("The Matrix")
        
        # Test personalized recommendations feature
        self.test_personalized_recommendations()
        self.test_preferences_optional()
        
        # Test with another movie for validation
        self.test_analyze_movie_valid("Inception")  # Test with another movie
        
        # Test error handling
        self.test_analyze_movie_empty_title()
        self.test_analyze_movie_whitespace_title()
        
        # Test other endpoints
        self.test_get_analyses()
        self.test_status_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as overall success
        
        # Test other endpoints
        self.test_get_analyses()
        self.test_status_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as overall success

def main():
    tester = MovieIntelligenceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
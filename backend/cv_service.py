
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import base64

import hashlib

load_dotenv(override=True)

class CVService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.cache = {} # In-memory cache: hash -> result
        
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in CVService")
            self.model = None
        else:
            print(f"CVService utilizing API Key ending in: ...{api_key[-4:]}")
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

    async def diagnose_image(self, image_bytes):
        # 1. Check Cache
        image_hash = hashlib.md5(image_bytes).hexdigest()
        if image_hash in self.cache:
            print(f"Cache HIT for image: {image_hash}")
            return self.cache[image_hash]

        if not self.model:
            return {
                "disease_name": "Error",
                "confidence": 0,
                "reasoning": "Gemini API Key missing. Please check backend .env configuration.",
                "status": "error"
            }

        try:
            # Create the prompt
            print("Preparing prompt...")
            prompt = """
            You are an expert fish pathologist and aquaculture specialist.
            Analyze this image of a fish and identify any visible diseases or abnormalities.
            
            Provide the output in the following JSON format ONLY (no markdown):
            {
                "disease_name": "Name of disease or 'Healthy'",
                "confidence": "Low/Medium/High",
                "reasoning": "Detailed medical reasoning based on visual symptoms (e.g., 'White spots visible on fins indicate Ich', 'Red sores suggest ulcer disease'). Mention potential water quality causes (pH, Ammonia, etc.) if applicable.",
                "status": "Healthy/Infected"
            }
            
            If the image is not of a fish, return:
            {
                "disease_name": "Unknown",
                "confidence": "0",
                "reasoning": "The image does not appear to contain a fish.",
                "status": "unknown"
            }
            """
            
            # Create image part
            image_part = {
                "mime_type": "image/jpeg", # Assuming JPEG for simplicity, Gemini handles most
                "data": image_bytes
            }

            print("Sending request to Gemini Vision...")
            response = await self.model.generate_content_async([prompt, image_part])
            print("Received response from Gemini Vision.")
            
            # Parse JSON
            try:
                text = response.text.strip()
                # Remove markdown code blocks if present
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                
                result = json.loads(text)
                
                # Cache the successful result
                self.cache[image_hash] = result
                print(f"Cache STORED for image: {image_hash}")
                
                return result
            except json.JSONDecodeError:
                return {
                    "disease_name": "Error",
                    "confidence": 0,
                    "reasoning": f"Failed to parse AI response: {response.text}",
                    "status": "error"
                }

        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                 print(f"CV Service 429/Quota Error: {error_msg}")
                 return {
                    "disease_name": "Rate Limit / Quota Exceeded",
                    "confidence": 0,
                    "reasoning": "The AI service usage limit has been reached. If you are on the free tier, you may have exhausted your daily quota. Please check Google AI Studio or wait before retrying.",
                    "status": "rate_limit"
                }
            
            print(f"CV Diagnosis Error: {error_msg}")
            return {
                "disease_name": "Error",
                "confidence": 0,
                "reasoning": f"Diagnosis failed: {error_msg}",
                "status": "error"
            }

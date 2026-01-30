from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from logic import ExpertRules
from data_loader import DatasetStreamer
from weather_service import WeatherService
import joblib
import pandas as pd

# ... (other imports)

app = FastAPI(title="AquaNova Water Quality Predictor", version="1.0")

# Initialize Data Streamer
# Use absolute path for reliability in this environment
CSV_PATH = "/Users/abhi/Documents/Projects/AquaNova/dataset/Water Quality Monitoring Dataset_ Ireland.csv"
streamer = DatasetStreamer(CSV_PATH)
weather_service = WeatherService()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WaterQualityInput(BaseModel):
    temperature: float
    ph: float
    dissolved_oxygen: float
    turbidity: float
    ammonia: float = 0.0
    
    class Config:
        json_schema_extra = {
            "example": {
                "temperature": 25.5,
                "ph": 7.2,
                "dissolved_oxygen": 6.8,
                "turbidity": 1.2,
                "ammonia": 0.01
            }
        }

# Load models if available
model = None
le = None
MODEL_PATH = "disease_model.pkl"
ENCODER_PATH = "label_encoder.pkl"

if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        le = joblib.load(ENCODER_PATH)
        print("ML Model loaded successfully.")
    except Exception as e:
        print(f"Error loading ML model: {e}")


@app.get("/api/live-data")
async def get_live_data():
    """
    Get the next real data point from the Ireland dataset.
    """
    data = streamer.get_next()
    
    # Run analysis on this real data
    input_data = WaterQualityInput(
        temperature=data['temperature'],
        ph=data['ph'],
        dissolved_oxygen=data['dissolved_oxygen'],
        turbidity=data['turbidity'],
        ammonia=data['ammonia']
    )
    
    # Get predictions/logic
    analysis = ExpertRules.evaluate(input_data)
    
    # Merge raw data with analysis
    return {
        "sensor_data": data,
        "analysis": analysis
    }

@app.post("/predict")
async def predict_disease_risk(data: WaterQualityInput):
    """
    Predict disease occurrence based on water quality parameters using Hybrid approach (Rules + ML).
    """
    try:
        # 1. Expert Rules Analysis (Deterministic Baseline)
        analysis = ExpertRules.evaluate(data)
        
        # 2. ML Disease Prediction (Specific Diagnosis)
        disease_pred = "Analysis Pending"
        confidence = 100.0 # Default for rules
        
        if model and le:
            # Prepare input for ML
            # Feature order must match training
            input_df = pd.DataFrame([{
               'ph': data.ph,
               'dissolved_oxygen': data.dissolved_oxygen,
               'temperature': data.temperature,
               'turbidity': data.turbidity
            }])
            
            # Predict
            pred_idx = model.predict(input_df)[0]
            disease_pred = le.inverse_transform([pred_idx])[0]
            
            # Get probability/confidence
            probs = model.predict_proba(input_df)
            confidence = float(max(probs[0]) * 100)

        # 3. Combine Results
        # If rules say "Optimal", override ML noise unless confidence is very high
        if analysis["risk_status"] == "Optimal" and disease_pred != "Healthy" and confidence < 80:
             disease_pred = "Healthy"
        
        return {
            "disease_name": disease_pred, 
            "disease_level": 2 if analysis["risk_status"] == "Risk" else (1 if analysis["risk_status"] == "Warning" else 0),
            "risk_status": analysis["risk_status"].upper(),
            "confidence": round(confidence, 1),
            "recommendation": analysis["recommendation"],
            "suggestions": analysis["suggestions"],
            "suggestions_map": analysis["suggestions_map"],
            "triggers": analysis["triggers"],
            "health_score": analysis["health_score"],
            "detailed_solutions": ExpertRules.get_detailed_solutions(data),
            "input_values": {
                "temperature": data.temperature,
                "ph": data.ph,
                "dissolved_oxygen": data.dissolved_oxygen,
                "turbidity": data.turbidity
            }
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

class ForecastRequest(BaseModel):
    history: list # List of sensor data dicts
    timeframe: str = "5m" # Default to 5 minutes

@app.post("/api/forecast")
def get_forecast(request: ForecastRequest):
    from logic import Forecaster
    start_time, projections, insights = Forecaster.predict_trends(request.history, request.timeframe)
    return {
        "start_time": start_time,
        "projections": projections,
        "insights": insights
    }

@app.get("/api/weather-impact")
async def get_weather_impact(abnormal: bool = False):
    """
    Get real-time weather data and its impact on water quality.
    """
    try:
        current_weather = await weather_service.get_current_weather(abnormal=abnormal)
        forecast = await weather_service.get_forecast() # Forecast mocking handled inside service if needed
        
        impact_analysis = weather_service.analyze_impact(current_weather, forecast)
        
        # Add AQI to weather response
        aqi = weather_service._get_mock_aqi(abnormal=abnormal)
        
        return {
            "weather": {
                "temp": current_weather['main']['temp'] if current_weather else None,
                "humidity": current_weather['main']['humidity'] if current_weather else None,
                "pressure": current_weather['main']['pressure'] if current_weather else None,
                "wind_speed": current_weather['wind']['speed'] if current_weather else None,
                "aqi": aqi,
                "access":  "Connected" if current_weather else "Failed (Check API Key)",
                "description": current_weather['weather'][0]['description'] if current_weather else "N/A",
                "icon": current_weather['weather'][0]['icon'] if current_weather else None
            },
            "impact_analysis": impact_analysis,
            "digital_twin_location": "Burrishoole Catchment, Ireland"
        }
    except Exception as e:
        return {"error": f"Weather analysis failed: {str(e)}"}

@app.get("/")
async def root():
    mode = "Hybrid (Rules + ML)" if model else "Action-Based Expert Rules"
    return {"message": "AquaNova Water Quality Predictor API", "status": "active", "mode": mode}

# ---------------------------
# AquaGPT Chatbot Integration
# ---------------------------
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
weather_service.api_key = os.getenv("OPENWEATHER_API_KEY") or weather_service.api_key

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    chat_model = genai.GenerativeModel('gemini-flash-latest')
else:
    print("WARNING: GEMINI_API_KEY not found in .env")
    chat_model = None

class ChatRequest(BaseModel):
    message: str
    context: dict  # Sensor data

@app.post("/api/chat")
async def chat_with_aquagpt(request: ChatRequest):
    if not chat_model:
        return {"response": "I'm sorry, my brain (API Key) is missing. Please check the backend configuration."}
    
    try:
        # Construct System Prompt with Context
        sensor_context = (
            f"Current Water Parameters:\n"
            f"- Temperature: {request.context.get('temperature', 'N/A')}°C\n"
            f"- pH: {request.context.get('ph', 'N/A')}\n"
            f"- Dissolved Oxygen: {request.context.get('dissolved_oxygen', 'N/A')} mg/L\n"
            f"- Turbidity: {request.context.get('turbidity', 'N/A')} NTU\n"
            f"- Ammonia: {request.context.get('ammonia', 'N/A')} ppm\n"
        )
        
        system_prompt = (
            "You are AquaGPT, an expert aquaculture assistant powered by Gemini. "
            "You are helpful, concise, and knowledgeable about fish farming (specifically Tilapia). "
            "Analyze the user's question in the context of the provided live water parameters. "
            "If parameters are critical (e.g., Low Oxygen, High Ammonia), PRIORITIZE giving emergency advice. "
            "Keep answers short and actionable (under 3 sentences unless asked for detail)."
        )
        
        full_prompt = f"{system_prompt}\n\n{sensor_context}\n\nUser Question: {request.message}"
        
        # Generate Response
        response = chat_model.generate_content(full_prompt)
        return {"response": response.text}
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {"response": "I'm having trouble connecting to my knowledge base right now. Please try again."}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
from pydantic import BaseModel
import numpy as np
import os

app = FastAPI(title="AquaNova Water Quality Predictor", version="1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load production model components
try:
    if os.path.exists('production_model.pkl'):
        model = joblib.load('production_model.pkl')
        scaler = joblib.load('production_scaler.pkl')
        le = joblib.load('production_label_encoder.pkl')
        print("✅ Production model loaded successfully")
    else:
        print("❌ Model files not found. Please train the model first.")
        model = None
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

class WaterQualityInput(BaseModel):
    temperature: float
    ph: float
    dissolved_oxygen: float
    turbidity: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "temperature": 25.5,
                "ph": 7.2,
                "dissolved_oxygen": 6.8,
                "turbidity": 1.2
            }
        }

@app.post("/predict")
async def predict_disease_risk(data: WaterQualityInput):
    """
    Predict disease occurrence based on water quality parameters
    """
    if model is None:
        return {"error": "Model not loaded. Please train the model first."}
        
    try:
        # Prepare input features
        features_array = np.array([[
            data.temperature, 
            data.ph, 
            data.dissolved_oxygen, 
            data.turbidity
        ]])
        
        # Apply preprocessing
        features_scaled = scaler.transform(features_array)
        
        # Expert Rule Checking (Hybrid Approach)
        rules_triggered = []
        
        # pH Rules
        if data.ph <= 6:
            rules_triggered.append("pH is too low (Acidic)")
        elif data.ph >= 8:
            rules_triggered.append("pH is too high (Alkaline)")
            
        # Dissolved Oxygen Rules
        if data.dissolved_oxygen < 5.0:
            rules_triggered.append("Dissolved Oxygen is critically low")
            
        # Turbidity Rules
        if data.turbidity > 25:
            rules_triggered.append("Water is too turbid (Cloudy)")
            
        # Temperature Rules
        if data.temperature < 20: 
            rules_triggered.append("Temperature is too low")
        elif data.temperature > 34:
            rules_triggered.append("Temperature is too high")

        # If critical rules triggered, override
        if rules_triggered:
            disease_level = 2
            risk_status = "HIGH"
            confidence = 100.0
            recommendation = f"Critical Alert: {'; '.join(rules_triggered)}. Immediate action required."
        else:
            # ML Model Prediction for non-obvious cases
            prediction = model.predict(features_scaled)[0]
            probabilities = model.predict_proba(features_scaled)[0]
            
            disease_level = int(le.inverse_transform([prediction])[0])
            confidence = round(max(probabilities) * 100, 2)
            
            risk_status = "HIGH" if disease_level == 2 else "LOW"
            
            if disease_level == 2:
                recommendation = "High disease risk detected! Check oxygen levels and pH balance."
            else:
                recommendation = "Water quality is within acceptable range. Monitor regularly."
            
        return {
            "disease_level": int(disease_level),
            "risk_status": risk_status,
            "confidence": confidence,
            "recommendation": recommendation,
            "input_values": {
                "temperature": data.temperature,
                "ph": data.ph,
                "dissolved_oxygen": data.dissolved_oxygen,
                "turbidity": data.turbidity
            }
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "AquaNova Water Quality Predictor API", "status": "active"}

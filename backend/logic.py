class ExpertRules:
    @staticmethod
    def evaluate(data):
        """
        Evaluate water quality based on expert rules.
        
        Rules:
        - IF Dissolved Oxygen < 5.0 THEN Health = "Risk" (Hypoxia)
        - IF pH < 6.5 or > 8.5 THEN Health = "Risk" (Chemical Stress)
        - IF Turbidity > 25 THEN Health = "Warning" (Siltation)
        """
        triggers = []
        risk_status = "Optimal"
        health_score = 100

        # Dissolved Oxygen Rule
        if data.dissolved_oxygen < 5.0:
            triggers.append("Hypoxia (Critical Low Oxygen)")
            risk_status = "Risk"
            health_score -= 40
        elif data.dissolved_oxygen < 6.0:
            triggers.append("Low Oxygen (Warning)")
            if risk_status != "Risk": risk_status = "Warning"
            health_score -= 20

        # Ammonia Rule (Newly Added)
        if hasattr(data, 'ammonia'):
            if data.ammonia > 0.05:
                triggers.append("Toxic Ammonia (Critical)")
                risk_status = "Risk"
                health_score -= 40
            elif data.ammonia > 0.02:
                triggers.append("Elevated Ammonia (Warning)")
                if risk_status != "Risk": risk_status = "Warning"
                health_score -= 20

        # pH Rule
        if data.ph < 6.5:
            triggers.append("Acidic Water (Critical)")
            risk_status = "Risk"
            health_score -= 30
        elif data.ph < 6.8:
            triggers.append("Low pH (Warning)")
            if risk_status != "Risk": risk_status = "Warning"
            health_score -= 10
            
        if data.ph > 8.5:
            triggers.append("Alkaline Water (Critical)")
            risk_status = "Risk"
            health_score -= 30
        elif data.ph > 8.2:
            triggers.append("High pH (Warning)")
            if risk_status != "Risk": risk_status = "Warning"
            health_score -= 10

        # Turbidity Rule
        if data.turbidity > 25:
            triggers.append("High Turbidity (risk)")
            risk_status = "Risk" 
            health_score -= 20
        elif data.turbidity > 15:
            triggers.append("Turbidity Warning")
            if risk_status != "Risk": risk_status = "Warning"
            health_score -= 10

        # Temperature Rule
        if data.temperature < 20 or data.temperature > 34:
             triggers.append("Temperature Stress (Critical)")
             risk_status = "Risk"
             health_score -= 30
        elif data.temperature < 22 or data.temperature > 32:
             triggers.append("Temperature Warning")
             if risk_status != "Risk": risk_status = "Warning"
             health_score -= 10
        
        # Clamp health score
        health_score = max(0, health_score)

        suggestions_list, suggestions_map = ExpertRules.generate_suggestions(data)
        return {
            "risk_status": risk_status,
            "triggers": triggers,
            "health_score": health_score,
            "recommendation": ExpertRules.get_recommendation(risk_status, triggers),
            "suggestions": suggestions_list,
            "suggestions_map": suggestions_map
        }

    @staticmethod
    def get_recommendation(status, triggers):
        if status == "Optimal":
            return "Water quality is within ideal parameters. Continue regular monitoring."
        
        recommendations = []
        for trigger in triggers:
            if "Oxygen" in trigger:
                recommendations.append("Increase aeration (check paddle wheels/air stones).")
            if "Ammonia" in trigger:
                 recommendations.append("Stop feeding & perform water exchange.")
            if "Acidic" in trigger or "Low pH" in trigger:
                recommendations.append("Add lime/crushed coral to raise pH.")
            if "Alkaline" in trigger or "High pH" in trigger:
                recommendations.append("Add peat moss to lower pH.")
            if "Turbidity" in trigger:
                recommendations.append("Check filters & reduce feeding.")
            if "Temperature" in trigger:
                recommendations.append("Adjust heating/cooling or add shade.")
                
        return " | ".join(list(set(recommendations)))

    @staticmethod
    def generate_suggestions(data):
        """
        Generate specific numerical suggestions.
        Returns:
            suggestions_list: List of string messages
            suggestions_map: Dict mapping parameter name to message
        """
        suggestions_list = []
        suggestions_map = {}
        
        # Dissolved Oxygen (Target 6.0+)
        if data.dissolved_oxygen < 6.0:
            diff = 6.0 - data.dissolved_oxygen
            msg = f"Increase Dissolved Oxygen by {diff:.1f} mg/L by increasing aeration or checking air stones."
            suggestions_list.append(msg)
            suggestions_map["dissolved_oxygen"] = msg

        # pH (Target 7.0 - 8.0)
        if data.ph < 7.0:
            diff = 7.0 - data.ph
            msg = f"Raise pH by {diff:.1f} to reach 7.0 by adding crushed coral, lime, or baking soda."
            suggestions_list.append(msg)
            suggestions_map["ph"] = msg
        elif data.ph > 8.0:
            diff = data.ph - 8.0
            msg = f"Lower pH by {diff:.1f} to reach 8.0 by adding peat moss, driftwood, or CO2 injection."
            suggestions_list.append(msg)
            suggestions_map["ph"] = msg
            
        # Turbidity (Turn down to < 10)
        if data.turbidity > 15:
             msg = f"Reduce Turbidity by {data.turbidity - 10:.1f} NTU by cleaning filters, reducing feeding, or performing a partial water change."
             suggestions_list.append(msg)
             suggestions_map["turbidity"] = msg

        # Temperature (Target 26-30 for optimal growth, 20-34 is safe)
        if data.temperature < 26:
            diff = 26 - data.temperature
            msg = f"Increase Temperature by {diff:.1f}°C by checking heater settings or insulating the tank."
            suggestions_list.append(msg)
            suggestions_map["temperature"] = msg
        elif data.temperature > 30:
            diff = data.temperature - 30
            msg = f"Decrease Temperature by {diff:.1f}°C by using a chiller, fan, or adding cool water."
            suggestions_list.append(msg)
            suggestions_map["temperature"] = msg
            
        if not suggestions_list:
            suggestions_list = ["Conditions are optimal. Continue regular monitoring."]
            
        return suggestions_list, suggestions_map

    @staticmethod
    def get_detailed_solutions(data):
        """
        Generate detailed, structured solutions for abnormal values.
        Returns a list of dicts: { "param": str, "issue": str, "risk": str, "solution": str, "severity": str }
        """
        solutions = []
        
        # Dissolved Oxygen
        if data.dissolved_oxygen < 5.0:
            solutions.append({
                "param": "Dissolved Oxygen",
                "issue": f"Critical Low Oxygen ({data.dissolved_oxygen:.1f} mg/L)",
                "risk": "High risk of Fish Asphyxiation and Mass Mortality within hours.",
                "solution": "1. Activate emergency aeration (paddle wheels/blowers). 2. Stop feeding immediately to reduce oxygen demand. 3. Exchange 20% surface water if possible.",
                "severity": "critical"
            })
        elif data.dissolved_oxygen < 6.0:
             solutions.append({
                "param": "Dissolved Oxygen",
                "issue": f"Low Oxygen ({data.dissolved_oxygen:.1f} mg/L)",
                "risk": "Chronic stress, reduced growth, and susceptibility to disease.",
                "solution": "1. Increase aeration duration. 2. check stocking density. 3. Remove sludge/organic waste from bottom.",
                "severity": "warning"
            })

        # Ammonia
        if data.ammonia > 0.05:
            solutions.append({
                 "param": "Ammonia",
                 "issue": f"Toxic Ammonia Levels ({data.ammonia:.3f} ppm)",
                 "risk": "Gill damage, brain dysfunction, and death (Ammonia Poisoning).",
                 "solution": "1. Perform 50% water change immediately. 2. Stop feeding. 3. Add zeolite or ammonia binder. 4. Check bio-filter health.",
                 "severity": "critical"
            })
        elif data.ammonia > 0.02:
             solutions.append({
                 "param": "Ammonia",
                 "issue": f"Elevated Ammonia ({data.ammonia:.3f} ppm)",
                 "risk": "Stress and lowered immunity.",
                 "solution": "1. Reduce feeding by 50%. 2. Add nitrifying bacteria supplement. 3. Ensure pH is not too high (toxicity increases with pH).",
                 "severity": "warning"
            })

        # pH
        if data.ph < 6.5:
             solutions.append({
                 "param": "pH",
                 "issue": f"Acidic Water (pH {data.ph:.1f})",
                 "risk": "Acidosis: mucus secretion, gill damage, and gasping.",
                 "solution": "1. Apply agricultural lime (CaCO3) or crushed coral. 2. Aerate to strip CO2. 3. Avoid rapid changes (>0.5 pH/day).",
                 "severity": "critical"
            })
        elif data.ph > 8.5:
              solutions.append({
                 "param": "pH",
                 "issue": f"Alkaline Water (pH {data.ph:.1f})",
                 "risk": "Alkalosis: skin eye damage, and increased ammonia toxicity.",
                 "solution": "1. Add peat moss or driftwood. 2. Use alum (Aluminum Sulfate) carefully. 3. Check for algal blooms (high photosynthetic activity raises pH).",
                 "severity": "critical"
            })

        # Temperature
        if data.temperature > 34:
             solutions.append({
                 "param": "Temperature",
                 "issue": f"Extreme Heat ({data.temperature:.1f}°C)",
                 "risk": "Thermal shock, low oxygen holding capacity, and bacterial outbreaks.",
                 "solution": "1. Add shade nets over the pond. 2. Exchange with cooler water from bottom/well. 3. Stop feeding (metabolism is too fast).",
                 "severity": "critical"
            })
        elif data.temperature < 15:
              solutions.append({
                 "param": "Temperature",
                 "issue": f"Cold Water ({data.temperature:.1f}°C)",
                 "risk": "Hypothermia, inactivity, and fungal infections.",
                 "solution": "1. Check greenhouse/polyhouse covers. 2. Add warm water if feasible. 3. Stop feeding (digestion stops in cold).",
                 "severity": "critical"
            })

        # Turbidity
        if data.turbidity > 35:
             solutions.append({
                 "param": "Turbidity",
                 "issue": f"High Turbidity ({data.turbidity:.1f} NTU)",
                 "risk": "Clogged gills, reduced visibility for feeding, and stress.",
                 "solution": "1. Check for runoff/soil erosion entering pond. 2. Use coagulants like Alum or Gypsum. 3. Clean filters.",
                 "severity": "warning"
            })

        return solutions

import numpy as np
from datetime import datetime, timedelta

class Forecaster:
    @staticmethod
    def predict_trends(history: list, timeframe: str = '5m'):
        """
        Predict future trends using Linear Regression.
        
        Args:
            history: List of dicts containing historical sensor data.
            timeframe: Prediction horizon ('5m', '1h', '24h').
        """
        # Determine steps based on timeframe (assuming 5s data interval)
        # 5m = 60 steps
        # 1h = 720 steps
        # 24h = 17280 steps
        steps_map = {
            '5m': 60,
            '1h': 720,
            '24h': 17280
        }
        forecast_steps = steps_map.get(timeframe, 60)
        if len(history) < 5:
            return None, {}, [] # Not enough data
            
        projections = {
            "ph": [],
            "temperature": [],
            "dissolved_oxygen": [],
            "turbidity": []
        }
        
        insights = []
        
        # Expert Thresholds for Insights
        THRESHOLDS = {
            "ph": {"min": 6.5, "max": 8.5, "unit": ""},
            "dissolved_oxygen": {"min": 5.0, "max": 100.0, "unit": "mg/L"}, # Max is placeholder
            "turbidity": {"min": -1.0, "max": 25.0, "unit": "NTU"}, # Min is placeholder
            "temperature": {"min": 20.0, "max": 34.0, "unit": "°C"}
        }
        
        # Prepare X axis (time steps)
        x = np.arange(len(history))
        future_x = np.arange(len(history), len(history) + forecast_steps)
        
        for param in projections.keys():
            y = np.array([float(d[param]) for d in history])
            
            # Linear Regression (Degree 1)
            slope, intercept = np.polyfit(x, y, 1)
            
            # Predict
            future_y = slope * future_x + intercept
            projections[param] = future_y.tolist()
            
            # Generate Insights
            # Rate of change per minute (since 1 step = 5s, 12 steps = 1 min)
            rate_per_min = slope * 12
            
            current_val = y[-1]
            t_min = THRESHOLDS[param]["min"]
            t_max = THRESHOLDS[param]["max"]
            unit = THRESHOLDS[param]["unit"]
            
            # Check for declining trend towards minimum
            if slope < 0 and current_val > t_min:
                time_to_risk = (t_min - intercept) / slope
                steps_remaining = time_to_risk - len(history)
                if 0 < steps_remaining < 60: # Within next 5 mins (at 5s/step)
                    minutes = steps_remaining * 5 / 60
                    insights.append(f"{param.replace('_', ' ').title()} is dropping at {abs(rate_per_min):.2f} {unit}/min. Risk of falling below {t_min} {unit} in {minutes:.1f} minutes.")
            
            # Check for rising trend towards maximum
            elif slope > 0 and current_val < t_max:
                time_to_risk = (t_max - intercept) / slope
                steps_remaining = time_to_risk - len(history)
                if 0 < steps_remaining < 60:
                     minutes = steps_remaining * 5 / 60
                     insights.append(f"{param.replace('_', ' ').title()} is rising at {rate_per_min:.2f} {unit}/min. Risk of exceeding {t_max} {unit} in {minutes:.1f} minutes.")

        return history[-1].get("timestamp", datetime.now().isoformat()), projections, insights

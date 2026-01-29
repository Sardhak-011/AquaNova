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
            triggers.append("Hypoxia (Low Oxygen)")
            risk_status = "Risk"
            health_score -= 40

        # pH Rule
        if data.ph < 6.5:
            triggers.append("Acidic Water (Chemical Stress)")
            risk_status = "Risk"
            health_score -= 30
        elif data.ph > 8.5:
            triggers.append("Alkaline Water (Chemical Stress)")
            risk_status = "Risk"
            health_score -= 30

        # Turbidity Rule
        if data.turbidity > 25:
            triggers.append("High Turbidity (Siltation)")
            if risk_status != "Risk":
                risk_status = "Warning"
            health_score -= 20

        # Temperature Rule (Optional but good to have for completeness based on previous code)
        if data.temperature < 20 or data.temperature > 34:
             triggers.append("Temperature Stress")
             if risk_status != "Risk":
                 risk_status = "Warning"
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
            if "Hypoxia" in trigger:
                recommendations.append("Increase aeration immediately.")
            if "Acidic" in trigger:
                recommendations.append("Add crushed coral or lime to raise pH.")
            if "Alkaline" in trigger:
                recommendations.append("Add peat moss or driftwood to lower pH.")
            if "Turbidity" in trigger:
                recommendations.append("Check filtration system and reduce feeding.")
            if "Temperature" in trigger:
                recommendations.append("Adjust heater/chiller settings.")
                
        return " | ".join(recommendations)

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

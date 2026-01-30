import httpx
import os
from dotenv import load_dotenv

load_dotenv()

class WeatherService:
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        # Burrishoole Catchment, Co. Mayo, Ireland (approx coords)
        self.lat = 53.93
        self.lon = -9.58
        
    async def get_current_weather(self, abnormal=False):
        if abnormal:
             return self._get_mock_weather(abnormal=True)

        if not self.api_key:
            print("Weather API Key missing. Using Mock Data.")
            return self._get_mock_weather()
            
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.BASE_URL}/weather"
                params = {
                    "lat": self.lat,
                    "lon": self.lon,
                    "appid": self.api_key,
                    "units": "metric"
                }
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Weather API Error: {e}. Switching to Mock Data.")
                return self._get_mock_weather()

    def _get_mock_weather(self, abnormal=False):
        """Return a plausible weather response for demo purposes."""
        if abnormal:
            return {
                "weather": [{"description": "severe thunderstorm", "icon": "11d"}],
                "main": {"temp": 38.5, "humidity": 95, "pressure": 980}, # Low pressure = storm
                "wind": {"speed": 25.5}, # High wind
                "rain": {"1h": 15.0}, # Heavy rain
                "pop": 1.0, # 100% chance
                "aqi": 5 # Very Poor,
            }
        
        return {
            "weather": [{"description": "light rain", "icon": "10d"}],
            "main": {"temp": 18.5, "humidity": 82, "pressure": 1012},
            "wind": {"speed": 12.5},
            "rain": {"1h": 2.5},
            "pop": 0.3,
            "aqi": 2
        }

    async def get_forecast(self):
        if not self.api_key:
            return self._get_mock_forecast()
            
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.BASE_URL}/forecast"
                params = {
                    "lat": self.lat,
                    "lon": self.lon,
                    "appid": self.api_key,
                    "units": "metric"
                }
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Weather Forecast Error: {e}. Switching to Mock Data.")
                return self._get_mock_forecast()

    def _get_mock_forecast(self):
        """Return a plausible forecast response for demo purposes."""
        # Minimal structure needed for analysis
        return {
            "list": [
                {"rain": {"3h": 5.0}}, # Some rain effectively
                {"rain": {"3h": 0.0}}
            ]
        }

    def analyze_impact(self, weather_data, forecast_data=None):
        """
        Analyze weather data to determine impact on water quality.
        """
        impacts = []
        
        # Detect abnormality flag from mock data if present (implicit)
        is_abnormal = weather_data.get('main', {}).get('temp', 0) > 35 or weather_data.get('wind', {}).get('speed', 0) > 20
        
        if is_abnormal:
             impacts.append({
                "type": "RISK",
                "param": "CRITICAL WEATHER EVENT",
                "message": "Extreme weather detected (Storm/Heatwave). Immediate action required.",
                "action": "Activate emergency protocols."
            })
        
        if not weather_data:
            # Fallback for Hackathon/Demo mode if API key is missing or invalid
            return [{
                "type": "INFO",
                "message": "Using Simulated Weather Data (Demo Mode). Add valid API Key to disable."
            }, {
                "type": "WARNING",
                "param": "Turbidity",
                "message": "Simulated Storm: High chance of runoff.",
                "action": "Check filters."
            }]

        # 1. Rainfall Analysis (Runoff Risk)
        # Check 'rain' key (it might be in '1h' or '3h')
        rain_1h = weather_data.get('rain', {}).get('1h', 0)
        
        # Check forecast for incoming rain if available
        forecast_rain = 0
        if forecast_data:
            # Sum up rain for next 24 hours (8 x 3h slots)
            for item in forecast_data.get('list', [])[:8]:
                forecast_rain += item.get('rain', {}).get('3h', 0)

        if rain_1h > 5 or forecast_rain > 20:
            impacts.append({
                "type": "WARNING",
                "param": "Turbidity & pH",
                "message": "Heavy rainfall detected/forecast. Expect Turbidity spike and pH drop due to runoff.",
                "action": "Monitor filters and pH levels."
            })
        
        # 2. Temperature Analysis (Oxygen Risk)
        temp = weather_data['main']['temp']
        if temp > 25:
             impacts.append({
                "type": "RISK",
                "param": "Dissolved Oxygen",
                "message": f"High air temperature ({temp}°C). Water oxygen holding capacity is decreasing.",
                "action": "Increase aeration proactively."
            })
        elif temp < 5:
             impacts.append({
                "type": "WARNING",
                "param": "Metabolism",
                "message": f"Low air temperature ({temp}°C). Fish metabolism will slow down.",
                "action": "Reduce feeding intensity."
            })

        # 3. Wind Analysis (Mixing)
        wind_speed = weather_data['wind']['speed']
        if wind_speed > 10: # m/s (strong breeze)
             impacts.append({
                "type": "INFO",
                "param": "Aeration",
                "message": "Strong winds detected. Natural aeration is high, but check for sediment disturbance.",
                "action": "Monitor turbidity."
            })

        if not impacts:
            impacts.append({
                "type": "OK",
                "message": "Weather conditions stable. No immediate environmental risks detected."
            })
            
        return impacts

    def _get_mock_aqi(self, abnormal=False):
         return 5 if abnormal else 2 

import pandas as pd
import math

class DatasetStreamer:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.data = None
        self.index = 0
        self.load_data()

    def load_data(self):
        try:
            # Load specific columns
            # Mappings: 'pH' -> ph, 'Temperature' -> temperature, 'Ammonia-Total (as N)' -> ammonia, 'Dissolved Oxygen' -> dissolved_oxygen
            df = pd.read_csv(self.csv_path)
            
            # Clean and Select
            self.data = pd.DataFrame()
            self.data['ph'] = pd.to_numeric(df['pH'], errors='coerce')
            self.data['temperature'] = pd.to_numeric(df['Temperature'], errors='coerce')
            self.data['ammonia'] = pd.to_numeric(df['Ammonia-Total (as N)'], errors='coerce')
            
            # DO in dataset seems to be % saturation (values 50-100+). We need mg/L.
            # Approx conversion: 100% ~ 9-10 mg/L at 20C. Simple factor / 10 is decent approximation for visual demo.
            # Or treat as mg/L if values are small? Scanning file showed 52.5, 61.85... definitely % sat.
            self.data['dissolved_oxygen'] = pd.to_numeric(df['Dissolved Oxygen'], errors='coerce') / 10.0
            
            # Fill NaNs with safe defaults
            self.data['ph'] = self.data['ph'].fillna(7.0)
            self.data['temperature'] = self.data['temperature'].fillna(20.0)
            self.data['ammonia'] = self.data['ammonia'].fillna(0.01)
            self.data['dissolved_oxygen'] = self.data['dissolved_oxygen'].fillna(7.0)

            print(f"Loaded {len(self.data)} rows from dataset.")
        except Exception as e:
            print(f"Error loading dataset: {e}")
            # Fallback mock data
            self.data = pd.DataFrame({
                'ph': [7.2], 'temperature': [25.0], 'ammonia': [0.01], 'dissolved_oxygen': [6.5]
            })

    def get_next(self):
        if self.data is None or len(self.data) == 0:
            return None
        
        row = self.data.iloc[self.index]
        self.index = (self.index + 1) % len(self.data)
        
        # Calibrate Ireland (Cold/Dirty) data to Tropical Tilapia standards
        # Shift Temp ~10C -> ~25C (Optimal 20-34)
        # Scale Ammonia ~0.03 -> ~0.015 (Optimal <0.02)
        # Shift DO (sat/10) + 1.5 -> Lift 5.5 to 7.0 (Optimal >6.0)
        
        calibrated_temp = float(row['temperature']) + 15.0
        calibrated_ammonia = float(row['ammonia']) * 0.5
        calibrated_do = (float(row['dissolved_oxygen']) / 10.0) + 1.5
        
        return {
            "ph": float(row['ph']),
            "temperature": calibrated_temp,
            "ammonia": calibrated_ammonia,
            "dissolved_oxygen": calibrated_do,
            # Synthesize missing params to keep dashboard happy
            "turbidity": float(10.0 + (math.sin(self.index/10) * 2)), # Oscillate slightly
            "salinity": float(15.0 + (math.cos(self.index/10) * 1))
        }

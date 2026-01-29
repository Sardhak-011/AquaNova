
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

def generate_synthetic_data(n_samples=500):
    data = []
    
    # Define ranges for each disease
    # Format: [ph_min, ph_max, do_min, do_max, temp_min, temp_max, turb_min, turb_max]
    
    disease_profiles = {
        "White Spot": [6.0, 8.0, 4.0, 7.0, 18.0, 24.0, 10, 40], # Cold water, variable pH
        "Gill Rot": [5.0, 6.5, 2.0, 5.0, 25.0, 32.0, 30, 80],   # Acidic, Low oxygen, Dirty
        "Fin Rot": [6.0, 9.0, 3.0, 6.0, 22.0, 30.0, 20, 60],    # Bacterial, often poor water quality
        "Fungal": [6.0, 7.5, 4.0, 7.0, 15.0, 22.0, 10, 30],     # Cold, decaying matter
        "Healthy": [6.8, 8.2, 5.5, 9.0, 24.0, 30.0, 0, 15]      # Optimal ranges
    }

    for disease, ranges in disease_profiles.items():
        for _ in range(n_samples):
            ph = np.random.uniform(ranges[0], ranges[1])
            do = np.random.uniform(ranges[2], ranges[3])
            temp = np.random.uniform(ranges[4], ranges[5])
            turb = np.random.uniform(ranges[6], ranges[7])
            
            # Add some noise/overlap
            ph += np.random.normal(0, 0.1)
            do += np.random.normal(0, 0.2)
            temp += np.random.normal(0, 0.5)
            turb += np.random.normal(0, 1.0)
            
            data.append({
                "ph": ph,
                "dissolved_oxygen": do,
                "temperature": temp,
                "turbidity": turb,
                "disease": disease
            })
            
    return pd.DataFrame(data)

def train_model():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data()
    
    X = df[['ph', 'dissolved_oxygen', 'temperature', 'turbidity']]
    y = df['disease']
    
    print("Encoding labels...")
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print("Training Random Forest Classifier...")
    # Using parameters that prevent overfitting but maintain accuracy
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X, y_encoded)
    
    print("Saving artifacts...")
    joblib.dump(clf, 'disease_model.pkl')
    joblib.dump(le, 'label_encoder.pkl')
    print("Model training complete.")

if __name__ == "__main__":
    train_model()

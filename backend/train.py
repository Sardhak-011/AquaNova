import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report
import joblib
import numpy as np
import os

# Define relative paths
DATA_FILE = '../Data_Model_IoTMLCQ_2024.xlsx'

def train_model():
    print(f"Loading data from {DATA_FILE}...")
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    df = pd.read_excel(DATA_FILE)
    df_1 = df.drop_duplicates().copy()

    # Define features and target
    features = ['Temperature (°C)', 'pH', 'Dissolved Oxygen (mg/L)', 'Turbidity (NTU)']
    target = 'Disease Occurrence (Cases)'

    X = df_1[features]
    y = df_1[target]
    
    # Analyze class distribution
    print("\nCLASS DISTRIBUTION:")
    print(y.value_counts())


    # STEP 1: Temporal Split (prevents data leakage)
    split_idx = int(len(df_1) * 0.8)
    X_train = X.iloc[:split_idx]
    X_test = X.iloc[split_idx:]
    y_train = y.iloc[:split_idx]
    y_test = y.iloc[split_idx:]

    print(f"   Training: {len(X_train)} samples | Test: {len(X_test)} samples")

    # STEP 2: Feature Preprocessing
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    le = LabelEncoder()
    y_train_encoded = le.fit_transform(y_train)
    y_test_encoded = le.transform(y_test)

    # STEP 3: Model Configuration
    model = RandomForestClassifier(
        n_estimators=100,        
        max_depth=10,         
        min_samples_split=10, 
        min_samples_leaf=5,
        max_features='sqrt',   
        bootstrap=True,      
        oob_score=True,
        class_weight='balanced',       
        random_state=42
    )

    print("Training model...")
    model.fit(X_train_scaled, y_train_encoded)

    # STEP 4: Model Evaluation
    print("\nMODEL EVALUATION")
    train_score = model.score(X_train_scaled, y_train_encoded)
    test_score = model.score(X_test_scaled, y_test_encoded)
    overfitting_gap = train_score - test_score

    print(f"   Training Accuracy: {train_score:.4f}")
    print(f"   Test Accuracy:     {test_score:.4f}")
    print(f"   Overfitting Gap:   {overfitting_gap:.4f}")
    print(f"   OOB Score:         {model.oob_score_:.4f}")
    
    # Feature Importance
    print("\nFEATURE IMPORTANCE:")
    importances = model.feature_importances_
    for name, importance in zip(features, importances):
        print(f"   {name:<25}: {importance:.4f}")

    # STEP 7: Save Production Model
    print("\nSAVING PRODUCTION MODEL")
    joblib.dump(model, 'production_model.pkl')
    joblib.dump(scaler, 'production_scaler.pkl') 
    joblib.dump(le, 'production_label_encoder.pkl')
    print("✅ Production model components saved")

if __name__ == "__main__":
    train_model()

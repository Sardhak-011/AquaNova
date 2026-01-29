import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data(filepath):
    """
    Load and prepare the water quality dataset
    """
    print("📊 Loading dataset...")
    df = pd.read_csv(filepath)
    
    print(f"Dataset shape: {df.shape}")
    print(f"\nColumns: {df.columns.tolist()}")
    print(f"\nFirst few rows:")
    print(df.head())
    print(f"\nDataset info:")
    print(df.info())
    print(f"\nMissing values:")
    print(df.isnull().sum())
    
    return df

def preprocess_data(df, target_column='disease_level'):
    """
    Preprocess the data for training
    """
    print("\n🔧 Preprocessing data...")
    
    # Handle missing values
    df = df.dropna()
    
    # Define features
    feature_columns = ['temperature', 'ph', 'dissolved_oxygen', 'turbidity']
    
    # Check if all required columns exist
    missing_cols = [col for col in feature_columns if col not in df.columns]
    if missing_cols:
        print(f"❌ Missing columns: {missing_cols}")
        print(f"Available columns: {df.columns.tolist()}")
        raise ValueError(f"Required columns not found: {missing_cols}")
    
    # Check if target column exists
    if target_column not in df.columns:
        # Try alternative column names
        possible_targets = ['disease_occurrence', 'disease', 'target', 'label', 'class']
        for alt_target in possible_targets:
            if alt_target in df.columns:
                target_column = alt_target
                print(f"Using '{target_column}' as target column")
                break
        else:
            print(f"❌ Target column not found. Available columns: {df.columns.tolist()}")
            raise ValueError(f"Target column '{target_column}' not found")
    
    X = df[feature_columns]
    y = df[target_column]
    
    print(f"\nFeatures shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"\nTarget distribution:")
    print(y.value_counts())
    
    return X, y, feature_columns

def train_model(X, y):
    """
    Train the machine learning model
    """
    print("\n🚀 Starting model training...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Encode labels
    le = LabelEncoder()
    y_train_encoded = le.fit_transform(y_train)
    y_test_encoded = le.transform(y_test)
    
    print(f"\nLabel encoding: {dict(zip(le.classes_, le.transform(le.classes_)))}")
    
    # Train Random Forest model
    print("\n🌳 Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train_scaled, y_train_encoded)
    
    # Evaluate on training set
    train_pred = rf_model.predict(X_train_scaled)
    train_accuracy = accuracy_score(y_train_encoded, train_pred)
    print(f"Training Accuracy: {train_accuracy:.4f}")
    
    # Evaluate on test set
    test_pred = rf_model.predict(X_test_scaled)
    test_accuracy = accuracy_score(y_test_encoded, test_pred)
    print(f"Test Accuracy: {test_accuracy:.4f}")
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X_train_scaled, y_train_encoded, cv=5)
    print(f"Cross-validation scores: {cv_scores}")
    print(f"Mean CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # Classification report
    print("\n📊 Classification Report:")
    print(classification_report(y_test_encoded, test_pred, 
                                target_names=[str(c) for c in le.classes_]))
    
    # Confusion Matrix
    print("\n📊 Confusion Matrix:")
    print(confusion_matrix(y_test_encoded, test_pred))
    
    # Feature importance
    print("\n📊 Feature Importance:")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False)
    print(feature_importance)
    
    return rf_model, scaler, le, test_accuracy

def save_model(model, scaler, le):
    """
    Save the trained model components
    """
    print("\n💾 Saving model...")
    joblib.dump(model, 'production_model.pkl')
    joblib.dump(scaler, 'production_scaler.pkl')
    joblib.dump(le, 'production_label_encoder.pkl')
    print("✅ Model saved successfully!")
    print("   - production_model.pkl")
    print("   - production_scaler.pkl")
    print("   - production_label_encoder.pkl")

def main():
    """
    Main training pipeline
    """
    print("=" * 60)
    print("🌊 AquaNova Water Quality ML Model Training")
    print("=" * 60)
    
    # Specify your dataset path here
    dataset_path = '../Data_Model_IoTMLCQ_2024.xlsx'
    
    try:
        # Load data
        print("📊 Loading dataset...")
        if dataset_path.endswith('.xlsx'):
            df = pd.read_excel(dataset_path)
        else:
            df = pd.read_csv(dataset_path)
            
        # Rename columns to match expected format
        column_mapping = {
            'Temperature (°C)': 'temperature',
            'pH': 'ph',
            'Dissolved Oxygen (mg/L)': 'dissolved_oxygen',
            'Turbidity (NTU)': 'turbidity',
            'Disease Occurrence (Cases)': 'disease_level'
        }
        df = df.rename(columns=column_mapping)
        
        # Check for duplicate columns
        print(f"\nBefore deduplication, columns: {df.columns.tolist()}")
        if len(df.columns) != len(set(df.columns)):
            print("⚠️ Duplicate columns found! Handling duplicates...")
            df = df.loc[:, ~df.columns.duplicated()]
        
        # Preprocess
        X, y, feature_columns = preprocess_data(df, target_column='disease_level')
        
        # Train model
        model, scaler, le, accuracy = train_model(X, y)
        
        # Save model
        save_model(model, scaler, le)
        
        print("\n" + "=" * 60)
        print(f"✅ Training Complete! Final Test Accuracy: {accuracy:.4f}")
        print("=" * 60)
        
        # Test prediction
        print("\n🧪 Testing a sample prediction...")
        sample = np.array([[25.5, 7.2, 6.8, 1.2]])
        sample_scaled = scaler.transform(sample)
        prediction = model.predict(sample_scaled)[0]
        probabilities = model.predict_proba(sample_scaled)[0]
        disease_level = le.inverse_transform([prediction])[0]
        
        print(f"Sample input: Temperature=25.5, pH=7.2, DO=6.8, Turbidity=1.2")
        print(f"Predicted disease level: {disease_level}")
        print(f"Confidence: {max(probabilities)*100:.2f}%")
        print(f"Class probabilities: {probabilities}")
        
    except FileNotFoundError:
        print(f"\n❌ Error: Dataset file '{dataset_path}' not found!")
        print("Please ensure your dataset file is in the same directory.")
        print("\nExpected format:")
        print("  - CSV file with columns: temperature, ph, dissolved_oxygen, turbidity, disease_level")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
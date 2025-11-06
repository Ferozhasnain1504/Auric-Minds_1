import numpy as np
import joblib
import librosa
import os

# --- Configuration (Relative path to models folder) ---
MODELS_DIR = 'models/'
VSD_FEATURE_DIM = 16

# --- 1. Load ML Components Globally ---
try:
    VSD_MODEL = joblib.load(os.path.join(MODELS_DIR, 'vsd_logistic_model.pkl'))
    VSD_SCALER = joblib.load(os.path.join(MODELS_DIR, 'vsd_feature_scaler.pkl'))
    print(f"✅ VSD components loaded. Scaler expects {VSD_SCALER.n_features_in_} features.")
except Exception as e:
    print(f"❌ ERROR: Could not load VSD ML components. Check models directory. Details: {e}")
    # In a production environment, you might want to stop the application here (e.g., raise)


# ==========================================================
# 2. VSD Prediction Logic (16-Feature Extraction & Prediction)
# ==========================================================

def extract_features(file_path, sr=16000):
    """
    Extracts 16 features (13 MFCCs, RMS Mean, ZCR Mean, Pitch Mean).
    """
    try:
        signal, original_sr = librosa.load(file_path, sr=None)
        if original_sr != sr:
             signal = librosa.resample(y=signal, orig_sr=original_sr, target_sr=sr)

        # 1. MFCCs (Mean of 13 coefficients)
        mfccs = librosa.feature.mfcc(y=signal, sr=sr, n_mfcc=13)
        mfccs_mean = np.mean(mfccs.T, axis=0)
        
        # 2. RMS Energy, 3. ZCR, 4. Pitch Mean
        rms_mean = np.mean(librosa.feature.rms(y=signal)[0])
        zcr_mean = np.mean(librosa.feature.zero_crossing_rate(y=signal)[0])
        pitches, _ = librosa.core.piptrack(y=signal, sr=sr, fmin=75, fmax=300)
        pitch = pitches[pitches > 0]
        pitch_mean = np.mean(pitch) if pitch.size > 0 else 0
        
        all_features = np.hstack([mfccs_mean, rms_mean, zcr_mean, pitch_mean])

        if len(all_features) != VSD_FEATURE_DIM:
             raise ValueError(f"Feature extraction error: Expected {VSD_FEATURE_DIM} features, got {len(all_features)}")
             
        return all_features.tolist()

    except Exception as e:
        # print(f"⚠️ Feature extraction failed: {e}")
        return None

def predict_vsd_risk(feature_vector):
    """Predicts the VSD Risk (0-100) using the final corrected (inversion) logic."""
    if len(feature_vector) != VSD_FEATURE_DIM:
        raise ValueError(f"Input features must be a vector of length {VSD_FEATURE_DIM}. Received {len(feature_vector)}")
        
    X_new = np.array(feature_vector).reshape(1, -1) 
    
    # Check scaler dimension expectation (Extra Safety Check)
    if VSD_SCALER.n_features_in_ != VSD_FEATURE_DIM:
        raise ValueError(f"Scaler expects {VSD_SCALER.n_features_in_} features, but prediction received {VSD_FEATURE_DIM}")

    X_new_scaled = VSD_SCALER.transform(X_new)
    probabilities = VSD_MODEL.predict_proba(X_new_scaled)
    model_predicted_risk = probabilities[0][1] * 100 
    
    # FINAL CORRECTION: Invert the score (100 = Calm/Low Risk)
    final_risk_score = 100 - model_predicted_risk
    
    return np.clip(final_risk_score, 0, 100)


# ==========================================================
# 3. DHT22 Kalman Filter (Ambient Data Smoothing)
# ==========================================================

class DHT22_KalmanFilter:
    """Implements two independent 1D Kalman Filters for smoothing T/H readings."""
    def __init__(self, initial_temp, initial_humidity, R_temp=0.5, R_humidity=1.0, Q=0.01):
        self.temp_estimate = initial_temp
        self.humidity_estimate = initial_humidity
        self.P_temp = 1.0  
        self.P_humidity = 1.0
        self.R_temp = R_temp
        self.R_humidity = R_humidity
        self.Q = Q 
        self.F = 1.0 
        self.H = 1.0 

    def update_filter(self, measured_temp, measured_humidity):
        # 1. TEMPERATURE FILTER
        temp_pred = self.F * self.temp_estimate
        P_temp_pred = self.F * self.P_temp * self.F + self.Q
        K_temp = P_temp_pred * self.H * (1 / (self.H * P_temp_pred * self.H + self.R_temp))
        temp_residual = measured_temp - self.H * temp_pred
        self.temp_estimate = temp_pred + K_temp * temp_residual
        self.P_temp = (1 - K_temp * self.H) * P_temp_pred
        
        # 2. HUMIDITY FILTER
        humidity_pred = self.F * self.humidity_estimate
        P_humidity_pred = self.F * self.P_humidity * self.F + self.Q
        K_humidity = P_humidity_pred * self.H * (1 / (self.H * P_humidity_pred * self.H + self.R_humidity))
        humidity_residual = measured_humidity - self.H * humidity_pred
        self.humidity_estimate = humidity_pred + K_humidity * humidity_residual
        self.P_humidity = (1 - K_humidity * self.H) * P_humidity_pred
        
        return self.temp_estimate, self.humidity_estimate


# ==========================================================
# 4. Wellness Fusion Engine (Final State Estimator)
# ==========================================================

class WellnessFusionEngine:
    """
    Implements a 1D Kalman Filter to fuse VSD Risk (volatile) 
    and Ambient Data (stable heuristic) into a stable Wellness Index.
    """
    def __init__(self, initial_wellness=80.0, Q=0.01, R_vsd=10.0, R_ambient=2.0):
        self.wellness_estimate = initial_wellness
        self.P_wellness = 1.0 
        self.Q = Q
        self.R_vsd = R_vsd
        self.R_ambient = R_ambient
        self.F = 1.0 
        self.H = 1.0
        # print(f"✅ Fusion Engine initialized...")

    def _calculate_ambient_impact(self, smoothed_temp, smoothed_humidity):
        """Maps smoothed ambient data (T/H) to an Ambient Wellness Score (0-100)."""
        # Ideal comfort: 24C, 50% Humidity.
        T_penalty = max(0, abs(smoothed_temp - 24.0) - 2.0) * 5
        T_score = np.clip(100 - T_penalty, 0, 100)
        
        H_penalty = max(0, abs(smoothed_humidity - 50.0) - 10.0) * 2
        H_score = np.clip(100 - H_penalty, 0, 100)
        
        # Combine (T is 60%, H is 40%)
        ambient_wellness_measurement = (T_score * 0.6) + (H_score * 0.4)
        return ambient_wellness_measurement

    def update_fusion(self, vsd_risk_score, smoothed_temp, smoothed_humidity, measurement_source='VSD'):
        """Applies the Kalman Filter cycle using the specified measurement source."""
        
        wellness_measurement_vsd = vsd_risk_score
        wellness_measurement_ambient = self._calculate_ambient_impact(smoothed_temp, smoothed_humidity)

        # 1. Select Measurement (Z) and Noise (R)
        if measurement_source == 'VSD':
            Z = wellness_measurement_vsd
            R = self.R_vsd
        elif measurement_source == 'AMBIENT':
            Z = wellness_measurement_ambient
            R = self.R_ambient
        else:
            Z = self.wellness_estimate 
            R = 50.0 # High uncertainty if no new data

        # 2. Predict Step
        wellness_pred = self.F * self.wellness_estimate
        P_pred = self.F * self.P_wellness * self.F + self.Q

        # 3. Update Step
        K = P_pred * self.H * (1 / (self.H * P_pred * self.H + R))
        residual = Z - self.H * wellness_pred
        self.wellness_estimate = wellness_pred + K * residual
        self.wellness_estimate = np.clip(self.wellness_estimate, 0, 100) # Clamp output

        self.P_wellness = (1 - K * self.H) * P_pred
        
        return self.wellness_estimate
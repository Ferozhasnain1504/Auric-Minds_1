from flask import Flask, request, jsonify
import numpy as np
import os
import time
from werkzeug.utils import secure_filename

# --- IMPORT ALL LOGIC FROM UTILITY FILE ---
from utils.wellness_logic import (
    extract_features, 
    predict_vsd_risk, 
    DHT22_KalmanFilter, 
    WellnessFusionEngine # <-- NEW FUSION ENGINE
)

app = Flask(__name__)
UPLOAD_FOLDER = 'temp_uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# ==========================================================
# 🧠 GLOBAL INITIALIZATION OF STATE ESTIMATORS
# ==========================================================

# Initial values for Kalman Filters (Based on a typical indoor environment)
INITIAL_TEMP = 25.0
INITIAL_HUMIDITY = 50.0
INITIAL_WELLNESS = 80.0 # Start with a neutral/good wellness score

try:
    # 1. Initialize DHT22 Kalman Filter for smoothing T/H
    DHT_KALMAN_FILTER = DHT22_KalmanFilter(INITIAL_TEMP, INITIAL_HUMIDITY)
    
    # 2. Initialize Wellness Fusion Engine (Main state tracker)
    FUSION_ENGINE = WellnessFusionEngine(initial_wellness=INITIAL_WELLNESS)
    
    print("\n==============================================")
    print("🤖 Service Initialized: All components ready.")
    print(f"🌡️ Starting T/H Estimate: {DHT_KALMAN_FILTER.temp_estimate:.2f}C / {DHT_KALMAN_FILTER.humidity_estimate:.2f}%")
    print(f"✨ Starting Wellness Index: {FUSION_ENGINE.wellness_estimate:.2f}/100")
    print("==============================================")
    
except Exception as e:
    print(f"FATAL ERROR during initialization (Check models/ or wellness_logic.py): {e}")
    # Consider exiting the application if initialization fails


# ==========================================================
# 🎙️ ENDPOINT 1: VOICE ANALYSIS (/analyze)
# Used by Node.js Gateway
# ==========================================================

def generate_wellness_recommendation(wellness_index, vsd_score):
    """Generates a text recommendation based on the stable Wellness Index (0-100) 
       and the volatile VSD Score (0-100, where 100=Calm/Low Risk).
    """
    
    # NOTE: Both scores are 0=High Risk, 100=Low Risk

    # 1. CRITICAL STRESS (VSD score is very low, indicating severe momentary stress)
    if vsd_score < 30:
        return "🔴 Critical Stress Spike Detected! Immediate Action Required: Stop work, stand up, and perform deep breathing exercises. Take a 15-minute break."

    # 2. HIGH STRESS (Stable index is low, indicating sustained fatigue)
    elif wellness_index < 50:
        return "⚠️ Sustained High Fatigue. Recommendation: Disengage from the current task and rest. Review your sleep patterns."
    
    # 3. MODERATE STRESS (VSD is moderate, or stable index is moderate)
    elif vsd_score < 75 or wellness_index < 80:
        # Check if ambient conditions might be contributing (Heuristic: If smooth T/H estimates are below ideal)
        # We can't access T/H directly here, so we stick to VSD/Wellness Index
        if vsd_score < 75:
            return "🟡 Moderate Stress/Fatigue Detected. Recommendation: Take a short break, stretch, and check if your environment (temperature/lighting) is comfortable."
        else: # wellness_index is in the moderate range
            return "🟡 Moderate Fatigue/Wellness Drop. Continue monitoring. Maintain focus on ergonomic comfort."

    # 4. LOW/GOOD WELLNESS
    else: # vsd_score >= 75 and wellness_index >= 80
        return "🟢 Low Stress Detected. System Stable. Keep up the good work and maintain current focus."
# --- The rest of app.py continues below ---

# ==========================================================
# 🎙️ ENDPOINT 1: VOICE ANALYSIS (/analyze)
# Used by Node.js Gateway
# ==========================================================
@app.route('/analyze', methods=['POST'])
def analyze_voice():
    # 1. Handle File Upload
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file part in the request'}), 400
    
    file = request.files['audio']
    filename = secure_filename(f"temp_{time.time()}.wav")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # 2. Predict Volatile Risk Score
        features = extract_features(filepath)
        if features is None:
            return jsonify({'error': 'Feature extraction failed or file corrupted'}), 500
        
        vsd_risk_score = predict_vsd_risk(features)
        
        # 3. Fusion: Use VSD score to update the state
        # The fusion engine reads the current *smoothed* ambient state
        smoothed_T = DHT_KALMAN_FILTER.temp_estimate
        smoothed_H = DHT_KALMAN_FILTER.humidity_estimate
        
        final_wellness_index = FUSION_ENGINE.update_fusion(
            vsd_risk_score, 
            smoothed_T, 
            smoothed_H, 
            measurement_source='VSD' # <-- Voice score is the measurement
        )

        # 4. Generate Recommendation
        # This function must be defined globally in app.py!
        recommendation_text = generate_wellness_recommendation(final_wellness_index, vsd_risk_score) # <--- ADD THIS ARGUMENT
        
        return jsonify({
            'status': 'success',
            'vsd_risk_score': round(vsd_risk_score, 2),
            'current_temp_estimate': round(smoothed_T, 2),
            'current_humidity_estimate': round(smoothed_H, 2),
            'final_wellness_index': round(final_wellness_index, 2),
            'recommendation': recommendation_text # <-- Text output added
        })

    except Exception as e:
        app.logger.error(f'ML Processing Error in /analyze: {e}')
        return jsonify({'error': f'ML Processing Error: {e}'}), 500
        
    finally:
        # 5. Cleanup
        if os.path.exists(filepath):
            os.remove(filepath)

# ==========================================================
# 🌡️ ENDPOINT 2: AMBIENT SENSING (/ambient)
# Used by ESP32/another service
# ==========================================================
@app.route('/ambient', methods=['POST'])
def update_ambient():
    # Expects JSON data: {"temperature": 25.1, "humidity": 51.5}
    try:
        data = request.get_json()
        temp = float(data['temperature'])
        humidity = float(data['humidity'])
        
        # 1. Smooth the new readings
        smoothed_T, smoothed_H = DHT_KALMAN_FILTER.update_filter(temp, humidity)
        
        # 2. Fusion: Use the smoothed ambient data (heuristic) as the measurement for state update
        # VSD score used here is arbitrary, as the source is AMBIENT
        final_wellness_index = FUSION_ENGINE.update_fusion(
            FUSION_ENGINE.wellness_estimate, 
            smoothed_T, 
            smoothed_H, 
            measurement_source='AMBIENT' # <-- Ambient heuristic is the measurement
        )

        return jsonify({
            'status': 'success',
            'message': 'Ambient data smoothed and fused.',
            'smoothed_temperature': round(smoothed_T, 2),
            'smoothed_humidity': round(smoothed_H, 2),
            'final_wellness_index': round(final_wellness_index, 2)
        })

    except Exception as e:
        app.logger.error(f'Ambient Data Error in /ambient: {e}')
        return jsonify({'error': f'Ambient Data Error: Invalid input or processing failure: {e}'}), 400


# ==========================================================
# 🏁 RUN APPLICATION
# ==========================================================
if __name__ == '__main__':
    # Ensure this port matches what your Node.js gateway is calling
    app.run(debug=True, host='0.0.0.0', port=5001)
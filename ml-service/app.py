from flask import Flask, request, jsonify
import librosa
import numpy as np
import soundfile as sf
import os
from datetime import datetime
import joblib

# ----------------------------------------------------
#  Initialize Flask App
# ----------------------------------------------------
app = Flask(__name__)

# ----------------------------------------------------
#  Load Pre-trained Model and Scaler
# ----------------------------------------------------
SCALER_PATH = "models/vsd_feature_scaler.pkl"
MODEL_PATH  = "models/vsd_logistic_model.pkl"

try:
    scaler = joblib.load(SCALER_PATH)
    model  = joblib.load(MODEL_PATH)
    print("✅ Loaded model and scaler successfully!")
except Exception as e:
    print("❌ Error loading model or scaler:", e)
    scaler, model = None, None

# ----------------------------------------------------
#  Feature Extraction
# ----------------------------------------------------
def extract_features(file_path):
    """Extract audio features from a .wav file"""
    y, sr = librosa.load(file_path, sr=None)

    rms = np.mean(librosa.feature.rms(y=y))
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))
    mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13), axis=1)
    pitch, _ = librosa.piptrack(y=y, sr=sr)
    avg_pitch = np.mean(pitch[pitch > 0]) if np.any(pitch > 0) else 0

    return {
        "rms": float(rms),
        "zcr": float(zcr),
        "avg_pitch": float(avg_pitch),
        "mfccs": mfccs.tolist()
    }

# ----------------------------------------------------
#  Real Prediction using Logistic Model
# ----------------------------------------------------
def predict_stress_fatigue(features):
    if scaler is None or model is None:
        raise RuntimeError("Model or scaler not loaded!")

    # Prepare features in same order used during training
    X = np.array([
        features["rms"],
        features["zcr"],
        features["avg_pitch"],
        *features["mfccs"][:13]   # first 13 MFCCs
    ]).reshape(1, -1)

    # Scale and predict
    X_scaled = scaler.transform(X)
    y_pred = model.predict(X_scaled)[0]
    y_prob = model.predict_proba(X_scaled)[0].tolist()

    # Convert probability to readable scores
    stress_score = int(y_prob[1] * 100)   # class 1 = stressed
    fatigue_score = 100 - stress_score

    if stress_score < 30:
        recommendation = "You seem calm. Keep it up!"
    elif stress_score < 60:
        recommendation = "Moderate stress detected. Take short breaks."
    else:
        recommendation = "High stress detected. Try deep breathing exercises."

    return {
        "stress_score": stress_score,
        "fatigue_score": fatigue_score,
        "label": int(y_pred),
        "recommendation": recommendation
    }

# ----------------------------------------------------
#  Routes
# ----------------------------------------------------
@app.route("/")
def home():
    return jsonify({"ok": True, "msg": "ML Service Running", "time": str(datetime.utcnow())})

@app.route("/analyze", methods=["POST"])
def analyze_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    file_path = f"temp_{datetime.now().timestamp()}.wav"
    audio_file.save(file_path)

    try:
        features = extract_features(file_path)
        result = predict_stress_fatigue(features)
        os.remove(file_path)

        return jsonify({
            "ok": True,
            "features": features,
            "stress_score": result["stress_score"],
            "fatigue_score": result["fatigue_score"],
            "label": result["label"],
            "recommendation": result["recommendation"]
        })
    except Exception as e:
        # keep file cleanup safe
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": str(e)}), 500

# ----------------------------------------------------
#  Run App
# ----------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

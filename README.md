# 🧠 AI-Driven Early Fatigue and Stress Detection Using Ambient Sensing & Voice Analytics  

### 📘 Overview  
This project detects **early signs of fatigue and stress** using **ambient sensing (temperature, humidity)** and **voice analytics**, without requiring wearables or internet connectivity.  
It is a **non-invasive**, **privacy-first**, and **offline AI system** that computes a **Wellness Index (0–100)** to indicate stress or fatigue level and provides **personalized wellness suggestions**.  

---

## 🎯 Objectives  
- Capture **voice** and **environmental** data (temperature, humidity) to detect fatigue/stress.  
- Use a **Logistic Regression model** for lightweight, offline inference.  
- Generate a **Wellness Index (0–100)** and show personalized feedback.  
- Ensure **data privacy** through complete local (offline) processing.  

---

## 💡 Proposed Solution  

### 🧩 System Flow  
1. **Data Capture:**  
   - **INMP441:** Captures short voice samples.  
   - **DHT22:** Measures temperature and humidity.  

2. **Feature Extraction:**  
   - Extract **MFCCs, pitch, and tone variations** from the voice signal.  
   - Normalize temperature and humidity readings.  

3. **Model Inference (Offline):**  
   - A **Logistic Regression model** classifies user state as  
     *Normal*, *Mild Stress*, or *High Stress*.  
   - Output is converted to a **Wellness Index (0–100)**.  

4. **Display & Recommendation:**  
   - Dashboard shows the **predicted stress level** and gives recommendations like:  
     - “Hydrate yourself 💧”  
     - “Take a short rest 💤”  
     - “Try breathing exercises 🌿”  

---

## ⚙️ Tech Stack  
| Component | Technology Used |
|------------|----------------|
| 🧠 Machine Learning | Logistic Regression (Scikit-learn) |
| 🎤 Audio Processing | Librosa, PyAudio |
| 🌡️ Sensor | DHT22 (Temperature & Humidity) |
| 💻 Microcontroller | ESP32 / Arduino Uno |
| 🖥️ Backend | Python (Flask / Local Inference) |
| 🌐 Frontend | Streamlit / HTML, CSS, JS |
| 📊 Visualization | Matplotlib / Plotly |

---

## 🔒 Privacy & Security  
- All data is **processed locally** — no cloud uploads.  
- **Voice data** is deleted immediately after inference.  
- Ensures **100% offline functionality** for privacy and reliability.  

---

## 🚀 Setup & Usage  

### 1️⃣ Clone Repository  
```bash
git clone https://github.com/your-username/AI-Stress-Detection.git
cd AI-Stress-Detection
```

### 2️⃣ Install Dependencies
```
pip install -r requirements.txt
```

### 3️⃣ Connect Sensors
* DHT22 → ESP32 GPIO pins (3.3V, GND, Data pin)
* INMP441 → I2S pins (WS, SD, SCK, VCC, GND)

### 4️⃣ Run Application
```
python main.py
```

### 5️⃣ Access Dashboard
* Open Streamlit or local web UI
* Record short voice sample → Display stress result & recommendations

---

## 🧠 Machine Learning Model

* Algorithm: Logistic Regression
* Input Features:
 * Voice: MFCCs, tone, energy
 * Ambient: Temperature, Humidity
* Output Classes:
 * 0 → Normal
 * 1 → Mild Stress
 * 2 → High Stress

---

## 📈 Feasibility

✅ Offline operation — suitable for low-connectivity environments
✅ Low cost — only DHT22 + INMP441 + ESP32 required
✅ Lightweight — Logistic Regression ensures fast local inference
✅ Scalable — can be extended to healthcare, workplaces, or student wellness

---

## ⚡ Innovation & Uniqueness (UVP)

* No wearables, no internet required
* Combines voice emotion and environmental context for prediction
* Uses simple, explainable ML (Logistic Regression)
* Designed for real-time stress detection and actionable feedback

---

## 🧩 Example Output

| Parameter          | Value        | Status                |
| ------------------ | ------------ | --------------------- |
| Voice Tone         | Tense        | ⚠️ Moderate Stress    |
| Temperature        | 31.5°C       | ⚠️ Slightly Warm      |
| Humidity           | 78%          | ✅ Normal             |
| **Wellness Index** | **67 / 100** | Mild Fatigue Detected |

---

## 🛠️ Future Improvements

* Add facial expression recognition (optional camera input).
* Enable multi-user tracking for workplaces or classrooms.
* Convert model to TensorFlow Lite for direct ESP32 inference.
* Include real-time alerts and mobile notifications.

---

## 👥 Team

**Project Title**: AI-Driven Early Fatigue and Stress Detection Using Ambient Sensing & Voice Analytics

**Institution**: JSS Academy of Technical Education

**Team Members**: Amoghvarsh Bhasme, Atharva Madamshetty, Feroz Hasnain, Samarth Deshpande, K Pavan Gowda

---

## 💬 Acknowledgements

We thank our faculty and mentors for their continuous guidance in developing this privacy-preserving AI wellness project.

---

## 🧾 License

Licensed under the MIT License — free to use and modify with attribution.





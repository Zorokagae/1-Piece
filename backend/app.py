from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Mock pathogen database
PATHOGEN_DB = {
    "ATCGMRSA": {"name": "MRSA", "risk_factor": 3.5, "description": "Methicillin-resistant Staphylococcus aureus"},
    "GCTCDEF": {"name": "C. difficile", "risk_factor": 4.0, "description": "Clostridioides difficile bacteria"},
    "ATCGECOLI": {"name": "E. coli", "risk_factor": 2.8, "description": "Escherichia coli"},
    "ATCGPSEUD": {"name": "P. aeruginosa", "risk_factor": 3.2, "description": "Pseudomonas aeruginosa"}
}

# Alert storage
alerts = []

@app.route('/')
def index():
    return jsonify({
        "message": "1-PIECE Predictive Microbiome Shield API",
        "version": "1.0.0"
    })

@app.route('/api/pathogen/identify', methods=['POST'])
def identify_pathogen():
    data = request.get_json()
    sequence = data.get('sequence', '')
    location = data.get('location', 'Unknown')
    
    # Get first 8 characters as pathogen ID
    pathogen_id = sequence[:8].upper()
    pathogen = PATHOGEN_DB.get(pathogen_id, {
        "name": "Unknown",
        "risk_factor": 1.0,
        "description": "Unidentified pathogen"
    })
    
    return jsonify({
        "success": True,
        "pathogen": pathogen,
        "location": location,
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/api/risk/calculate', methods=['POST'])
def calculate_risk():
    data = request.get_json()
    pathogen_name = data.get('pathogen_name', 'Unknown')
    location = data.get('location', 'Unknown')
    staff_count = data.get('staff_count', 1)
    time_of_day = data.get('time_of_day', 'day')
    
    # Base risk from pathogen
    base_risk = {
        "MRSA": 70,
        "C. difficile": 80,
        "E. coli": 60,
        "P. aeruginosa": 65
    }.get(pathogen_name, 50)
    
    # Location multiplier
    location_multiplier = {
        "OR1": 1.2,
        "OR2": 1.3,
        "OR3": 1.5,
        "ICU1": 1.4,
        "ICU2": 1.3
    }.get(location, 1.0)
    
    # Calculate risk score
    risk_score = base_risk * location_multiplier
    risk_score += staff_count * 2  # Staff activity factor
    
    # Time of day factor
    time_factor = {
        "morning": 1.1,
        "afternoon": 1.0,
        "evening": 1.2,
        "night": 0.9
    }.get(time_of_day, 1.0)
    
    risk_score *= time_factor
    risk_score += random.uniform(-5, 5)  # Add some randomness
    risk_score = max(0, min(100, risk_score))  # Clamp between 0-100
    
    # Determine risk level
    if risk_score >= 80:
        risk_level = "CRITICAL"
    elif risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return jsonify({
        "success": True,
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "location": location,
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/api/alert/trigger', methods=['POST'])
def trigger_alert():
    data = request.get_json()
    risk_score = data.get('risk_score', 0)
    location = data.get('location', 'Unknown')
    pathogen_name = data.get('pathogen_name', 'Unknown')
    
    if risk_score >= 80:
        alert = {
            "id": str(uuid.uuid4()),
            "location": location,
            "risk_score": risk_score,
            "pathogen_name": pathogen_name,
            "message": f"CRITICAL: {risk_score}% infection risk detected in {location}",
            "timestamp": datetime.datetime.now().isoformat(),
            "status": "ACTIVE",
            "actions": [
                "Deploy UV disinfection robots",
                "Delay non-urgent procedures",
                "Alert infection control team"
            ]
        }
        alerts.append(alert)
        return jsonify({
            "success": True,
            "alert": alert,
            "action": "ALERT_TRIGGERED"
        })
    else:
        return jsonify({
            "success": True,
            "message": "Risk level normal, no alert needed",
            "action": "NO_ACTION"
        })

@app.route('/api/dashboard/data', methods=['GET'])
def get_dashboard_data():
    dashboard_data = {
        "locations": [
            {"id": "OR1", "name": "Operating Room 1", "risk_score": 45},
            {"id": "OR2", "name": "Operating Room 2", "risk_score": 72},
            {"id": "OR3", "name": "Operating Room 3", "risk_score": 89},
            {"id": "ICU1", "name": "ICU Room 1", "risk_score": 34},
            {"id": "ICU2", "name": "ICU Room 2", "risk_score": 56}
        ],
        "alerts": alerts[-5:],  # Last 5 alerts
        "stats": {
            "total_pathogens_detected": 24,
            "alerts_triggered_today": 3,
            "risk_reduction": "23%"
        }
    }
    
    return jsonify(dashboard_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI
import os
from dotenv import load_dotenv
from database import db
from auth import hash_password, verify_password, create_access_token, get_current_user

load_dotenv()

app = FastAPI(title="AyurvedaGPT API")

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class MedicineRequest(BaseModel):
    symptoms: List[str]
    health_conditions: List[str]

class Medicine(BaseModel):
    name: str
    description: str
    recommended_dosage: str
    timing: str
    precautions: Optional[str] = None

class PrescriptionItem(BaseModel):
    medicine_name: str
    dosage: str
    timing: str
    duration: Optional[str] = None

class DiagnosisData(BaseModel):
    primary_condition: Optional[str] = ""
    secondary_conditions: Optional[List[str]] = []
    ayurvedic_analysis: Optional[str] = ""

class GeneratePrescriptionRequest(BaseModel):
    patient_name: str
    patient_age: int
    patient_gender: str
    symptoms: List[str]
    health_conditions: List[str]
    medicines: List[PrescriptionItem]
    doctor_name: str
    doctor_registration: Optional[str] = None
    diagnosis: Optional[DiagnosisData] = None

# Auth models
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    registration_number: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: int
    symptoms: List[str]
    health_conditions: List[str]
    diagnosis: dict
    medicines: List[dict]
    notes: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AyurvedaGPT API is running"}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    """Register a new doctor/user"""
    # Check if user already exists
    existing_user = db.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = hash_password(request.password)

    # Create user
    user_id = db.create_user(
        email=request.email,
        password=hashed_password,
        name=request.name,
        phone=request.phone,
        registration_number=request.registration_number
    )

    if not user_id:
        raise HTTPException(status_code=500, detail="Failed to create user")

    # Create access token
    access_token = create_access_token(data={"user_id": user_id, "email": request.email})

    # Get user data
    user = db.get_user_by_id(user_id)
    user_data = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "phone": user["phone"],
        "registration_number": user["registration_number"]
    }

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login user"""
    # Get user
    user = db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create access token
    access_token = create_access_token(data={"user_id": user["id"], "email": user["email"]})

    # User data (exclude password)
    user_data = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "phone": user["phone"],
        "registration_number": user["registration_number"]
    }

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user"""
    user = db.get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "phone": user["phone"],
        "registration_number": user["registration_number"]
    }

    return {"success": True, "user": user_data}

# Admin/Debug endpoints
@app.get("/api/admin/users")
async def list_all_users():
    """Debug endpoint to view all users in database (for checking PostgreSQL)"""
    conn = db.get_connection()
    cursor = conn.cursor()

    try:
        # Import USE_POSTGRES from database module
        from database import USE_POSTGRES

        if USE_POSTGRES:
            cursor.execute("SELECT id, email, name, phone, registration_number, created_at FROM users ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT id, email, name, phone, registration_number, created_at FROM users ORDER BY created_at DESC")

        users = cursor.fetchall()
        users_list = [dict(user) for user in users]

        return {
            "success": True,
            "database_type": "PostgreSQL" if USE_POSTGRES else "SQLite",
            "user_count": len(users_list),
            "users": users_list
        }
    finally:
        conn.close()

# Patient endpoints
@app.post("/api/patients")
async def create_patient(patient: PatientCreate, current_user: dict = Depends(get_current_user)):
    """Create a new patient"""
    patient_id = db.create_patient(
        user_id=current_user["user_id"],
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone
    )

    patient_data = db.get_patient(patient_id, current_user["user_id"])
    return {"success": True, "patient": patient_data}

@app.get("/api/patients")
async def get_patients(current_user: dict = Depends(get_current_user)):
    """Get all patients for current user"""
    patients = db.get_user_patients(current_user["user_id"])
    return {"success": True, "patients": patients}

@app.get("/api/patients/{patient_id}")
async def get_patient(patient_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific patient"""
    patient = db.get_patient(patient_id, current_user["user_id"])
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True, "patient": patient}

@app.get("/api/patients/{patient_id}/prescriptions")
async def get_patient_prescriptions(patient_id: int, current_user: dict = Depends(get_current_user)):
    """Get all prescriptions for a patient"""
    prescriptions = db.get_patient_prescriptions(patient_id, current_user["user_id"])
    return {"success": True, "prescriptions": prescriptions}

# Prescription endpoints
@app.post("/api/prescriptions")
async def create_prescription(prescription: PrescriptionCreate, current_user: dict = Depends(get_current_user)):
    """Save a prescription"""
    # Verify patient belongs to user
    patient = db.get_patient(prescription.patient_id, current_user["user_id"])
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    prescription_id = db.create_prescription(
        user_id=current_user["user_id"],
        patient_id=prescription.patient_id,
        symptoms=prescription.symptoms,
        health_conditions=prescription.health_conditions,
        diagnosis=prescription.diagnosis,
        medicines=prescription.medicines,
        notes=prescription.notes
    )

    prescription_data = db.get_prescription(prescription_id, current_user["user_id"])
    return {"success": True, "prescription": prescription_data}

@app.get("/api/prescriptions")
async def get_prescriptions(current_user: dict = Depends(get_current_user)):
    """Get recent prescriptions for current user"""
    prescriptions = db.get_user_prescriptions(current_user["user_id"])
    return {"success": True, "prescriptions": prescriptions}

@app.post("/api/medicines/search")
async def search_medicines(request: MedicineRequest, current_user: dict = Depends(get_current_user)):
    """
    Search for Ayurvedic medicines based on symptoms, health conditions, and historical data
    Uses past prescriptions as primary source, AI as fallback
    """
    try:
        # Step 1: Find similar prescriptions from database
        similar_prescriptions = db.find_similar_prescriptions(
            symptoms=request.symptoms,
            health_conditions=request.health_conditions,
            user_id=current_user["user_id"],  # Only this doctor's prescriptions
            limit=5
        )

        # Step 2: Extract medicines from similar prescriptions
        historical_medicines = []
        seen_medicine_names = set()

        for prescription in similar_prescriptions:
            for med in prescription['medicines']:
                med_name = med.get('medicine_name', '')
                # Avoid duplicates
                if med_name and med_name not in seen_medicine_names:
                    seen_medicine_names.add(med_name)
                    historical_medicines.append({
                        "name": med_name,
                        "description": f"Previously prescribed for similar symptoms (Match: {prescription['symptom_matches']} symptoms, {prescription['condition_matches']} conditions)",
                        "recommended_dosage": med.get('dosage', ''),
                        "timing": med.get('timing', ''),
                        "precautions": None,
                        "source": "historical",
                        "similarity_score": prescription['similarity_score']
                    })

        # Step 3: Use AI only if we don't have enough historical data
        target_count = 8
        diagnosis = None
        ai_medicines = []

        if len(historical_medicines) < target_count:
            # Not enough historical data, use AI
            # Create prompt for OpenAI
            prompt = f"""You are an expert Ayurvedic doctor. Based on the following patient information, first diagnose the possible disease(s), then suggest appropriate Ayurvedic medicines.

Symptoms: {', '.join(request.symptoms)}
Health Conditions: {', '.join(request.health_conditions)}

STEP 1: DIAGNOSIS
Based on the symptoms, provide:
1. Primary possible disease/condition (most likely)
2. Secondary possible diseases (if applicable)
3. Brief explanation in Ayurvedic terms (Vata/Pitta/Kapha imbalance if relevant)

STEP 2: MEDICINE RECOMMENDATIONS
Please provide EXACTLY 8 Ayurvedic medicines (both proprietary branded and classical formulations) that would be appropriate for the diagnosed condition and symptoms.

IMPORTANT GUIDELINES:
- Include PROPRIETARY BRANDED medicines from companies like:
  * Acharya Shushruta (e.g vahinil)
  * Himalaya (e.g., Liv.52, Mentat, Brahmi, Ashvagandha)
  * Dabur (e.g., Chyawanprash, Honitus, Stresscom)
  * Baidyanath (e.g., Kesari Kalp, Ashwagandharishta, Brahmi Vati)
  * Patanjali (e.g., Divya medicines)
  * Zandu (e.g., Pancharishta, Chyawanprash)
  * Other well-known brands
- Also include CLASSICAL Ayurvedic formulations (e.g., Triphala, Dashamularishta, Ashwagandharishta)
- Each medicine should be a POLYHERBAL/MULTI-INGREDIENT FORMULATION (combination of multiple herbs/drugs)
- Include the brand name AND main constituent herbs/drugs in the description
- Focus on medicines commonly prescribed and easily available in the market
- Provide a good mix of different dosage forms: tablets, syrups, churnas (powders), capsules, etc.

For each medicine, provide:
1. Brand/Product name with company if proprietary (e.g., "Himalaya Liv.52", "Dabur Chyawanprash", or "Triphala Churna")
2. Brief description including main herbs/constituents and what it treats
3. Recommended dosage with specific form (tablets, syrup, churna, capsules)
4. Best timing to take (e.g., "Before meals", "After meals", "Before bedtime")
5. Any important precautions or contraindications

Format your response as a JSON object with diagnosis and medicines:
{{
  "diagnosis": {{
    "primary_condition": "Primary disease/condition name",
    "secondary_conditions": ["Secondary condition 1", "Secondary condition 2"],
    "ayurvedic_analysis": "Brief explanation of dosha imbalance and Ayurvedic perspective"
  }},
  "medicines": [
    {{
      "name": "Brand/Company Name + Product Name (if branded)",
      "description": "What it treats, benefits, and key ingredients/herbs",
      "recommended_dosage": "Specific dosage with form (e.g., 2 tablets, 10ml syrup, 3g churna)",
      "timing": "When to take",
      "precautions": "Important precautions if any"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object with diagnosis and EXACTLY {target_count - len(historical_medicines)} medicines, no additional text."""

            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert Ayurvedic doctor. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            # Parse the response
            import json
            response_text = response.choices[0].message.content

            # Extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            json_text = response_text[start_idx:end_idx]

            result = json.loads(json_text)

            # Get diagnosis and medicines from AI
            diagnosis = result.get("diagnosis", {})
            ai_medicines_raw = result.get("medicines", [])

            # Add source label to AI medicines
            for med in ai_medicines_raw:
                med['source'] = 'ai'
                ai_medicines.append(med)

        # Step 4: Combine historical and AI medicines
        # Prioritize historical medicines (they come first)
        combined_medicines = historical_medicines + ai_medicines

        # Use diagnosis from historical prescription if available, otherwise from AI
        if similar_prescriptions and similar_prescriptions[0].get('diagnosis_primary'):
            diagnosis = {
                "primary_condition": similar_prescriptions[0]['diagnosis_primary'],
                "secondary_conditions": similar_prescriptions[0]['diagnosis_secondary'],
                "ayurvedic_analysis": similar_prescriptions[0].get('diagnosis_ayurvedic', '')
            }
        elif not diagnosis:
            # No historical diagnosis and no AI diagnosis
            diagnosis = {
                "primary_condition": "",
                "secondary_conditions": [],
                "ayurvedic_analysis": ""
            }

        return {
            "success": True,
            "diagnosis": diagnosis,
            "medicines": combined_medicines[:target_count],  # Limit to target count
            "source_info": {
                "historical_count": len(historical_medicines),
                "ai_count": len(ai_medicines),
                "total_count": len(combined_medicines)
            }
        }

    except Exception as e:
        import traceback
        print(f"ERROR in search_medicines: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error searching medicines: {str(e)}")

@app.post("/api/prescription/generate")
async def generate_prescription(request: GeneratePrescriptionRequest, current_user: dict = Depends(get_current_user)):
    """
    Generate a formatted prescription document and save to database
    """
    try:
        # Step 1: Check if patient exists (by name, age, gender for this user)
        existing_patients = db.get_user_patients(current_user["user_id"])
        patient = None
        for p in existing_patients:
            if (p['name'].lower() == request.patient_name.lower() and
                p['age'] == request.patient_age and
                p['gender'].lower() == request.patient_gender.lower()):
                patient = p
                break

        # Step 2: Create patient if doesn't exist
        if not patient:
            patient_id = db.create_patient(
                user_id=current_user["user_id"],
                name=request.patient_name,
                age=request.patient_age,
                gender=request.patient_gender,
                phone=None
            )
            patient = db.get_patient(patient_id, current_user["user_id"])

        # Step 3: Save prescription to database
        # Convert medicines list to dict format for database
        medicines_data = [
            {
                "medicine_name": med.medicine_name,
                "dosage": med.dosage,
                "timing": med.timing,
                "duration": med.duration or ""
            }
            for med in request.medicines
        ]

        # Use diagnosis from request or create empty dict if not provided
        if request.diagnosis:
            diagnosis = {
                "primary_condition": request.diagnosis.primary_condition or "",
                "secondary_conditions": request.diagnosis.secondary_conditions or [],
                "ayurvedic_analysis": request.diagnosis.ayurvedic_analysis or ""
            }
        else:
            diagnosis = {
                "primary_condition": "",
                "secondary_conditions": [],
                "ayurvedic_analysis": ""
            }

        prescription_id = db.create_prescription(
            user_id=current_user["user_id"],
            patient_id=patient["id"],
            symptoms=request.symptoms,
            health_conditions=request.health_conditions,
            diagnosis=diagnosis,
            medicines=medicines_data,
            notes=None
        )

        # Step 4: Generate HTML prescription
        # Create HTML prescription format
        prescription_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @media print {{
            body {{ margin: 0; padding: 20px; }}
        }}
        body {{
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }}
        .header {{
            text-align: center;
            border-bottom: 3px solid #297691;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #297691;
            margin: 0;
            font-size: 28px;
        }}
        .header p {{
            color: #4B95AF;
            margin: 5px 0;
        }}
        .section {{
            margin-bottom: 25px;
        }}
        .section-title {{
            background: #297691;
            color: white;
            padding: 10px 15px;
            margin-bottom: 15px;
            font-weight: bold;
            font-size: 16px;
        }}
        .patient-info {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 0 15px;
        }}
        .info-item {{
            padding: 8px 0;
        }}
        .info-label {{
            color: #19647F;
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }}
        .medicines-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }}
        .medicines-table th {{
            background: #4B95AF;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }}
        .medicines-table td {{
            padding: 12px;
            border-bottom: 1px solid #6DB4CD;
        }}
        .medicines-table tr:nth-child(even) {{
            background: #f8f9fa;
        }}
        .symptoms-list, .conditions-list {{
            padding: 0 15px;
        }}
        .symptoms-list ul, .conditions-list ul {{
            list-style: none;
            padding: 0;
        }}
        .symptoms-list li, .conditions-list li {{
            padding: 5px 0;
            color: #053445;
        }}
        .symptoms-list li:before, .conditions-list li:before {{
            content: "• ";
            color: #297691;
            font-weight: bold;
            margin-right: 8px;
        }}
        .footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #6DB4CD;
            text-align: right;
        }}
        .signature {{
            margin-top: 60px;
        }}
        .doctor-name {{
            font-weight: bold;
            color: #297691;
        }}
        .print-button {{
            background: #297691;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            margin: 20px auto;
            display: block;
        }}
        .print-button:hover {{
            background: #19647F;
        }}
        @media print {{
            .print-button {{
                display: none;
            }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 AYURVEDIC PRESCRIPTION 🌿</h1>
        <p>Traditional Medicine for Modern Wellness</p>
        <p>Date: {__import__('datetime').datetime.now().strftime('%B %d, %Y')}</p>
    </div>

    <div class="section">
        <div class="section-title">PATIENT INFORMATION</div>
        <div class="patient-info">
            <div class="info-item">
                <span class="info-label">Name:</span>
                <span>{request.patient_name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Age:</span>
                <span>{request.patient_age} years</span>
            </div>
            <div class="info-item">
                <span class="info-label">Gender:</span>
                <span>{request.patient_gender}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Date:</span>
                <span>{__import__('datetime').datetime.now().strftime('%d/%m/%Y')}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">SYMPTOMS</div>
        <div class="symptoms-list">
            <ul>
                {''.join([f'<li>{symptom}</li>' for symptom in request.symptoms])}
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-title">HEALTH CONDITIONS</div>
        <div class="conditions-list">
            <ul>
                {''.join([f'<li>{condition}</li>' for condition in request.health_conditions]) if request.health_conditions else '<li>None reported</li>'}
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PRESCRIBED MEDICINES</div>
        <table class="medicines-table">
            <thead>
                <tr>
                    <th style="width: 5%">#</th>
                    <th style="width: 35%">Medicine Name</th>
                    <th style="width: 30%">Dosage</th>
                    <th style="width: 30%">Timing</th>
                </tr>
            </thead>
            <tbody>
                {''.join([f'''
                <tr>
                    <td>{idx + 1}</td>
                    <td><strong>{med.medicine_name}</strong></td>
                    <td>{med.dosage}</td>
                    <td>{med.timing}</td>
                </tr>
                ''' for idx, med in enumerate(request.medicines)])}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <div class="signature">
            <p class="doctor-name">Dr. {request.doctor_name}</p>
            {f'<p>Registration No: {request.doctor_registration}</p>' if request.doctor_registration else ''}
            <p style="color: #4B95AF; margin-top: 5px;">Ayurvedic Practitioner</p>
        </div>
    </div>

    <button class="print-button" onclick="window.print()">🖨️ Print Prescription</button>

    <script>
        // Auto-focus for printing
        window.onload = function() {{
            // Optional: Auto-print on load (uncomment if needed)
            // window.print();
        }}
    </script>
</body>
</html>
"""

        return {
            "success": True,
            "prescription_html": prescription_html,
            "prescription_id": prescription_id,
            "patient_id": patient["id"],
            "patient_name": patient["name"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prescription: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

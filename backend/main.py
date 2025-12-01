from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI
import os
from dotenv import load_dotenv

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

class GeneratePrescriptionRequest(BaseModel):
    patient_name: str
    patient_age: int
    patient_gender: str
    symptoms: List[str]
    health_conditions: List[str]
    medicines: List[PrescriptionItem]
    doctor_name: str
    doctor_registration: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AyurvedaGPT API is running"}

@app.post("/api/medicines/search")
async def search_medicines(request: MedicineRequest):
    """
    Search for Ayurvedic medicines based on symptoms and health conditions using AI
    """
    try:
        # Create prompt for OpenAI
        prompt = f"""You are an expert Ayurvedic doctor. Based on the following patient information, suggest appropriate Ayurvedic medicines.

Symptoms: {', '.join(request.symptoms)}
Health Conditions: {', '.join(request.health_conditions)}

First, analyze and interpret the symptoms and health conditions provided (they may be in Hindi, Telugu, Tamil, or other Indian languages). Then provide a list of 5-8 BRANDED Ayurvedic medicines (commercial formulations) that would be appropriate.

IMPORTANT GUIDELINES:
- Suggest actual BRANDED medicines available in the market (e.g., "Chyawanprash", "Triphala Churna", "Liv.52", "Brahmi Vati", etc.)
- Include both classical formulations (like Triphala, Dashamularishta) and modern branded products
- Each medicine should be a POLYHERBAL FORMULATION (combination of multiple herbs/drugs), not single herbs
- Include the main constituent herbs/drugs in the description
- Focus on medicines commonly prescribed by Ayurvedic practitioners

For each medicine, provide:
1. Brand/Product name (commercial name if available, otherwise classical formulation name)
2. Brief description including main herbs/constituents and what it treats
3. Recommended dosage (tablets, syrup, churna, etc.)
4. Best timing to take (e.g., "Before meals", "After meals", "Before bedtime")
5. Any important precautions

IMPORTANT: If you don't understand the symptoms or health conditions, do NOT provide generic medicines. The symptoms may be described in the patient's native language (such as Hindi, Telugu, Tamil, or other Indian languages) - try to interpret them accurately before suggesting medicines.

Format your response as a JSON array with the following structure:
[
  {{
    "name": "Brand/Medicine Name (Main constituents in brackets if needed)",
    "description": "What it treats, benefits, and key ingredients",
    "understood_condition": "Your interpretation of the patient's symptoms/condition in English - explain what you understood from the input, especially if it was in a regional language",
    "recommended_dosage": "Dosage information with form",
    "timing": "When to take",
    "precautions": "Important precautions if any"
  }}
]

IMPORTANT: Return ONLY the JSON array, no additional text."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # Use gpt-4 for better quality (but more expensive)
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
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']') + 1
        json_text = response_text[start_idx:end_idx]

        medicines = json.loads(json_text)

        return {
            "success": True,
            "medicines": medicines
        }

    except Exception as e:
        import traceback
        print(f"ERROR in search_medicines: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error searching medicines: {str(e)}")

@app.post("/api/prescription/generate")
async def generate_prescription(request: GeneratePrescriptionRequest):
    """
    Generate a formatted prescription document
    """
    try:
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
            "prescription_html": prescription_html
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prescription: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

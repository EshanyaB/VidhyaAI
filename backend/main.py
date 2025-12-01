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

IMPORTANT: Return ONLY the JSON object with diagnosis and EXACTLY 8 medicines, no additional text."""

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

        # Extract JSON from response (looking for object, not array)
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        json_text = response_text[start_idx:end_idx]

        result = json.loads(json_text)

        return {
            "success": True,
            "diagnosis": result.get("diagnosis", {}),
            "medicines": result.get("medicines", [])
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

# 🌿 AyurvedaGPT

An intelligent prescription assistant for Ayurvedic doctors to reduce human errors and streamline the prescription process.

## Overview

AyurvedaGPT leverages AI (Claude/OpenAI) to suggest appropriate Ayurvedic medicines based on patient symptoms and health conditions. The application provides a complete workflow from patient intake to printable prescription generation.

## Features

### For Doctors

- 📝 **Patient Information Management** - Capture patient details (name, age, gender)
- 🔍 **Smart Symptom Input** - Type-ahead symptom selection with multi-select
- 🏥 **Health Conditions** - Quick selection of common conditions (Diabetes, BP, PCOD, etc.)
- 🤖 **AI-Powered Medicine Suggestions** - Get relevant Ayurvedic medicine recommendations
- ✏️ **Custom Medicine Addition** - Add medicines based on your expertise
- 💊 **Dosage & Timing Management** - Customize dosage and timing for each medicine
- 📄 **Professional Prescription** - Generate formatted, printable prescriptions
- 📱 **Mobile-First Design** - Use on tablets or phones in your clinic

### Technical Features

- AI-powered medicine recommendations using Claude/OpenAI
- RESTful API backend with FastAPI
- Cross-platform mobile app with React Native
- Printable prescription format
- PDF export and sharing capabilities

## Architecture

```
AyurvedaGPT/
├── backend/          # FastAPI backend with AI integration
│   ├── main.py       # API endpoints
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/         # React Native mobile app
    ├── App.js        # Main app component
    ├── src/
    │   └── screens/
    │       ├── MedicineSearchScreen.js
    │       └── PrescriptionScreen.js
    └── package.json
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run server
python main.py
```

Backend will run on: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update API_URL in:
# - src/screens/MedicineSearchScreen.js
# - src/screens/PrescriptionScreen.js

# Run app
npm start
```

## API Endpoints

### POST `/api/medicines/search`
Search for Ayurvedic medicines based on symptoms and conditions.

**Request:**
```json
{
  "symptoms": ["headache", "fatigue"],
  "health_conditions": ["Diabetes", "Hypertension"]
}
```

**Response:**
```json
{
  "success": true,
  "medicines": [
    {
      "name": "Ashwagandha",
      "description": "Helps reduce stress and fatigue",
      "recommended_dosage": "500mg twice daily",
      "timing": "After meals",
      "precautions": "Avoid during pregnancy"
    }
  ]
}
```

### POST `/api/prescription/generate`
Generate a formatted prescription document.

**Request:**
```json
{
  "patient_name": "John Doe",
  "patient_age": 45,
  "patient_gender": "Male",
  "symptoms": ["headache", "fatigue"],
  "health_conditions": ["Diabetes"],
  "medicines": [
    {
      "medicine_name": "Ashwagandha",
      "dosage": "500mg twice daily",
      "timing": "After meals"
    }
  ],
  "doctor_name": "Dr. Smith",
  "doctor_registration": "AYU12345"
}
```

**Response:**
```json
{
  "success": true,
  "prescription_html": "<html>...</html>"
}
```

## Screenshots

### Home Screen
- Patient information input
- Symptoms selection
- Health conditions multi-select

### Medicine Search Screen
- AI-suggested medicines
- Selection and customization
- Custom medicine addition

### Prescription Screen
- Summary review
- Doctor information
- Printable prescription preview

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Anthropic Claude** - AI for medicine recommendations (can use OpenAI as alternative)
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - React Native tooling
- **React Native Paper** - Material Design components
- **Axios** - HTTP client
- **Expo Print** - PDF generation and printing

## Customization

### Using OpenAI Instead of Claude

Edit [backend/main.py](backend/main.py):

```python
import openai

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In search_medicines function:
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}]
)
medicines = json.loads(response.choices[0].message.content)
```

### Changing Color Scheme

All colors use the teal palette defined in the CLAUDE.md file. To change:
1. Update styles in [App.js](frontend/App.js)
2. Update styles in screen components
3. Update prescription HTML template in [backend/main.py](backend/main.py)

## Deployment

### Backend Deployment
- Deploy to services like Railway, Render, or AWS
- Set environment variable `ANTHROPIC_API_KEY`
- Update CORS origins for production

### Frontend Deployment
- Build APK/IPA for distribution
- Update API_URL to production backend
- Use Expo EAS Build for managed builds

## Security Notes

- ⚠️ Never commit `.env` file with API keys
- Use environment variables for all secrets
- Implement authentication for production use
- Add HTTPS in production
- Validate and sanitize all user inputs

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Patient history tracking
- [ ] Medicine inventory management
- [ ] Multi-language support
- [ ] Voice input for symptoms
- [ ] Integration with pharmacy systems
- [ ] Analytics dashboard for doctors
- [ ] Cloud storage for prescriptions

## Contributing

This is a personal project for Ayurvedic practitioners. Feel free to fork and customize for your needs.

## License

This project is for educational and professional use by licensed Ayurvedic practitioners.

## Support

For issues or questions:
1. Check the backend is running: `http://localhost:8000/docs`
2. Verify API_URL in frontend code
3. Check console logs for errors
4. Ensure AI API key is valid

## Acknowledgments

- Built with Claude AI assistance
- Designed for Ayurvedic medical practitioners
- Uses modern web and mobile technologies

---

**Note:** This application is a tool to assist medical professionals. It should not replace professional medical judgment. Always verify AI suggestions against established Ayurvedic principles and patient safety guidelines.

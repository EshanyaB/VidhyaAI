# AyurvedaGPT Backend

FastAPI backend with AI integration for Ayurvedic medicine recommendations.

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Mac/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example file
   copy .env.example .env

   # Edit .env and add your API key
   # Get your OpenAI API key from: https://platform.openai.com/api-keys
   ```

4. **Run the server:**
   ```bash
   python main.py
   ```

The API will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

- `POST /api/medicines/search` - Get AI-powered medicine recommendations
- `POST /api/prescription/generate` - Generate printable prescription

## AI Model Configuration

The backend is configured to use **OpenAI GPT-3.5-turbo** by default (fast and cheap).

### Upgrading to GPT-4 (Better Quality)

To use GPT-4 for better medicine recommendations, edit [main.py](main.py) line 92:

```python
# Change this:
model="gpt-3.5-turbo",

# To this:
model="gpt-4",  # Better quality but more expensive
```

**Pricing (approximate):**
- GPT-3.5-turbo: ~$0.002 per request
- GPT-4: ~$0.03 per request

Most doctors will find GPT-3.5-turbo sufficient for Ayurvedic medicine suggestions.

# AyurvedaGPT Frontend

React Native mobile application for Ayurvedic prescription management.

## Features

- ✅ Patient information input
- ✅ Multi-select symptoms input
- ✅ Health conditions selection
- ✅ AI-powered medicine suggestions
- ✅ Custom medicine addition
- ✅ Dosage and timing customization
- ✅ Printable prescription generation
- ✅ Share prescription as PDF

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional but recommended)

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL:**

   Edit the API_URL in the following files to match your backend:
   - [src/screens/MedicineSearchScreen.js](src/screens/MedicineSearchScreen.js) (line 10)
   - [src/screens/PrescriptionScreen.js](src/screens/PrescriptionScreen.js) (line 13)

   Replace `http://localhost:8000` with your backend URL.

   **For mobile testing:**
   - Use your computer's IP address instead of localhost
   - Example: `http://192.168.1.100:8000`

3. **Run the app:**

   **Using Expo (Recommended):**
   ```bash
   npm start
   ```
   Then scan the QR code with the Expo Go app (iOS/Android)

   **For Web:**
   ```bash
   npm run web
   ```

   **For Android:**
   ```bash
   npm run android
   ```

   **For iOS:**
   ```bash
   npm run ios
   ```

## Usage Flow

1. **Enter Patient Information**
   - Patient name, age, and gender
   - Add symptoms (type and press Add)
   - Select existing health conditions

2. **Search Medicines**
   - AI suggests medicines based on symptoms and conditions
   - Select relevant medicines from suggestions
   - Edit dosage and timing for each medicine
   - Add custom medicines if needed

3. **Generate Prescription**
   - Review all selected medicines
   - Enter doctor information
   - Generate prescription
   - Print or share the prescription

## Color Scheme

The app uses a teal-based color palette as specified:
- Primary: `#297691` (Deep teal)
- Secondary: `#4B95AF` (Medium teal)
- Accent: `#6DB4CD` (Soft teal)
- Dark: `#19647F` (Dark-medium teal)
- Darker: `#053445` (Deeper teal)

## Troubleshooting

### Backend Connection Issues

If you can't connect to the backend:
1. Make sure the backend server is running
2. Check the API_URL in the screen files
3. On mobile, use your computer's IP address instead of localhost
4. Ensure both devices are on the same network

### Finding Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address"

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address

## Building for Production

### Android APK:
```bash
expo build:android
```

### iOS:
```bash
expo build:ios
```

For standalone apps without Expo, use:
```bash
expo eject
```
Then follow React Native build instructions.

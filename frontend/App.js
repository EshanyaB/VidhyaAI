import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import PrescriptionScreen from './src/screens/PrescriptionScreen';
import MedicineSearchScreen from './src/screens/MedicineSearchScreen';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
  });
  const [symptoms, setSymptoms] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const resetApp = () => {
    setCurrentScreen('home');
    setPatientInfo({ name: '', age: '', gender: '' });
    setSymptoms([]);
    setHealthConditions([]);
    setSelectedMedicines([]);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#053445" />

        {currentScreen === 'home' && (
          <HomeScreen
            patientInfo={patientInfo}
            setPatientInfo={setPatientInfo}
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            healthConditions={healthConditions}
            setHealthConditions={setHealthConditions}
            onNext={() => setCurrentScreen('medicine-search')}
          />
        )}

        {currentScreen === 'medicine-search' && (
          <MedicineSearchScreen
            symptoms={symptoms}
            healthConditions={healthConditions}
            selectedMedicines={selectedMedicines}
            setSelectedMedicines={setSelectedMedicines}
            onBack={() => setCurrentScreen('home')}
            onNext={() => setCurrentScreen('prescription')}
          />
        )}

        {currentScreen === 'prescription' && (
          <PrescriptionScreen
            patientInfo={patientInfo}
            symptoms={symptoms}
            healthConditions={healthConditions}
            selectedMedicines={selectedMedicines}
            onBack={() => setCurrentScreen('medicine-search')}
            onReset={resetApp}
          />
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

// Home Screen Component
function HomeScreen({
  patientInfo,
  setPatientInfo,
  symptoms,
  setSymptoms,
  healthConditions,
  setHealthConditions,
  onNext,
}) {
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');

  const commonConditions = [
    'Diabetes',
    'Hypertension (High BP)',
    'Hypotension (Low BP)',
    'PCOD/PCOS',
    'Thyroid',
    'Asthma',
    'Arthritis',
    'Gastric Issues',
    'Migraine',
    'Insomnia',
  ];

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const toggleCondition = (condition) => {
    if (healthConditions.includes(condition)) {
      setHealthConditions(healthConditions.filter((c) => c !== condition));
    } else {
      setHealthConditions([...healthConditions, condition]);
    }
  };

  const canProceed = () => {
    return (
      patientInfo.name.trim() &&
      patientInfo.age &&
      patientInfo.gender &&
      symptoms.length > 0
    );
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 VaidyaAI</Text>
        <Text style={styles.headerSubtitle}>Smart Prescription Assistant</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Patient Name *"
          placeholderTextColor="#6DB4CD"
          value={patientInfo.name}
          onChangeText={(text) =>
            setPatientInfo({ ...patientInfo, name: text })
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Age *"
          placeholderTextColor="#6DB4CD"
          keyboardType="numeric"
          value={patientInfo.age}
          onChangeText={(text) =>
            setPatientInfo({ ...patientInfo, age: text })
          }
        />

        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                patientInfo.gender === gender && styles.genderButtonActive,
              ]}
              onPress={() => setPatientInfo({ ...patientInfo, gender })}
            >
              <Text
                style={[
                  styles.genderText,
                  patientInfo.gender === gender && styles.genderTextActive,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptoms *</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="Type symptom and press Add"
            placeholderTextColor="#6DB4CD"
            value={currentSymptom}
            onChangeText={setCurrentSymptom}
            onSubmitEditing={addSymptom}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSymptom}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsContainer}>
          {symptoms.map((symptom, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{symptom}</Text>
              <TouchableOpacity onPress={() => removeSymptom(index)}>
                <Text style={styles.chipRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Conditions (Optional)</Text>
        <Text style={styles.helperText}>
          Select any existing conditions:
        </Text>
        <View style={styles.conditionsGrid}>
          {commonConditions.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.conditionChip,
                healthConditions.includes(condition) &&
                  styles.conditionChipActive,
              ]}
              onPress={() => toggleCondition(condition)}
            >
              <Text
                style={[
                  styles.conditionText,
                  healthConditions.includes(condition) &&
                    styles.conditionTextActive,
                ]}
              >
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.proceedButton, !canProceed() && styles.buttonDisabled]}
        onPress={onNext}
        disabled={!canProceed()}
      >
        <Text style={styles.proceedButtonText}>
          🔍 Search for Ayurvedic Medicines
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screen: {
    flex: 1,
  },
  header: {
    backgroundColor: '#053445',
    padding: 24,
    paddingTop: 35,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6DB4CD',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.95,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    color: '#053445',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  genderButtonActive: {
    backgroundColor: '#19647F',
    borderColor: '#19647F',
  },
  genderText: {
    color: '#19647F',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  genderTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#19647F',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#19647F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#297691',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  chipText: {
    color: 'white',
    marginRight: 8,
    fontSize: 14,
  },
  chipRemove: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 13,
    color: '#4B95AF',
    marginBottom: 10,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  conditionChip: {
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 5,
  },
  conditionChipActive: {
    backgroundColor: '#19647F',
    borderColor: '#19647F',
    shadowColor: '#19647F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  conditionText: {
    color: '#19647F',
    fontSize: 13,
    fontWeight: '600',
  },
  conditionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  proceedButton: {
    backgroundColor: '#053445',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#053445',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: '#4B95AF',
    opacity: 0.4,
  },
});

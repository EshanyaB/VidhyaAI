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

export default function App() {
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

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#297691" />

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
        <Text style={styles.headerTitle}>🌿 AyurvedaGPT</Text>
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

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
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
    backgroundColor: '#297691',
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6DB4CD',
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
    color: '#297691',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'white',
    color: '#053445',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  halfInput: {
    flex: 0.28,
    marginRight: 8,
  },
  genderContainer: {
    flex: 0.72,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#297691',
    borderColor: '#297691',
  },
  genderText: {
    color: '#4B95AF',
    fontSize: 13,
    textAlign: 'center',
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
    backgroundColor: '#4B95AF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
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
    backgroundColor: '#19647F',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 4,
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
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
  },
  conditionChipActive: {
    backgroundColor: '#297691',
    borderColor: '#297691',
  },
  conditionText: {
    color: '#4B95AF',
    fontSize: 13,
  },
  conditionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  proceedButton: {
    backgroundColor: '#297691',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#6DB4CD',
    opacity: 0.5,
  },
});

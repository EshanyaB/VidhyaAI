import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import storage from './src/utils/storage';
import PrescriptionScreen from './src/screens/PrescriptionScreen';
import MedicineSearchScreen from './src/screens/MedicineSearchScreen';
import SplashScreen from './src/components/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
  });
  const [symptoms, setSymptoms] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getItem('token');
      const userData = await storage.getItem('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setShowLogoutModal(false);
    resetApp();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const resetApp = () => {
    setCurrentScreen('home');
    setPatientInfo({ name: '', age: '', gender: '' });
    setSymptoms([]);
    setHealthConditions([]);
    setSelectedMedicines([]);
    setDiagnosis(null);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#19647F" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <PaperProvider>
        <AuthScreen onLogin={handleLogin} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#053445" />

        {currentScreen === 'home' && (
          <HomeScreen
            user={user}
            onLogout={handleLogout}
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
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            onBack={() => setCurrentScreen('home')}
            onNext={() => setCurrentScreen('prescription')}
          />
        )}

        {currentScreen === 'prescription' && (
          <PrescriptionScreen
            user={user}
            patientInfo={patientInfo}
            symptoms={symptoms}
            healthConditions={healthConditions}
            selectedMedicines={selectedMedicines}
            diagnosis={diagnosis}
            onBack={() => setCurrentScreen('medicine-search')}
            onReset={resetApp}
          />
        )}

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelLogout}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cancelLogout}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={confirmLogout}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </PaperProvider>
  );
}

// Home Screen Component
function HomeScreen({
  user,
  onLogout,
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🌿 VaidyaAI</Text>
            <Text style={styles.headerSubtitle}>Smart Prescription Assistant</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        {user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userWelcome}>Welcome, Dr. {user.name}!</Text>
            {user.registration_number && (
              <Text style={styles.userReg}>Reg: {user.registration_number}</Text>
            )}
          </View>
        )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
  },
  header: {
    backgroundColor: '#053445',
    padding: 24,
    paddingTop: 35,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  userInfoContainer: {
    width: '100%',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  userWelcome: {
    fontSize: 16,
    color: '#6DB4CD',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userReg: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
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
  // Logout Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#4B95AF',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E8F4F8',
    borderWidth: 2,
    borderColor: '#4B95AF',
  },
  cancelButtonText: {
    color: '#19647F',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#053445',
    shadowColor: '#053445',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

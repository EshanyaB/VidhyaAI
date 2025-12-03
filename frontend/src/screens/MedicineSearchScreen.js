import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import axios from 'axios';
import Toast from '../components/Toast';

const API_URL = 'http://localhost:8000'; // Backend URL

export default function MedicineSearchScreen({
  symptoms,
  healthConditions,
  selectedMedicines,
  setSelectedMedicines,
  diagnosis,
  setDiagnosis,
  onBack,
  onNext,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [customMedicine, setCustomMedicine] = useState({
    name: '',
    dosage: '',
    timing: '',
  });

  // Animation for pestle
  const pestleAnim = useRef(new Animated.Value(-20)).current;

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  useEffect(() => {
    searchMedicines();
  }, []);

  useEffect(() => {
    if (loading) {
      // Start mortar and pestle grinding animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pestleAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pestleAnim, {
            toValue: -20,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const searchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/medicines/search`, {
        symptoms,
        health_conditions: healthConditions,
      });

      if (response.data.success) {
        setDiagnosis(response.data.diagnosis);
        setSuggestedMedicines(response.data.medicines);
      }
    } catch (error) {
      showToast('Failed to fetch medicine suggestions. Please check if the backend is running.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMedicine = (medicine) => {
    const isSelected = selectedMedicines.some((m) => m.name === medicine.name);

    if (isSelected) {
      setSelectedMedicines(
        selectedMedicines.filter((m) => m.name !== medicine.name)
      );
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        {
          name: medicine.name,
          description: medicine.description,
          dosage: medicine.recommended_dosage,
          timing: medicine.timing,
          precautions: medicine.precautions,
        },
      ]);
    }
  };

  const isMedicineSelected = (medicine) => {
    return selectedMedicines.some((m) => m.name === medicine.name);
  };

  const updateMedicineDetails = (medicineName, field, value) => {
    setSelectedMedicines(
      selectedMedicines.map((med) =>
        med.name === medicineName ? { ...med, [field]: value } : med
      )
    );
  };

  const addCustomMedicine = () => {
    if (
      customMedicine.name.trim() &&
      customMedicine.dosage.trim() &&
      customMedicine.timing.trim()
    ) {
      setSelectedMedicines([
        ...selectedMedicines,
        {
          name: customMedicine.name.trim(),
          description: 'Custom medicine added by doctor',
          dosage: customMedicine.dosage.trim(),
          timing: customMedicine.timing.trim(),
          precautions: '',
        },
      ]);
      setCustomMedicine({ name: '', dosage: '', timing: '' });
      setShowCustomForm(false);
    } else {
      showToast('Please fill all fields for custom medicine', 'error');
    }
  };

  const canProceed = () => {
    return selectedMedicines.length > 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Mortar and Pestle Animation */}
        <View style={styles.medicinePreparation}>
          <Text style={styles.mortarIcon}>🥣</Text>
          <Animated.Text
            style={[
              styles.pestleIcon,
              { transform: [{ translateY: pestleAnim }] },
            ]}
          >
            🥄
          </Animated.Text>
        </View>

        <Text style={styles.loadingText}>
          Preparing Ayurvedic Medicines...
        </Text>
        <Text style={styles.loadingSubtext}>
           VidyaAI is analyzing your symptoms and health conditions
        </Text>
        <Text style={styles.loadingSubtext2}>
          Please wait while we find the best remedies
        </Text>

        {/* Rotating leaf in background */}
        <Text style={styles.leafBackground}>🌿</Text>
      </View>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Medicines</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Symptoms:</Text>
        <Text style={styles.infoText}>{symptoms.join(', ')}</Text>
        {healthConditions.length > 0 && (
          <>
            <Text style={[styles.infoTitle, { marginTop: 10 }]}>
              Conditions:
            </Text>
            <Text style={styles.infoText}>{healthConditions.join(', ')}</Text>
          </>
        )}
      </View>

      {diagnosis && (
        <View style={styles.diagnosisBox}>
          <Text style={styles.diagnosisTitle}>🩺 AI Diagnosis</Text>
          <View style={styles.diagnosisContent}>
            <Text style={styles.diagnosisLabel}>Primary Condition:</Text>
            <Text style={styles.diagnosisPrimary}>{diagnosis.primary_condition}</Text>

            {diagnosis.secondary_conditions && diagnosis.secondary_conditions.length > 0 && (
              <>
                <Text style={[styles.diagnosisLabel, { marginTop: 12 }]}>
                  Other Possibilities:
                </Text>
                <Text style={styles.diagnosisSecondary}>
                  {diagnosis.secondary_conditions.join(', ')}
                </Text>
              </>
            )}

            {diagnosis.ayurvedic_analysis && (
              <>
                <Text style={[styles.diagnosisLabel, { marginTop: 12 }]}>
                  Ayurvedic Analysis:
                </Text>
                <Text style={styles.diagnosisAnalysis}>
                  {diagnosis.ayurvedic_analysis}
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          AI-Suggested Medicines ({suggestedMedicines.length})
        </Text>
        <Text style={styles.helperText}>
          Tap to select/deselect medicines. You can edit dosage and timing for
          selected medicines.
        </Text>

        {suggestedMedicines.map((medicine, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.medicineCard,
              isMedicineSelected(medicine) && styles.medicineCardSelected,
            ]}
            onPress={() => toggleMedicine(medicine)}
          >
            <View style={styles.medicineHeader}>
              <View style={styles.checkbox}>
                {isMedicineSelected(medicine) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.medicineHeaderContent}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                {medicine.source === 'historical' && (
                  <View style={styles.historicalBadge}>
                    <Text style={styles.badgeText}>📋 From History</Text>
                  </View>
                )}
                {medicine.source === 'ai' && (
                  <View style={styles.aiBadge}>
                    <Text style={styles.badgeText}>🤖 AI</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.medicineDescription}>
              {medicine.description}
            </Text>

            {isMedicineSelected(medicine) && (
              <View style={styles.detailsForm}>
                <Text style={styles.detailLabel}>Dosage:</Text>
                <TextInput
                  style={styles.detailInput}
                  value={
                    selectedMedicines.find((m) => m.name === medicine.name)
                      ?.dosage || medicine.recommended_dosage
                  }
                  onChangeText={(text) =>
                    updateMedicineDetails(medicine.name, 'dosage', text)
                  }
                  placeholder="Enter dosage"
                  placeholderTextColor="#6DB4CD"
                />

                <Text style={styles.detailLabel}>Timing:</Text>
                <TextInput
                  style={styles.detailInput}
                  value={
                    selectedMedicines.find((m) => m.name === medicine.name)
                      ?.timing || medicine.timing
                  }
                  onChangeText={(text) =>
                    updateMedicineDetails(medicine.name, 'timing', text)
                  }
                  placeholder="When to take"
                  placeholderTextColor="#6DB4CD"
                />
              </View>
            )}

            {!isMedicineSelected(medicine) && (
              <View style={styles.defaultInfo}>
                <Text style={styles.defaultText}>
                  📋 Dosage: {medicine.recommended_dosage}
                </Text>
                <Text style={styles.defaultText}>⏰ {medicine.timing}</Text>
                {medicine.precautions && (
                  <Text style={styles.precautionText}>
                    ⚠️ {medicine.precautions}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Custom Medicine</Text>
        <Text style={styles.helperText}>
          Add medicines based on your knowledge and experience
        </Text>

        {!showCustomForm ? (
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setShowCustomForm(true)}
          >
            <Text style={styles.customButtonText}>
              + Add Custom Medicine
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.customForm}>
            <TextInput
              style={styles.input}
              placeholder="Medicine Name *"
              placeholderTextColor="#6DB4CD"
              value={customMedicine.name}
              onChangeText={(text) =>
                setCustomMedicine({ ...customMedicine, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g., 2 tablets twice daily) *"
              placeholderTextColor="#6DB4CD"
              value={customMedicine.dosage}
              onChangeText={(text) =>
                setCustomMedicine({ ...customMedicine, dosage: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Timing (e.g., After meals) *"
              placeholderTextColor="#6DB4CD"
              value={customMedicine.timing}
              onChangeText={(text) =>
                setCustomMedicine({ ...customMedicine, timing: text })
              }
            />

            <View style={styles.customFormButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCustomForm(false);
                  setCustomMedicine({ name: '', dosage: '', timing: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={addCustomMedicine}
              >
                <Text style={styles.addCustomButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {selectedMedicines.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>
            Selected Medicines ({selectedMedicines.length})
          </Text>
          {selectedMedicines.map((med, index) => (
            <View key={index} style={styles.selectedCard}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedName}>{med.name}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMedicines(
                      selectedMedicines.filter((m) => m.name !== med.name)
                    )
                  }
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedDetail}>📋 {med.dosage}</Text>
              <Text style={styles.selectedDetail}>⏰ {med.timing}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.proceedButton, !canProceed() && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!canProceed()}
        >
          <Text style={styles.proceedButtonText}>
            Generate Prescription ({selectedMedicines.length} medicines)
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  medicinePreparation: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  mortarIcon: {
    fontSize: 80,
    position: 'absolute',
    bottom: 0,
  },
  pestleIcon: {
    fontSize: 60,
    position: 'absolute',
    top: 0,
    right: 15,
    transform: [{ rotate: '45deg' }],
  },
  leafBackground: {
    fontSize: 100,
    position: 'absolute',
    opacity: 0.08,
    bottom: 50,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    color: '#053445',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 15,
    fontSize: 15,
    color: '#19647F',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  loadingSubtext2: {
    marginTop: 8,
    fontSize: 13,
    color: '#4B95AF',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 30,
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
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6DB4CD',
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: '#19647F',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoTitle: {
    color: '#6DB4CD',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
  },
  diagnosisBox: {
    backgroundColor: '#E8F4F8',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#297691',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 15,
  },
  diagnosisContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  diagnosisLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B95AF',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  diagnosisPrimary: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 5,
  },
  diagnosisSecondary: {
    fontSize: 14,
    color: '#19647F',
    fontStyle: 'italic',
  },
  diagnosisAnalysis: {
    fontSize: 14,
    color: '#053445',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
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
    marginBottom: 10,
  },
  helperText: {
    fontSize: 13,
    color: '#4B95AF',
    marginBottom: 15,
  },
  medicineCard: {
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  medicineCardSelected: {
    borderColor: '#19647F',
    borderWidth: 3,
    backgroundColor: '#E8F4F8',
    shadowColor: '#19647F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#19647F',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkmark: {
    color: '#19647F',
    fontSize: 18,
    fontWeight: 'bold',
  },
  medicineHeaderContent: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 4,
  },
  historicalBadge: {
    backgroundColor: '#E8F4F8',
    borderWidth: 1,
    borderColor: '#19647F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  aiBadge: {
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#053445',
  },
  medicineDescription: {
    fontSize: 14,
    color: '#4B95AF',
    marginBottom: 10,
    lineHeight: 20,
  },
  defaultInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#6DB4CD',
  },
  defaultText: {
    fontSize: 13,
    color: '#19647F',
    marginBottom: 5,
  },
  precautionText: {
    fontSize: 13,
    color: '#d9534f',
    marginTop: 5,
    fontStyle: 'italic',
  },
  detailsForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#19647F',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 5,
    marginTop: 10,
  },
  detailInput: {
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#053445',
    backgroundColor: '#FAFAFA',
  },
  customButton: {
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  customButtonText: {
    color: '#4B95AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customForm: {
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    color: '#053445',
  },
  customFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 10,
    padding: 14,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B95AF',
    fontWeight: 'bold',
  },
  addCustomButton: {
    flex: 1,
    backgroundColor: '#19647F',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#19647F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addCustomButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedSection: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 15,
  },
  selectedCard: {
    backgroundColor: '#E8F4F8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#19647F',
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#053445',
    flex: 1,
  },
  removeText: {
    color: '#d9534f',
    fontSize: 13,
    fontWeight: 'bold',
  },
  selectedDetail: {
    fontSize: 13,
    color: '#19647F',
    marginBottom: 4,
  },
  buttonContainer: {
    padding: 15,
  },
  proceedButton: {
    backgroundColor: '#053445',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
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

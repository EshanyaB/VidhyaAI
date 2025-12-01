import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.2:8000'; // Backend URL (use IP for mobile devices)

export default function MedicineSearchScreen({
  symptoms,
  healthConditions,
  selectedMedicines,
  setSelectedMedicines,
  onBack,
  onNext,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customMedicine, setCustomMedicine] = useState({
    name: '',
    dosage: '',
    timing: '',
  });

  useEffect(() => {
    searchMedicines();
  }, []);

  const searchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/medicines/search`, {
        symptoms,
        health_conditions: healthConditions,
      });

      if (response.data.success) {
        setSuggestedMedicines(response.data.medicines);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to fetch medicine suggestions. Please check if the backend is running.'
      );
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
      Alert.alert('Error', 'Please fill all fields for custom medicine');
    }
  };

  const canProceed = () => {
    return selectedMedicines.length > 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#297691" />
        <Text style={styles.loadingText}>
          Searching for Ayurvedic medicines...
        </Text>
        <Text style={styles.loadingSubtext}>
          AI is analyzing symptoms and conditions
        </Text>
      </View>
    );
  }

  return (
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
              <Text style={styles.medicineName}>{medicine.name}</Text>
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
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#297691',
    fontWeight: 'bold',
  },
  loadingSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#4B95AF',
  },
  header: {
    backgroundColor: '#297691',
    padding: 20,
    paddingTop: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  infoBox: {
    backgroundColor: '#19647F',
    margin: 15,
    padding: 15,
    borderRadius: 12,
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
    color: '#297691',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 13,
    color: '#4B95AF',
    marginBottom: 15,
  },
  medicineCard: {
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  medicineCardSelected: {
    borderColor: '#297691',
    borderWidth: 2,
    backgroundColor: '#f0f8fa',
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#297691',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkmark: {
    color: '#297691',
    fontSize: 18,
    fontWeight: 'bold',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#053445',
    flex: 1,
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
    borderTopWidth: 1,
    borderTopColor: '#297691',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#297691',
    marginBottom: 5,
    marginTop: 10,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#053445',
    backgroundColor: 'white',
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
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: 'white',
    color: '#053445',
  },
  customFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6DB4CD',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B95AF',
    fontWeight: 'bold',
  },
  addCustomButton: {
    flex: 1,
    backgroundColor: '#4B95AF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
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
    color: '#297691',
    marginBottom: 15,
  },
  selectedCard: {
    backgroundColor: '#f0f8fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
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
    backgroundColor: '#297691',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
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

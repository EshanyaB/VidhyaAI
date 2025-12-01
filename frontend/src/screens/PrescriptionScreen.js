import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const API_URL = 'http://192.168.1.2:8000'; // Backend URL (use IP for mobile devices)

export default function PrescriptionScreen({
  patientInfo,
  symptoms,
  healthConditions,
  selectedMedicines,
  onBack,
  onReset,
}) {
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    registration: '',
  });
  const [loading, setLoading] = useState(false);
  const [prescriptionHtml, setPrescriptionHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const generatePrescription = async () => {
    if (!doctorInfo.name.trim()) {
      Alert.alert('Error', 'Please enter doctor name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/prescription/generate`,
        {
          patient_name: patientInfo.name,
          patient_age: parseInt(patientInfo.age),
          patient_gender: patientInfo.gender,
          symptoms: symptoms,
          health_conditions: healthConditions,
          medicines: selectedMedicines.map((med) => ({
            medicine_name: med.name,
            dosage: med.dosage,
            timing: med.timing,
            duration: med.duration || '',
          })),
          doctor_name: doctorInfo.name,
          doctor_registration: doctorInfo.registration || null,
        }
      );

      if (response.data.success) {
        setPrescriptionHtml(response.data.prescription_html);
        setShowPreview(true);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to generate prescription. Please check if the backend is running.'
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const printPrescription = async () => {
    try {
      await Print.printAsync({
        html: prescriptionHtml,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to print prescription');
      console.error(error);
    }
  };

  const sharePrescription = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: prescriptionHtml,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share prescription');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#297691" />
        <Text style={styles.loadingText}>Generating Prescription...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Prescription</Text>
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Prescription Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Patient:</Text>
          <Text style={styles.summaryValue}>
            {patientInfo.name}, {patientInfo.age} years, {patientInfo.gender}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Symptoms:</Text>
          <Text style={styles.summaryValue}>{symptoms.join(', ')}</Text>
        </View>

        {healthConditions.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Conditions:</Text>
            <Text style={styles.summaryValue}>
              {healthConditions.join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Medicines:</Text>
          <Text style={styles.summaryValue}>
            {selectedMedicines.length} prescribed
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
        {selectedMedicines.map((med, index) => (
          <View key={index} style={styles.medicineItem}>
            <View style={styles.medicineNumber}>
              <Text style={styles.medicineNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.medicineDetails}>
              <Text style={styles.medicineName}>{med.name}</Text>
              <Text style={styles.medicineInfo}>📋 {med.dosage}</Text>
              <Text style={styles.medicineInfo}>⏰ {med.timing}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Doctor Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Doctor Name *"
          placeholderTextColor="#6DB4CD"
          value={doctorInfo.name}
          onChangeText={(text) => setDoctorInfo({ ...doctorInfo, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Registration Number (Optional)"
          placeholderTextColor="#6DB4CD"
          value={doctorInfo.registration}
          onChangeText={(text) =>
            setDoctorInfo({ ...doctorInfo, registration: text })
          }
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generatePrescription}
        >
          <Text style={styles.generateButtonText}>
            📄 Generate Prescription
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prescription Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Prescription Preview</Text>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewContainer}>
            <Text style={styles.previewNote}>
              Preview of the prescription. Use the buttons below to print or
              share.
            </Text>

            {/* Prescription Details */}
            <View style={styles.prescriptionPreview}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewHeaderTitle}>
                  🌿 AYURVEDIC PRESCRIPTION 🌿
                </Text>
                <Text style={styles.previewHeaderSubtitle}>
                  Traditional Medicine for Modern Wellness
                </Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>
                  PATIENT INFORMATION
                </Text>
                <Text style={styles.previewText}>
                  Name: {patientInfo.name}
                </Text>
                <Text style={styles.previewText}>
                  Age: {patientInfo.age} years
                </Text>
                <Text style={styles.previewText}>
                  Gender: {patientInfo.gender}
                </Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>SYMPTOMS</Text>
                {symptoms.map((symptom, index) => (
                  <Text key={index} style={styles.previewListItem}>
                    • {symptom}
                  </Text>
                ))}
              </View>

              {healthConditions.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>
                    HEALTH CONDITIONS
                  </Text>
                  {healthConditions.map((condition, index) => (
                    <Text key={index} style={styles.previewListItem}>
                      • {condition}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>
                  PRESCRIBED MEDICINES
                </Text>
                {selectedMedicines.map((med, index) => (
                  <View key={index} style={styles.previewMedicine}>
                    <Text style={styles.previewMedicineName}>
                      {index + 1}. {med.name}
                    </Text>
                    <Text style={styles.previewMedicineDetail}>
                      Dosage: {med.dosage}
                    </Text>
                    <Text style={styles.previewMedicineDetail}>
                      Timing: {med.timing}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.previewFooter}>
                <Text style={styles.previewDoctorName}>
                  Dr. {doctorInfo.name}
                </Text>
                {doctorInfo.registration && (
                  <Text style={styles.previewRegNo}>
                    Registration No: {doctorInfo.registration}
                  </Text>
                )}
                <Text style={styles.previewRole}>Ayurvedic Practitioner</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={printPrescription}
            >
              <Text style={styles.actionButtonText}>🖨️ Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={sharePrescription}
            >
              <Text style={styles.actionButtonText}>📤 Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.newButton]}
              onPress={() => {
                setShowPreview(false);
                onReset();
              }}
            >
              <Text style={styles.actionButtonText}>🆕 New Prescription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  summarySection: {
    backgroundColor: '#19647F',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  summaryRow: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6DB4CD',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 14,
    color: 'white',
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
    marginBottom: 15,
  },
  medicineItem: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0f8fa',
    borderRadius: 8,
  },
  medicineNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#297691',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicineNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  medicineDetails: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 5,
  },
  medicineInfo: {
    fontSize: 13,
    color: '#19647F',
    marginBottom: 3,
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
  buttonContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  generateButton: {
    backgroundColor: '#297691',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#297691',
    padding: 20,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
  },
  previewNote: {
    backgroundColor: '#f0f8fa',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    fontSize: 13,
    color: '#19647F',
    textAlign: 'center',
  },
  prescriptionPreview: {
    margin: 15,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6DB4CD',
  },
  previewHeader: {
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#297691',
    paddingBottom: 15,
    marginBottom: 20,
  },
  previewHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#297691',
    marginBottom: 5,
  },
  previewHeaderSubtitle: {
    fontSize: 12,
    color: '#4B95AF',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewSectionTitle: {
    backgroundColor: '#297691',
    color: 'white',
    padding: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  previewText: {
    fontSize: 14,
    color: '#053445',
    marginBottom: 5,
    paddingLeft: 10,
  },
  previewListItem: {
    fontSize: 14,
    color: '#053445',
    marginBottom: 5,
    paddingLeft: 10,
  },
  previewMedicine: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  previewMedicineName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#053445',
    marginBottom: 5,
  },
  previewMedicineDetail: {
    fontSize: 13,
    color: '#19647F',
    marginBottom: 3,
  },
  previewFooter: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#6DB4CD',
    alignItems: 'flex-end',
  },
  previewDoctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#297691',
    marginBottom: 5,
  },
  previewRegNo: {
    fontSize: 13,
    color: '#19647F',
    marginBottom: 5,
  },
  previewRole: {
    fontSize: 12,
    color: '#4B95AF',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#6DB4CD',
    backgroundColor: 'white',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#297691',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: '#4B95AF',
  },
  newButton: {
    backgroundColor: '#19647F',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

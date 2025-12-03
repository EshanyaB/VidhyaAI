import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import axios from 'axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Toast from '../components/Toast';
import storage from '../utils/storage';

const API_URL = 'https://vidhyaai-backend.onrender.com'; // Production backend URL

export default function PrescriptionScreen({
  user,
  patientInfo,
  symptoms,
  healthConditions,
  selectedMedicines,
  diagnosis,
  onBack,
  onReset,
}) {
  const [loading, setLoading] = useState(false);
  const [prescriptionHtml, setPrescriptionHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const generatePrescription = async () => {
    setLoading(true);
    try {
      // Get authentication token
      const token = await storage.getItem('token');

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
          doctor_name: user.name,
          diagnosis: diagnosis || {
            primary_condition: "",
            secondary_conditions: [],
            ayurvedic_analysis: ""
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPrescriptionHtml(response.data.prescription_html);
        setShowPreview(true);
      }
    } catch (error) {
      showToast('Failed to generate prescription. Please check if the backend is running.', 'error');
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
      showToast('Failed to print prescription', 'error');
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
        showToast('Sharing not available on this device', 'warning');
      }
    } catch (error) {
      showToast('Failed to share prescription', 'error');
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
                  Dr. {user.name}
                </Text>
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
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#053445',
    fontWeight: 'bold',
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
  summarySection: {
    backgroundColor: '#19647F',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    color: '#053445',
    marginBottom: 15,
  },
  medicineItem: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 14,
    backgroundColor: '#E8F4F8',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#19647F',
  },
  medicineNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#19647F',
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
    borderWidth: 2,
    borderColor: '#4B95AF',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    color: '#053445',
  },
  buttonContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  generateButton: {
    backgroundColor: '#053445',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#053445',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#053445',
    padding: 24,
    paddingTop: 45,
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
    backgroundColor: '#E8F4F8',
    padding: 15,
    margin: 15,
    borderRadius: 10,
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
    borderBottomColor: '#19647F',
    paddingBottom: 15,
    marginBottom: 20,
  },
  previewHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#053445',
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
    backgroundColor: '#19647F',
    color: 'white',
    padding: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
    borderRadius: 5,
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
    color: '#053445',
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
    backgroundColor: '#19647F',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#19647F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  shareButton: {
    backgroundColor: '#2B718B',
  },
  newButton: {
    backgroundColor: '#053445',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

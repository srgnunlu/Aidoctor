import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMedicalHistory, createMedicalHistory, updateMedicalHistory, clearError } from '../../store/slices/medicalHistorySlice';
import colors from '../../constants/colors';

export default function AnamnesisTab({ patientId }) {
  const dispatch = useDispatch();
  const { history, loading, saveLoading, saveError } = useSelector((state) => state.medicalHistory);

  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [surgicalHistory, setSurgicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [socialHistory, setSocialHistory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (patientId) {
      dispatch(fetchMedicalHistory(patientId));
    }
  }, [dispatch, patientId]);

  useEffect(() => {
    if (history) {
      setAllergies(history.allergies || '');
      setChronicDiseases(history.chronicDiseases || '');
      setCurrentMedications(history.currentMedications ? JSON.stringify(history.currentMedications) : '');
      setSurgicalHistory(history.surgicalHistory || '');
      setFamilyHistory(history.familyHistory || '');
      setSocialHistory(history.socialHistory || '');
    }
  }, [history]);

  const handleSave = async () => {
    const hasAnyData = 
      allergies.trim() || 
      chronicDiseases.trim() || 
      currentMedications.trim() || 
      surgicalHistory.trim() || 
      familyHistory.trim() || 
      socialHistory.trim();

    if (!hasAnyData) {
      dispatch(clearError());
      setSuccessMessage('');
      return;
    }

    const data = {
      allergies: allergies.trim() || null,
      chronicDiseases: chronicDiseases.trim() || null,
      currentMedications: currentMedications.trim() || null,
      surgicalHistory: surgicalHistory.trim() || null,
      familyHistory: familyHistory.trim() || null,
      socialHistory: socialHistory.trim() || null,
    };

    let result;
    if (history) {
      result = await dispatch(updateMedicalHistory({ 
        patientId, 
        historyId: history.id, 
        data 
      }));
    } else {
      result = await dispatch(createMedicalHistory({ 
        patientId, 
        data 
      }));
    }

    if (result.type.endsWith('/fulfilled')) {
      setSuccessMessage('Anamnez başarıyla kaydedildi');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tıbbi Anamnez
            </Text>

            <TextInput
              label="Alerjiler"
              value={allergies}
              onChangeText={setAllergies}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="İlaç, besin alerjileri..."
              disabled={saveLoading}
            />

            <TextInput
              label="Kronik Hastalıklar"
              value={chronicDiseases}
              onChangeText={setChronicDiseases}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Diyabet, hipertansiyon, astım..."
              disabled={saveLoading}
            />

            <TextInput
              label="Kullandığı İlaçlar"
              value={currentMedications}
              onChangeText={setCurrentMedications}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Güncel ilaç listesi..."
              disabled={saveLoading}
            />

            <TextInput
              label="Ameliyat Geçmişi"
              value={surgicalHistory}
              onChangeText={setSurgicalHistory}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Geçirdiği ameliyatlar..."
              disabled={saveLoading}
            />

            <TextInput
              label="Aile Öyküsü"
              value={familyHistory}
              onChangeText={setFamilyHistory}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Ailede görülen hastalıklar..."
              disabled={saveLoading}
            />

            <TextInput
              label="Sosyal Öykü"
              value={socialHistory}
              onChangeText={setSocialHistory}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Sigara, alkol kullanımı..."
              disabled={saveLoading}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              loading={saveLoading}
              disabled={saveLoading}
              style={styles.button}
            >
              Kaydet
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!saveError || !!successMessage}
        onDismiss={() => {
          dispatch(clearError());
          setSuccessMessage('');
        }}
        duration={3000}
        action={{
          label: 'Tamam',
          onPress: () => {
            dispatch(clearError());
            setSuccessMessage('');
          },
        }}
        style={successMessage ? styles.successSnackbar : null}
      >
        {saveError || successMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 12,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

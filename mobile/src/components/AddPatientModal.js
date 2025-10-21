import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, SegmentedButtons, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createPatient, clearError } from '../store/slices/patientSlice';
import colors from '../constants/colors';

export default function AddPatientModal({ visible, onDismiss }) {
  const dispatch = useDispatch();
  const { createLoading, createError } = useSelector((state) => state.patient);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('MALE');
  const [complaint, setComplaint] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('MALE');
    setComplaint('');
    setPriority('MEDIUM');
    setValidationError('');
    dispatch(clearError());
  };

  const handleClose = () => {
    resetForm();
    onDismiss();
  };

  const validateForm = () => {
    if (!name.trim()) {
      setValidationError('Hasta adı gerekli');
      return false;
    }

    if (!age) {
      setValidationError('Yaş gerekli');
      return false;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setValidationError('Geçerli bir yaş girin (0-150)');
      return false;
    }

    if (!complaint.trim()) {
      setValidationError('Şikayet gerekli');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await dispatch(
      createPatient({
        name: name.trim(),
        age: parseInt(age, 10),
        gender,
        complaint: complaint.trim(),
        priority,
      })
    );

    if (result.type === 'patient/createPatient/fulfilled') {
      handleClose();
    }
  };

  const displayError = createError || validationError;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text variant="headlineSmall" style={styles.title}>
              Yeni Hasta Ekle
            </Text>

            <TextInput
              label="Hasta Adı *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              disabled={createLoading}
            />

            <TextInput
              label="Yaş *"
              value={age}
              onChangeText={setAge}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              disabled={createLoading}
            />

            <Text variant="bodyMedium" style={styles.label}>
              Cinsiyet *
            </Text>
            <SegmentedButtons
              value={gender}
              onValueChange={setGender}
              buttons={[
                { value: 'MALE', label: 'Erkek' },
                { value: 'FEMALE', label: 'Kadın' },
                { value: 'OTHER', label: 'Diğer' },
              ]}
              style={styles.segmented}
              disabled={createLoading}
            />

            <TextInput
              label="Şikayet *"
              value={complaint}
              onChangeText={setComplaint}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={createLoading}
            />

            <Text variant="bodyMedium" style={styles.label}>
              Öncelik
            </Text>
            <SegmentedButtons
              value={priority}
              onValueChange={setPriority}
              buttons={[
                {
                  value: 'LOW',
                  label: 'Düşük',
                  style: priority === 'LOW' ? { backgroundColor: colors.priority.LOW + '20' } : {},
                },
                {
                  value: 'MEDIUM',
                  label: 'Orta',
                  style: priority === 'MEDIUM' ? { backgroundColor: colors.priority.MEDIUM + '20' } : {},
                },
                {
                  value: 'HIGH',
                  label: 'Yüksek',
                  style: priority === 'HIGH' ? { backgroundColor: colors.priority.HIGH + '20' } : {},
                },
                {
                  value: 'CRITICAL',
                  label: 'Kritik',
                  style: priority === 'CRITICAL' ? { backgroundColor: colors.priority.CRITICAL + '20' } : {},
                },
              ]}
              style={styles.segmented}
              disabled={createLoading}
            />

            <View style={styles.buttons}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={styles.button}
                disabled={createLoading}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={createLoading}
                disabled={createLoading}
                style={styles.button}
              >
                Ekle
              </Button>
            </View>
          </ScrollView>

          <Snackbar
            visible={!!displayError}
            onDismiss={() => {
              setValidationError('');
              dispatch(clearError());
            }}
            duration={3000}
            action={{
              label: 'Tamam',
              onPress: () => {
                setValidationError('');
                dispatch(clearError());
              },
            }}
          >
            {displayError}
          </Snackbar>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  container: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    color: colors.darkGray,
    marginBottom: 8,
    marginTop: 4,
  },
  segmented: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

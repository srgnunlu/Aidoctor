import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, TextInput, Button } from 'react-native-paper';
import colors from '../constants/colors';

export default function AddVitalSignModal({ visible, onDismiss, onSave, loading }) {
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');

  const handleSave = () => {
    const data = {};
    
    if (heartRate) data.heartRate = parseInt(heartRate);
    if (systolic) data.bloodPressureSystolic = parseInt(systolic);
    if (diastolic) data.bloodPressureDiastolic = parseInt(diastolic);
    if (temperature) data.temperature = parseFloat(temperature);
    if (oxygenSaturation) data.oxygenSaturation = parseInt(oxygenSaturation);
    if (respiratoryRate) data.respiratoryRate = parseInt(respiratoryRate);

    if (Object.keys(data).length > 0) {
      onSave(data);
    }
  };

  const resetForm = () => {
    setHeartRate('');
    setSystolic('');
    setDiastolic('');
    setTemperature('');
    setOxygenSaturation('');
    setRespiratoryRate('');
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={() => {
          resetForm();
          onDismiss();
        }} 
        contentContainerStyle={styles.modal}
      >
        <Text variant="titleLarge" style={styles.title}>
          Vital Bulgular Ekle
        </Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Nabız (bpm)"
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
              style={styles.halfInput}
            />
            <TextInput
              mode="outlined"
              label="Ateş (°C)"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="decimal-pad"
              style={styles.halfInput}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Tansiyon (Sistolik)"
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="numeric"
              style={styles.halfInput}
            />
            <TextInput
              mode="outlined"
              label="Tansiyon (Diyastolik)"
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="SpO2 (%)"
              value={oxygenSaturation}
              onChangeText={setOxygenSaturation}
              keyboardType="numeric"
              style={styles.halfInput}
            />
            <TextInput
              mode="outlined"
              label="Solunum (/dk)"
              value={respiratoryRate}
              onChangeText={setRespiratoryRate}
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={() => {
              resetForm();
              onDismiss();
            }} 
            style={styles.button}
          >
            İptal
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Kaydet
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  scrollView: {
    maxHeight: 400,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  button: {
    minWidth: 100,
  },
});

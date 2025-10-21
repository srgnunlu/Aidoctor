import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Chip, Divider, SegmentedButtons } from 'react-native-paper';
import { LAB_CATEGORIES, LAB_PARAMETERS, getParameterStatus } from '../utils/labReferenceRanges';
import colors from '../constants/colors';

export default function EditLabResultModal({ visible, onDismiss, onSave, labResult, loading }) {
  const [testType, setTestType] = useState('BLOOD');
  const [category, setCategory] = useState('HEMOGRAM');
  const [testName, setTestName] = useState('');
  const [parameters, setParameters] = useState({});
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('COMPLETED');

  useEffect(() => {
    if (labResult && visible) {
      setTestType(labResult.testType || 'BLOOD');
      setCategory(labResult.category || 'HEMOGRAM');
      setTestName(labResult.testName || '');
      setNotes(labResult.notes || '');
      setStatus(labResult.status || 'COMPLETED');

      const paramMap = {};
      if (labResult.parameters && Array.isArray(labResult.parameters)) {
        labResult.parameters.forEach(param => {
          if (param && param.key) {
            paramMap[param.key] = String(param.value || '');
          }
        });
      }
      setParameters(paramMap);
    }
  }, [labResult, visible]);

  const availableParameters = LAB_PARAMETERS[category] || [];

  const handleSave = () => {
    const parameterArray = availableParameters
      .filter(param => parameters[param.key] !== undefined && parameters[param.key] !== '')
      .map(param => ({
        key: param.key,
        name: param.name,
        value: parseFloat(parameters[param.key]),
        unit: param.unit,
        refMin: param.refMin,
        refMax: param.refMax,
        status: getParameterStatus(parseFloat(parameters[param.key]), param.refMin, param.refMax)
      }));

    if (parameterArray.length === 0) {
      Alert.alert('Uyarı', 'En az bir parametre değeri girmelisiniz');
      return;
    }

    const categoryInfo = LAB_CATEGORIES[category];
    const data = {
      testType,
      category,
      testName: testName.trim() || categoryInfo.label,
      parameters: parameterArray,
      notes: notes.trim() || null,
      status,
    };

    onSave(data);
  };

  const handleParameterChange = (paramKey, value) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value
    }));
  };

  const getValueStatus = (paramKey) => {
    const value = parseFloat(parameters[paramKey]);
    if (isNaN(value)) return null;
    
    const param = availableParameters.find(p => p.key === paramKey);
    if (!param) return null;
    
    return getParameterStatus(value, param.refMin, param.refMax);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'HIGH': return colors.error;
      case 'LOW': return colors.warning;
      case 'NORMAL': return colors.success;
      default: return colors.gray;
    }
  };

  if (!labResult) return null;

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Lab Sonucu Düzenle
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text variant="bodySmall" style={styles.label}>Kategori: {LAB_CATEGORIES[category]?.label}</Text>

          <Text variant="bodySmall" style={styles.label}>Test Tipi</Text>
          <SegmentedButtons
            value={testType}
            onValueChange={setTestType}
            buttons={[
              { value: 'BLOOD', label: 'Kan' },
              { value: 'URINE', label: 'İdrar' },
              { value: 'OTHER', label: 'Diğer' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            mode="outlined"
            label="Test Adı"
            value={testName}
            onChangeText={setTestName}
            style={styles.input}
          />

          <Text variant="bodySmall" style={styles.label}>Durum</Text>
          <SegmentedButtons
            value={status}
            onValueChange={setStatus}
            buttons={[
              { value: 'PENDING', label: 'Bekliyor' },
              { value: 'COMPLETED', label: 'Tamamlandı' },
              { value: 'REVIEWED', label: 'İncelendi' },
            ]}
            style={styles.segmented}
          />

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.parametersTitle}>
            Parametreler
          </Text>

          {availableParameters.map((param) => {
            const value = parameters[param.key] || '';
            const valueStatus = getValueStatus(param.key);
            
            return (
              <View key={param.key} style={styles.parameterRow}>
                <View style={styles.parameterInfo}>
                  <Text variant="bodyMedium" style={styles.parameterName}>
                    {param.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.parameterRef}>
                    Normal: {param.refMin !== null && param.refMax !== null 
                      ? `${param.refMin}-${param.refMax}` 
                      : param.refMax !== null 
                      ? `< ${param.refMax}` 
                      : '-'} {param.unit}
                  </Text>
                </View>
                <View style={styles.parameterInput}>
                  <TextInput
                    mode="outlined"
                    value={value}
                    onChangeText={(text) => handleParameterChange(param.key, text)}
                    keyboardType="decimal-pad"
                    style={[
                      styles.valueInput,
                      valueStatus && { borderColor: getStatusColor(valueStatus), borderWidth: 2 }
                    ]}
                    placeholder="Değer"
                    dense
                  />
                  {valueStatus && (
                    <Chip
                      mode="flat"
                      compact
                      style={[styles.statusChip, { backgroundColor: getStatusColor(valueStatus) }]}
                      textStyle={styles.statusChipText}
                    >
                      {valueStatus === 'HIGH' ? 'Yüksek' : valueStatus === 'LOW' ? 'Düşük' : 'Normal'}
                    </Chip>
                  )}
                </View>
              </View>
            );
          })}

          <TextInput
            mode="outlined"
            label="Notlar (Opsiyonel)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </ScrollView>

        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={onDismiss} 
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
    borderRadius: 12,
    maxHeight: '90%',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollView: {
    maxHeight: 500,
    paddingHorizontal: 16,
  },
  label: {
    color: colors.gray,
    marginBottom: 8,
    marginTop: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  parametersTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.darkGray,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  parameterInfo: {
    flex: 1,
    marginRight: 12,
  },
  parameterName: {
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 2,
  },
  parameterRef: {
    color: colors.gray,
    fontSize: 11,
  },
  parameterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueInput: {
    width: 100,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  button: {
    minWidth: 100,
  },
});

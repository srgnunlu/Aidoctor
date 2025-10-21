import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, SegmentedButtons, IconButton, Chip, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { LAB_CATEGORIES, LAB_PARAMETERS, getParameterStatus } from '../utils/labReferenceRanges';
import colors from '../constants/colors';
import ImagePickerModal from './ImagePickerModal';
import OCRPreviewModal from './OCRPreviewModal';
import { uploadImageToOCR } from '../services/ocrService';

export default function AddLabResultModalNew({ visible, onDismiss, onSave, loading, patientId }) {
  const [testType, setTestType] = useState('BLOOD');
  const [category, setCategory] = useState('HEMOGRAM');
  const [testName, setTestName] = useState('');
  const [parameters, setParameters] = useState({});
  const [notes, setNotes] = useState('');
  
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [ocrPreviewVisible, setOcrPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

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
        refMax: param.refMax
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
      status: 'COMPLETED',
      orderedAt: new Date().toISOString(),
      resultedAt: new Date().toISOString(),
    };

    onSave(data);
  };

  const resetForm = () => {
    setTestType('BLOOD');
    setCategory('HEMOGRAM');
    setTestName('');
    setParameters({});
    setNotes('');
    setSelectedImage(null);
    setOcrResult(null);
  };

  const handleParameterChange = (paramKey, value) => {
    setParameters(prev => ({
      ...prev,
      [paramKey]: value
    }));
  };

  const handleImageSelected = async (imageAsset, sourceType) => {
    try {
      setOcrProcessing(true);
      setSelectedImage(imageAsset);

      const result = await uploadImageToOCR(imageAsset, patientId, sourceType, 'LAB_REPORT');
      setOcrResult(result);
      setOcrPreviewVisible(true);
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert('Hata', 'Fotoğraf işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleOCRConfirm = (confirmedData) => {
    // TODO: Parse OCR data and populate parameters
    setOcrPreviewVisible(false);
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
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Laboratuvar Sonucu Ekle
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => {
              resetForm();
              onDismiss();
            }}
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Button
            mode="outlined"
            icon="camera"
            onPress={() => setImagePickerVisible(true)}
            loading={ocrProcessing}
            disabled={ocrProcessing || loading}
            style={styles.ocrButton}
          >
            {ocrProcessing ? 'İşleniyor...' : 'Fotoğraftan Ekle (OCR)'}
          </Button>

          <Text variant="bodySmall" style={styles.label}>Kategori Seçin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {Object.values(LAB_CATEGORIES).map((cat) => (
              <Chip
                key={cat.value}
                mode={category === cat.value ? 'flat' : 'outlined'}
                selected={category === cat.value}
                onPress={() => {
                  setCategory(cat.value);
                  setParameters({});
                }}
                style={[
                  styles.categoryChip,
                  category === cat.value && { backgroundColor: cat.color + '20' }
                ]}
                textStyle={category === cat.value && { color: cat.color, fontWeight: 'bold' }}
                icon={cat.icon}
              >
                {cat.label}
              </Chip>
            ))}
          </ScrollView>

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
            label="Test Adı (Opsiyonel)"
            value={testName}
            onChangeText={setTestName}
            style={styles.input}
            placeholder={LAB_CATEGORIES[category].label}
          />

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.parametersTitle}>
            Parametreler
          </Text>

          {availableParameters.map((param, index) => {
            const value = parameters[param.key] || '';
            const status = getValueStatus(param.key);
            
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
                      status && { borderColor: getStatusColor(status), borderWidth: 2 }
                    ]}
                    placeholder="Değer"
                    dense
                  />
                  {status && (
                    <Chip
                      mode="flat"
                      compact
                      style={[styles.statusChip, { backgroundColor: getStatusColor(status) }]}
                      textStyle={styles.statusChipText}
                    >
                      {status === 'HIGH' ? 'Yüksek' : status === 'LOW' ? 'Düşük' : 'Normal'}
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

        <ImagePickerModal
          visible={imagePickerVisible}
          onDismiss={() => setImagePickerVisible(false)}
          onImageSelected={handleImageSelected}
          title="Lab Sonucu Fotoğrafı"
        />

        <OCRPreviewModal
          visible={ocrPreviewVisible}
          onDismiss={() => setOcrPreviewVisible(false)}
          onConfirm={handleOCRConfirm}
          ocrResult={ocrResult}
          imageUri={selectedImage?.uri}
          category="LAB_REPORT"
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  ocrButton: {
    marginBottom: 16,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  label: {
    color: colors.gray,
    marginBottom: 8,
    marginTop: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
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

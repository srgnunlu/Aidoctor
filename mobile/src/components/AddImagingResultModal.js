import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import colors from '../constants/colors';
import ImagePickerModal from './ImagePickerModal';
import OCRPreviewModal from './OCRPreviewModal';
import { uploadImageToOCR } from '../services/ocrService';

export default function AddImagingResultModal({ visible, onDismiss, onSave, loading, patientId }) {
  const [imagingType, setImagingType] = useState('XRAY');
  const [bodyPart, setBodyPart] = useState('');
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [technique, setTechnique] = useState('');
  const [radiologist, setRadiologist] = useState('');
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [ocrPreviewVisible, setOcrPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  const handleSave = () => {
    if (!bodyPart.trim() || !findings.trim()) return;
    
    const data = {
      imagingType,
      bodyPart: bodyPart.trim(),
      findings: findings.trim(),
      impression: impression.trim() || null,
      technique: technique.trim() || null,
      radiologist: radiologist.trim() || null,
      status: 'COMPLETED',
      orderedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    onSave(data);
  };

  const resetForm = () => {
    setImagingType('XRAY');
    setBodyPart('');
    setFindings('');
    setImpression('');
    setTechnique('');
    setRadiologist('');
    setSelectedImage(null);
    setOcrResult(null);
  };

  const handleImageSelected = async (imageAsset, sourceType) => {
    try {
      setOcrProcessing(true);
      setSelectedImage(imageAsset);

      const result = await uploadImageToOCR(imageAsset, patientId, sourceType, 'IMAGING_REPORT');
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
    setFindings(confirmedData.extractedText);
    
    if (confirmedData.structuredData?.bodyParts && confirmedData.structuredData.bodyParts.length > 0) {
      const firstBodyPart = confirmedData.structuredData.bodyParts[0];
      if (firstBodyPart && !bodyPart) {
        setBodyPart(firstBodyPart);
      }
    }
    
    setOcrPreviewVisible(false);
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
          Görüntüleme Sonucu Ekle
        </Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.ocrButtonContainer}>
            <Button
              mode="outlined"
              icon="camera"
              onPress={() => setImagePickerVisible(true)}
              loading={ocrProcessing}
              disabled={ocrProcessing || loading}
              style={styles.ocrButton}
            >
              {ocrProcessing ? 'İşleniyor...' : 'Rapordan Ekle (OCR)'}
            </Button>
          </View>

          <Text variant="bodySmall" style={styles.label}>Görüntüleme Tipi</Text>
          <SegmentedButtons
            value={imagingType}
            onValueChange={setImagingType}
            buttons={[
              { value: 'XRAY', label: 'Röntgen' },
              { value: 'CT', label: 'BT' },
            ]}
            style={styles.segmented}
          />
          
          <SegmentedButtons
            value={imagingType}
            onValueChange={setImagingType}
            buttons={[
              { value: 'MRI', label: 'MR' },
              { value: 'ULTRASOUND', label: 'USG' },
              { value: 'OTHER', label: 'Diğer' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            mode="outlined"
            label="Bölge *"
            value={bodyPart}
            onChangeText={setBodyPart}
            style={styles.input}
            placeholder="Örn: Akciğer, Karın, Beyin"
          />

          <TextInput
            mode="outlined"
            label="Bulgular *"
            value={findings}
            onChangeText={setFindings}
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Görüntüleme bulgularını girin..."
          />

          <TextInput
            mode="outlined"
            label="Yorum / İmpression"
            value={impression}
            onChangeText={setImpression}
            multiline
            numberOfLines={2}
            style={styles.input}
            placeholder="Radyolog yorumu..."
          />

          <TextInput
            mode="outlined"
            label="Teknik"
            value={technique}
            onChangeText={setTechnique}
            style={styles.input}
            placeholder="Örn: Non-kontrastlı BT"
          />

          <TextInput
            mode="outlined"
            label="Radyolog"
            value={radiologist}
            onChangeText={setRadiologist}
            style={styles.input}
            placeholder="Raporu hazırlayan radyolog"
          />

          <Text variant="bodySmall" style={styles.hint}>
            * Bulgular alanı zorunludur
          </Text>
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
            disabled={!bodyPart.trim() || !findings.trim() || loading}
            style={styles.button}
          >
            Kaydet
          </Button>
        </View>

        <ImagePickerModal
          visible={imagePickerVisible}
          onDismiss={() => setImagePickerVisible(false)}
          onImageSelected={handleImageSelected}
          title="Görüntüleme Raporu Fotoğrafı"
        />

        <OCRPreviewModal
          visible={ocrPreviewVisible}
          onDismiss={() => setOcrPreviewVisible(false)}
          onConfirm={handleOCRConfirm}
          ocrResult={ocrResult}
          imageUri={selectedImage?.uri}
          category="IMAGING_REPORT"
        />
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
  ocrButtonContainer: {
    marginBottom: 16,
  },
  ocrButton: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  label: {
    color: colors.gray,
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  hint: {
    color: colors.gray,
    fontStyle: 'italic',
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

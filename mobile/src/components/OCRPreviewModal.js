import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Chip, Divider } from 'react-native-paper';
import colors from '../constants/colors';

export default function OCRPreviewModal({ 
  visible, 
  onDismiss, 
  onConfirm, 
  ocrResult, 
  imageUri,
  category = 'LAB_REPORT'
}) {
  const [editedText, setEditedText] = useState('');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (ocrResult) {
      setEditedText(ocrResult.extractedText || '');
      setConfidence(ocrResult.confidence || 0);
    }
  }, [ocrResult]);

  const handleConfirm = () => {
    onConfirm({
      extractedText: editedText,
      confidence,
      structuredData: ocrResult?.structuredData,
    });
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning;
    return colors.error;
  };

  const getConfidenceLabel = () => {
    if (confidence >= 0.8) return 'Yüksek Güven';
    if (confidence >= 0.6) return 'Orta Güven';
    return 'Düşük Güven';
  };

  const renderStructuredData = () => {
    if (!ocrResult?.structuredData) return null;

    if (category === 'LAB_REPORT' && ocrResult.structuredData.results) {
      return (
        <View style={styles.structuredDataContainer}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Algılanan Test Sonuçları:
          </Text>
          {ocrResult.structuredData.results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>{result.testName}:</Text> {result.value}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (category === 'IMAGING_REPORT' && ocrResult.structuredData.bodyParts) {
      return (
        <View style={styles.structuredDataContainer}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Algılanan Bölgeler:
          </Text>
          <View style={styles.chipContainer}>
            {ocrResult.structuredData.bodyParts.map((part, index) => (
              <Chip key={index} style={styles.chip}>
                {part}
              </Chip>
            ))}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.modal}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="titleLarge" style={styles.title}>
            OCR Sonucu
          </Text>

          {imageUri && (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image}
              resizeMode="contain"
            />
          )}

          <View style={styles.confidenceContainer}>
            <Chip 
              icon="check-circle" 
              style={[styles.confidenceChip, { backgroundColor: getConfidenceColor() }]}
              textStyle={{ color: 'white' }}
            >
              {getConfidenceLabel()} ({(confidence * 100).toFixed(0)}%)
            </Chip>
          </View>

          {renderStructuredData()}

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Çıkarılan Metin (Düzenleyebilirsiniz):
          </Text>
          <TextInput
            mode="outlined"
            value={editedText}
            onChangeText={setEditedText}
            multiline
            numberOfLines={10}
            style={styles.textInput}
          />

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
              onPress={handleConfirm}
              disabled={!editedText.trim()}
              style={styles.button}
            >
              Onayla ve Kaydet
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    maxHeight: '90%',
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  confidenceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceChip: {
    paddingHorizontal: 8,
  },
  structuredDataContainer: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  resultItem: {
    paddingVertical: 4,
  },
  resultText: {
    color: colors.textPrimary,
  },
  bold: {
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  textInput: {
    marginBottom: 16,
    minHeight: 150,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

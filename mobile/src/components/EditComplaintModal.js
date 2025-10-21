import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, TextInput, Button } from 'react-native-paper';
import colors from '../constants/colors';

export default function EditComplaintModal({ visible, onDismiss, initialComplaint, onSave, loading }) {
  const [complaint, setComplaint] = useState(initialComplaint || '');

  useEffect(() => {
    if (visible) {
      setComplaint(initialComplaint || '');
    }
  }, [visible, initialComplaint]);

  const handleSave = () => {
    if (!complaint.trim()) return;
    onSave(complaint.trim());
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleLarge" style={styles.title}>
          Şikayeti Düzenle
        </Text>

        <TextInput
          mode="outlined"
          label="Şikayet"
          value={complaint}
          onChangeText={setComplaint}
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="Hastanın şikayetini girin..."
        />

        <View style={styles.actions}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            İptal
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={loading}
            disabled={!complaint.trim() || loading}
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
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 100,
  },
});

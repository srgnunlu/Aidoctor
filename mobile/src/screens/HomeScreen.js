import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import colors from '../constants/colors';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Hoş Geldiniz!
      </Text>
      
      <Text variant="bodyLarge" style={styles.subtitle}>
        {user?.name}
      </Text>

      <Text variant="bodyMedium" style={styles.email}>
        {user?.email}
      </Text>

      <View style={styles.infoBox}>
        <Text variant="titleMedium" style={styles.infoTitle}>
          AI-Doctor Mobil Uygulaması
        </Text>
        <Text variant="bodyMedium" style={styles.infoText}>
          Hasta yönetimi özellikleri gelecek güncellemelerde eklenecektir.
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        buttonColor={colors.error}
      >
        Çıkış Yap
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: colors.black,
    marginBottom: 8,
  },
  email: {
    color: colors.gray,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    color: colors.primary,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  infoText: {
    color: colors.darkGray,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 6,
  },
});

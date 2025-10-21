import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, setRealtimePatients } from '../store/slices/patientSlice';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import PatientCard from '../components/PatientCard';
import AddPatientModal from '../components/AddPatientModal';
import colors from '../constants/colors';

export default function PatientListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { patients, loading, refreshing, error } = useSelector((state) => state.patient);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user');
      return;
    }

    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef,
      where('userId', '==', currentUser.uid),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt)
        }));
        dispatch(setRealtimePatients(patients));
      },
      (error) => {
        console.error('Real-time patients error:', error);
        dispatch(fetchPatients());
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPatients({ refresh: true }));
  };

  const handlePatientPress = (patientId) => {
    navigation.navigate('PatientDetail', { patientId });
  };

  const renderPatientCard = ({ item }) => (
    <PatientCard
      patient={item}
      onPress={() => handlePatientPress(item.id)}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Henüz hasta yok
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Yeni bir hasta eklemek için + butonuna tıklayın
        </Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!patients || patients.length === 0) {
      return null;
    }

    const activeCount = patients.filter(p => p.isActive).length;

    return (
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerText}>
          {activeCount} Aktif Hasta
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !patients.length) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Hata Oluştu
        </Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={patients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={patients.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color={colors.white}
      />

      <AddPatientModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
      />
    </View>
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
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorTitle: {
    color: colors.error,
    marginBottom: 12,
  },
  errorText: {
    color: colors.darkGray,
    textAlign: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: colors.darkGray,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerText: {
    color: colors.darkGray,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

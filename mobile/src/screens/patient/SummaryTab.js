import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Divider, ActivityIndicator, IconButton, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVitalSigns, createVitalSign, setRealtimeVitals } from '../../store/slices/vitalSlice';
import { updatePatient } from '../../store/slices/patientSlice';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import EditComplaintModal from '../../components/EditComplaintModal';
import AddVitalSignModal from '../../components/AddVitalSignModal';
import colors from '../../constants/colors';

const PRIORITY_COLORS = {
  LOW: colors.priority.LOW,
  MEDIUM: colors.priority.MEDIUM,
  HIGH: colors.priority.HIGH,
  CRITICAL: colors.priority.CRITICAL,
};

const PRIORITY_LABELS = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
};

const STATUS_LABELS = {
  EVALUATION: 'Değerlendirme',
  LAB_WAITING: 'Lab Bekliyor',
  CONSULTATION: 'Konsültasyon',
  READY: 'Hazır',
  DISCHARGED: 'Taburcu',
};

export default function SummaryTab({ patientId, patient }) {
  const dispatch = useDispatch();
  const { vitals, loading, createLoading } = useSelector((state) => state.vital);
  const { updating } = useSelector((state) => state.patient);
  
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [vitalModalVisible, setVitalModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!patientId) return;

    const vitalsRef = collection(db, 'patients', patientId, 'vitalSigns');
    const q = query(vitalsRef, orderBy('recordedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vitals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          recordedAt: doc.data().recordedAt?.toDate?.() || new Date(doc.data().recordedAt)
        }));
        dispatch(setRealtimeVitals(vitals));
      },
      (error) => {
        console.error('Real-time vitals error:', error);
        dispatch(fetchVitalSigns(patientId));
      }
    );

    return () => unsubscribe();
  }, [dispatch, patientId]);

  const handleSaveComplaint = async (complaint) => {
    const result = await dispatch(updatePatient({ id: patientId, complaint }));
    if (result.type === 'patient/updatePatient/fulfilled') {
      setComplaintModalVisible(false);
      setSuccessMessage('Şikayet güncellendi');
      setShowSuccess(true);
    }
  };

  const handleSaveVital = async (data) => {
    const result = await dispatch(createVitalSign({ patientId, data }));
    if (result.type === 'vital/createVitalSign/fulfilled') {
      setVitalModalVisible(false);
      setSuccessMessage('Vital bulgular eklendi');
      setShowSuccess(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const latestVital = vitals && vitals.length > 0 ? vitals[0] : null;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.name}>
            {patient.name}
          </Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoText}>
              {patient.age} yaş • {patient.gender === 'MALE' ? 'Erkek' : patient.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
            </Text>
          </View>
          <View style={styles.badges}>
            <Chip
              mode="flat"
              style={[styles.chip, { backgroundColor: PRIORITY_COLORS[patient.priority] + '20' }]}
              textStyle={[styles.chipText, { color: PRIORITY_COLORS[patient.priority] }]}
            >
              {PRIORITY_LABELS[patient.priority]}
            </Chip>
            <Chip mode="outlined" style={styles.chip}>
              {STATUS_LABELS[patient.status]}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Şikayet
            </Text>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => setComplaintModalVisible(true)}
            />
          </View>
          <Text variant="bodyMedium" style={styles.complaint}>
            {patient.complaint}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Kabul Bilgileri
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.infoItem}>
            <Text variant="bodySmall" style={styles.label}>Kabul Zamanı</Text>
            <Text variant="bodyMedium">{formatDate(patient.admissionTime)}</Text>
          </View>
          {patient.dischargeTime && (
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={styles.label}>Taburcu Zamanı</Text>
              <Text variant="bodyMedium">{formatDate(patient.dischargeTime)}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Son Vital Bulgular
            </Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => setVitalModalVisible(true)}
            />
          </View>
          <Divider style={styles.divider} />
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : latestVital ? (
            <>
              <View style={styles.vitalRow}>
                <View style={styles.vitalItem}>
                  <Text variant="bodySmall" style={styles.label}>Nabız</Text>
                  <Text variant="titleMedium">{latestVital.heartRate ?? '-'}</Text>
                  <Text variant="bodySmall" style={styles.unit}>bpm</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text variant="bodySmall" style={styles.label}>Tansiyon</Text>
                  <Text variant="titleMedium">
                    {latestVital.bloodPressureSystolic ?? '-'}/{latestVital.bloodPressureDiastolic ?? '-'}
                  </Text>
                  <Text variant="bodySmall" style={styles.unit}>mmHg</Text>
                </View>
              </View>
              <View style={styles.vitalRow}>
                <View style={styles.vitalItem}>
                  <Text variant="bodySmall" style={styles.label}>Ateş</Text>
                  <Text variant="titleMedium">{latestVital.temperature ?? '-'}</Text>
                  <Text variant="bodySmall" style={styles.unit}>°C</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text variant="bodySmall" style={styles.label}>SpO2</Text>
                  <Text variant="titleMedium">{latestVital.oxygenSaturation ?? '-'}</Text>
                  <Text variant="bodySmall" style={styles.unit}>%</Text>
                </View>
              </View>
              <View style={styles.vitalRow}>
                <View style={styles.vitalItem}>
                  <Text variant="bodySmall" style={styles.label}>Solunum</Text>
                  <Text variant="titleMedium">{latestVital.respiratoryRate ?? '-'}</Text>
                  <Text variant="bodySmall" style={styles.unit}>/dk</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text variant="bodySmall" style={styles.label}>Kayıt</Text>
                  <Text variant="bodySmall">{formatDate(latestVital.recordedAt)}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text variant="bodyMedium" style={styles.noData}>
              Henüz vital bulgu kaydı yok
            </Text>
          )}
        </Card.Content>
      </Card>

      <EditComplaintModal
        visible={complaintModalVisible}
        onDismiss={() => setComplaintModalVisible(false)}
        initialComplaint={patient?.complaint}
        onSave={handleSaveComplaint}
        loading={updating}
      />

      <AddVitalSignModal
        visible={vitalModalVisible}
        onDismiss={() => setVitalModalVisible(false)}
        onSave={handleSaveVital}
        loading={createLoading}
      />

      <Snackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        duration={3000}
        style={styles.successSnackbar}
      >
        {successMessage}
      </Snackbar>
    </ScrollView>
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
  card: {
    margin: 12,
    backgroundColor: colors.white,
  },
  name: {
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoText: {
    color: colors.gray,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  complaint: {
    color: colors.darkGray,
    lineHeight: 22,
  },
  divider: {
    marginVertical: 12,
  },
  infoItem: {
    marginBottom: 12,
  },
  label: {
    color: colors.gray,
    marginBottom: 4,
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vitalItem: {
    flex: 1,
    alignItems: 'center',
  },
  unit: {
    color: colors.gray,
    marginTop: 4,
  },
  loader: {
    marginVertical: 16,
  },
  noData: {
    color: colors.gray,
    textAlign: 'center',
    marginVertical: 16,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

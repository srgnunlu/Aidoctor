import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, FAB, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabResults, createLabResult, updateLabResult, setRealtimeLabs } from '../../store/slices/labSlice';
import { fetchImagingResults, createImagingResult, setRealtimeImaging } from '../../store/slices/imagingSlice';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import LabResultCard from '../../components/LabResultCard';
import AddLabResultModal from '../../components/AddLabResultModal';
import EditLabResultModal from '../../components/EditLabResultModal';
import LabTrendModal from '../../components/LabTrendModal';
import ImagingResultCard from '../../components/ImagingResultCard';
import AddImagingResultModal from '../../components/AddImagingResultModal';
import colors from '../../constants/colors';

export default function TestsTabNew({ patientId }) {
  const dispatch = useDispatch();
  const { labs, loading: labsLoading } = useSelector((state) => state.lab);
  const { imaging, loading: imagingLoading } = useSelector((state) => state.imaging);
  
  const [activeTab, setActiveTab] = useState('labs');
  const [labModalVisible, setLabModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [trendModalVisible, setTrendModalVisible] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [imagingModalVisible, setImagingModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!patientId) return;

    const labsRef = collection(db, 'patients', patientId, 'labResults');
    const labsQuery = query(labsRef, orderBy('orderedAt', 'desc'));

    const unsubscribeLabs = onSnapshot(
      labsQuery,
      (snapshot) => {
        const labs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          orderedAt: doc.data().orderedAt?.toDate?.() || new Date(doc.data().orderedAt),
          resultedAt: doc.data().resultedAt?.toDate?.() || (doc.data().resultedAt ? new Date(doc.data().resultedAt) : null)
        }));
        dispatch(setRealtimeLabs(labs));
      },
      (error) => {
        console.error('Real-time labs error:', error);
        dispatch(fetchLabResults(patientId));
      }
    );

    const imagingRef = collection(db, 'patients', patientId, 'imagingResults');
    const imagingQuery = query(imagingRef, orderBy('orderedAt', 'desc'));

    const unsubscribeImaging = onSnapshot(
      imagingQuery,
      (snapshot) => {
        const imaging = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          orderedAt: doc.data().orderedAt?.toDate?.() || new Date(doc.data().orderedAt),
          resultedAt: doc.data().resultedAt?.toDate?.() || (doc.data().resultedAt ? new Date(doc.data().resultedAt) : null)
        }));
        dispatch(setRealtimeImaging(imaging));
      },
      (error) => {
        console.error('Real-time imaging error:', error);
        dispatch(fetchImagingResults(patientId));
      }
    );

    return () => {
      unsubscribeLabs();
      unsubscribeImaging();
    };
  }, [dispatch, patientId]);

  const handleSaveLab = async (data) => {
    const result = await dispatch(createLabResult({ patientId, data }));
    if (result.type === 'lab/createLabResult/fulfilled') {
      setLabModalVisible(false);
      setSuccessMessage('Laboratuvar sonucu eklendi');
      setShowSuccess(true);
    }
  };

  const handleSaveImaging = async (data) => {
    const result = await dispatch(createImagingResult({ patientId, data }));
    if (result.type === 'imaging/createImagingResult/fulfilled') {
      setImagingModalVisible(false);
      setSuccessMessage('Görüntüleme sonucu eklendi');
      setShowSuccess(true);
    }
  };

  const handleEditImaging = (imagingResult) => {
    setSuccessMessage('Görüntüleme düzenleme yakında eklenecek');
    setShowSuccess(true);
  };

  const handleEditLab = (labResult) => {
    setSelectedLab(labResult);
    setEditModalVisible(true);
  };

  const handleUpdateLab = async (data) => {
    if (!selectedLab) return;
    
    const result = await dispatch(updateLabResult({ 
      patientId, 
      labId: selectedLab.id, 
      data 
    }));
    
    if (result.type === 'lab/updateLabResult/fulfilled') {
      setEditModalVisible(false);
      setSelectedLab(null);
      setSuccessMessage('Lab sonucu güncellendi');
      setShowSuccess(true);
    }
  };

  const handleViewTrend = (labResult) => {
    setSelectedLab(labResult);
    setTrendModalVisible(true);
  };

  const loading = labsLoading || imagingLoading;

  if (loading && labs.length === 0 && imaging.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayData = activeTab === 'labs' ? labs : imaging;
  const emptyMessage = activeTab === 'labs' 
    ? 'Henüz laboratuvar sonucu yok'
    : 'Henüz görüntüleme sonucu yok';

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'labs', label: `Laboratuvar (${labs.length})`, icon: 'test-tube' },
          { value: 'imaging', label: `Görüntüleme (${imaging.length})`, icon: 'image-outline' },
        ]}
        style={styles.segmented}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {displayData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              {emptyMessage}
            </Text>
            <Text variant="bodySmall" style={styles.emptyHint}>
              + butonuna basarak yeni sonuç ekleyin
            </Text>
          </View>
        ) : activeTab === 'labs' ? (
          labs.map((lab) => (
            <LabResultCard
              key={lab.id}
              labResult={lab}
              onEdit={handleEditLab}
              onViewTrend={handleViewTrend}
            />
          ))
        ) : (
          imaging.map((img) => (
            <ImagingResultCard
              key={img.id}
              imagingResult={img}
              onEdit={handleEditImaging}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => activeTab === 'labs' ? setLabModalVisible(true) : setImagingModalVisible(true)}
        color={colors.white}
        label={activeTab === 'labs' ? 'Lab Ekle' : 'Görüntüleme Ekle'}
      />

      <AddLabResultModal
        visible={labModalVisible}
        onDismiss={() => setLabModalVisible(false)}
        onSave={handleSaveLab}
        patientId={patientId}
      />

      <EditLabResultModal
        visible={editModalVisible}
        onDismiss={() => {
          setEditModalVisible(false);
          setSelectedLab(null);
        }}
        onSave={handleUpdateLab}
        labResult={selectedLab}
      />

      <LabTrendModal
        visible={trendModalVisible}
        onDismiss={() => {
          setTrendModalVisible(false);
          setSelectedLab(null);
        }}
        labResult={selectedLab}
        allLabs={labs}
      />

      <AddImagingResultModal
        visible={imagingModalVisible}
        onDismiss={() => setImagingModalVisible(false)}
        onSave={handleSaveImaging}
        patientId={patientId}
      />

      <Snackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {successMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmented: {
    margin: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.gray,
    marginBottom: 8,
  },
  emptyHint: {
    color: colors.gray,
    fontStyle: 'italic',
  },
  placeholderCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
  snackbar: {
    backgroundColor: colors.success,
  },
});

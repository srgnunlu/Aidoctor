import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider, Snackbar, Banner, Chip, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { analyzePatient, fetchAnalyses, clearError, setRealtimeAnalyses } from '../../store/slices/aiSlice';
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import RiskScoreGauge from '../../components/RiskScoreGauge';
import DiagnosisCard from '../../components/DiagnosisCard';
import ChecklistItem from '../../components/ChecklistItem';
import colors from '../../constants/colors';

export default function AITabNew({ patientId }) {
  const dispatch = useDispatch();
  const { analyses, analyzing, error } = useSelector((state) => state.ai);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedItems, setCompletedItems] = useState({});
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!patientId) return;

    const analysesRef = collection(db, 'patients', patientId, 'aiAnalyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const analysesData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
        analysesData.push({ 
          id: doc.id, 
          ...data,
          createdAt
        });
      });
      dispatch(setRealtimeAnalyses(analysesData));
      
      if (analysesData.length > 0) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [dispatch, patientId, fadeAnim]);

  const handleAnalyze = async () => {
    const result = await dispatch(analyzePatient(patientId));
    if (result.type === 'ai/analyzePatient/fulfilled') {
      setShowSuccess(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAnalyses(patientId));
    setRefreshing(false);
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

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  const handleChecklistToggle = async (analysisId, itemType, itemIndex, item, completed) => {
    const itemKey = `${analysisId}_${itemType}_${itemIndex}`;
    
    setCompletedItems(prev => ({
      ...prev,
      [itemKey]: completed
    }));

    try {
      const checklistRef = doc(db, 'patients', patientId, 'aiAnalyses', analysisId, 'checklist', itemKey);
      await setDoc(checklistRef, {
        itemType,
        itemIndex,
        item,
        completed,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving checklist item:', error);
    }
  };

  useEffect(() => {
    if (!patientId || !analyses || analyses.length === 0) return;

    const loadChecklistStates = async () => {
      const states = {};
      
      for (const analysis of analyses) {
        const checklistRef = collection(db, 'patients', patientId, 'aiAnalyses', analysis.id, 'checklist');
        const snapshot = await getDoc(doc(db, 'patients', patientId, 'aiAnalyses', analysis.id));
        
        if (snapshot.exists()) {
          const checklistSnapshot = await getDocs(checklistRef);
          checklistSnapshot.forEach(doc => {
            const data = doc.data();
            states[doc.id] = data.completed;
          });
        }
      }
      
      setCompletedItems(states);
    };

    loadChecklistStates();
  }, [patientId, analyses]);

  const renderAnalysis = (analysis, index) => {
    const content = analysis.outputData || {};
    const references = analysis.references || {};
    const isLatest = index === 0;

    return (
      <Animated.View 
        key={analysis.id} 
        style={[
          styles.analysisContainer,
          isLatest && { opacity: fadeAnim }
        ]}
      >
        <Card style={[styles.analysisCard, isLatest && styles.latestCard]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View>
                  <Text variant="labelMedium" style={styles.dateText}>
                    {formatDate(analysis.createdAt)}
                  </Text>
                  <Text variant="bodySmall" style={styles.timeAgoText}>
                    {formatTimeAgo(analysis.createdAt)}
                  </Text>
                </View>
                {isLatest && (
                  <Chip mode="flat" style={styles.latestChip} textStyle={styles.latestChipText}>
                    En Güncel
                  </Chip>
                )}
              </View>
              
              <View style={styles.headerRight}>
                {content.acil_durum && (
                  <Chip 
                    mode="flat" 
                    icon="alert-circle" 
                    style={styles.emergencyBadge}
                    textStyle={styles.emergencyBadgeText}
                  >
                    ACİL
                  </Chip>
                )}
                {typeof content.genel_risk_skoru === 'number' && (
                  <View style={styles.compactRiskSection}>
                    <RiskScoreGauge score={content.genel_risk_skoru} size={70} />
                  </View>
                )}
              </View>
            </View>

            <Divider style={styles.headerDivider} />

            {content.eksik_veriler && content.eksik_veriler.length > 0 && (
              <Card style={styles.missingDataCard}>
                <Card.Content>
                  <View style={styles.missingDataHeader}>
                    <IconButton icon="alert" iconColor={colors.warning} size={20} />
                    <Text variant="titleSmall" style={styles.missingDataTitle}>
                      Eksik Veriler
                    </Text>
                  </View>
                  {content.eksik_veriler.map((item, idx) => (
                    <Text key={idx} variant="bodySmall" style={styles.missingDataItem}>
                      • {item}
                    </Text>
                  ))}
                </Card.Content>
              </Card>
            )}

            {content.olasi_tanilar && content.olasi_tanilar.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    🔍 Olası Tanılar
                  </Text>
                  <Chip compact>{content.olasi_tanilar.length} tanı</Chip>
                </View>
                {content.olasi_tanilar.map((tani, idx) => (
                  <DiagnosisCard key={idx} diagnosis={tani} index={idx} />
                ))}
              </View>
            )}

            {content.onerilen_tetkikler && content.onerilen_tetkikler.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  📋 Önerilen Tetkikler
                </Text>
                {content.onerilen_tetkikler.map((tetkik, idx) => {
                  const itemKey = `${analysis.id}_test_${idx}`;
                  return (
                    <ChecklistItem
                      key={idx}
                      item={tetkik}
                      type="test"
                      completed={completedItems[itemKey] || false}
                      onToggle={(item, completed) => 
                        handleChecklistToggle(analysis.id, 'test', idx, item, completed)
                      }
                    />
                  );
                })}
              </View>
            )}

            {content.acil_mudahale && content.acil_mudahale.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  🚨 Acil Müdahale Önerileri
                </Text>
                {content.acil_mudahale.map((mudahale, idx) => {
                  const itemKey = `${analysis.id}_intervention_${idx}`;
                  return (
                    <ChecklistItem
                      key={idx}
                      item={mudahale}
                      type="intervention"
                      completed={completedItems[itemKey] || false}
                      onToggle={(item, completed) => 
                        handleChecklistToggle(analysis.id, 'intervention', idx, item, completed)
                      }
                    />
                  );
                })}
              </View>
            )}

            {content.risk_faktorleri && content.risk_faktorleri.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  ⚠️ Risk Faktörleri
                </Text>
                {content.risk_faktorleri.map((risk, idx) => (
                  <Card key={idx} style={styles.subCard}>
                    <Card.Content style={styles.riskFactorContent}>
                      <View style={styles.riskFactorHeader}>
                        <Text variant="bodyMedium" style={styles.riskName}>
                          • {risk.risk}
                        </Text>
                        <Chip
                          compact
                          mode="flat"
                          style={[
                            styles.severityChip,
                            { backgroundColor: getRiskLevelColor(risk.seviye) + '20' }
                          ]}
                          textStyle={[
                            styles.severityText,
                            { color: getRiskLevelColor(risk.seviye) }
                          ]}
                        >
                          {risk.seviye}
                        </Chip>
                      </View>
                      {risk.aciklama && (
                        <Text variant="bodySmall" style={styles.riskExplanation}>
                          {risk.aciklama}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}

            {content.klinik_oneri && (
              <Card style={styles.clinicalAdviceCard}>
                <Card.Content>
                  <View style={styles.adviceHeader}>
                    <IconButton icon="clipboard-text" size={20} iconColor={colors.primary} />
                    <Text variant="titleSmall" style={styles.adviceTitle}>
                      Klinik Öneri
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.adviceText}>
                    {content.klinik_oneri}
                  </Text>
                </Card.Content>
              </Card>
            )}

            <Text variant="bodySmall" style={styles.modelInfo}>
              Model: {references.model || 'N/A'} • Tokens: {references.tokens || 'N/A'}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return colors.error;
      case 'HIGH': return colors.warning;
      case 'MEDIUM': return colors.info;
      case 'LOW': return colors.success;
      default: return colors.gray;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'IMMEDIATE': return colors.error;
      case 'URGENT': return '#FF6B6B';
      case 'ROUTINE': return colors.info;
      default: return colors.gray;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'HIGH': return colors.error;
      case 'MEDIUM': return colors.warning;
      case 'LOW': return colors.info;
      default: return colors.gray;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={handleAnalyze}
          loading={analyzing}
          disabled={analyzing}
          icon="brain"
          style={styles.analyzeButton}
        >
          {analyzing ? 'Analiz Ediliyor...' : 'Yeni Analiz Yap'}
        </Button>
        <Text variant="bodySmall" style={styles.hint}>
          GPT-4 ile hasta verileri analiz edilir
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {analyses && analyses.length > 0 ? (
          analyses.map(renderAnalysis)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <IconButton icon="brain" size={48} iconColor={colors.gray} style={styles.emptyIcon} />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Henüz AI Analizi Yok
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                "Yeni Analiz Yap" butonuna tıklayarak hastanın tüm verilerini AI ile analiz edin.
              </Text>
              <Text variant="bodySmall" style={styles.emptyHint}>
                💡 Analiz, vital bulgular, laboratuvar sonuçları ve görüntüleme raporlarını değerlendirir.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Snackbar
        visible={!!error || showSuccess}
        onDismiss={() => {
          dispatch(clearError());
          setShowSuccess(false);
        }}
        duration={3000}
        style={showSuccess ? styles.successSnackbar : null}
      >
        {error || '✅ AI analizi başarıyla tamamlandı!'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  analyzeButton: {
    marginBottom: 8,
  },
  hint: {
    color: colors.gray,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  analysisContainer: {
    marginBottom: 24,
  },
  analysisCard: {
    backgroundColor: colors.white,
    elevation: 2,
  },
  latestCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: colors.darkGray,
    fontWeight: '600',
  },
  timeAgoText: {
    color: colors.gray,
    marginTop: 2,
  },
  latestChip: {
    backgroundColor: colors.primary + '20',
  },
  latestChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  emergencyBadge: {
    backgroundColor: colors.error,
    height: 28,
  },
  emergencyBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  compactRiskSection: {
    alignItems: 'center',
  },
  headerDivider: {
    marginBottom: 16,
  },
  missingDataCard: {
    backgroundColor: colors.warning + '10',
    marginBottom: 16,
  },
  missingDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  missingDataTitle: {
    color: colors.warning,
    fontWeight: 'bold',
  },
  missingDataItem: {
    color: colors.darkGray,
    marginLeft: 8,
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  subCard: {
    marginBottom: 8,
    elevation: 1,
  },
  subCardContent: {
    paddingVertical: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  testName: {
    flex: 1,
    color: colors.darkGray,
    fontWeight: '600',
  },
  priorityChip: {
    height: 24,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  reasonText: {
    color: colors.gray,
    marginTop: 4,
  },
  emergencyCard: {
    backgroundColor: colors.error + '05',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  interventionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interventionTitle: {
    color: colors.error,
    fontWeight: 'bold',
    flex: 1,
  },
  urgencyChip: {
    alignSelf: 'flex-start',
    height: 24,
    marginBottom: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  interventionText: {
    color: colors.darkGray,
  },
  riskFactorContent: {
    paddingVertical: 8,
  },
  riskFactorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskName: {
    flex: 1,
    color: colors.darkGray,
  },
  severityChip: {
    height: 24,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  riskExplanation: {
    color: colors.gray,
    marginTop: 4,
    marginLeft: 16,
  },
  clinicalAdviceCard: {
    backgroundColor: colors.primary + '05',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: 8,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adviceTitle: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  adviceText: {
    color: colors.darkGray,
    lineHeight: 22,
  },
  modelInfo: {
    color: colors.gray,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyCard: {
    marginTop: 40,
    backgroundColor: colors.white,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: 'center',
    color: colors.darkGray,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    marginBottom: 12,
  },
  emptyHint: {
    textAlign: 'center',
    color: colors.gray,
    fontStyle: 'italic',
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

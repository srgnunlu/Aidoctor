import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, List, Divider } from 'react-native-paper';
import colors from '../constants/colors';

const SEVERITY_CONFIG = {
  CRITICAL: { color: colors.error, label: 'KRİTİK', icon: 'alert-circle' },
  HIGH: { color: '#FF6B6B', label: 'YÜKSEK', icon: 'alert' },
  MEDIUM: { color: colors.warning, label: 'ORTA', icon: 'alert-outline' },
  LOW: { color: colors.info, label: 'DÜŞÜK', icon: 'information' },
};

export default function DiagnosisCard({ diagnosis, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  
  const severityConfig = SEVERITY_CONFIG[diagnosis.severity] || SEVERITY_CONFIG.LOW;
  
  return (
    <Card style={styles.card}>
      <List.Accordion
        title={diagnosis.tani}
        description={`Olasılık: %${diagnosis.olasilik || 0} • ${severityConfig.label}`}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        style={[styles.accordion, { borderLeftColor: severityConfig.color, borderLeftWidth: 4 }]}
        titleStyle={styles.title}
        descriptionStyle={styles.description}
        left={props => <List.Icon {...props} icon={severityConfig.icon} color={severityConfig.color} />}
        right={props => (
          <View style={styles.rightContent}>
            <Chip
              mode="flat"
              style={[styles.percentChip, { backgroundColor: severityConfig.color + '20' }]}
              textStyle={[styles.percentText, { color: severityConfig.color }]}
            >
              %{diagnosis.olasilik || 0}
            </Chip>
            <List.Icon {...props} icon={expanded ? 'chevron-up' : 'chevron-down'} />
          </View>
        )}
      >
        <Card.Content style={styles.content}>
          {diagnosis.icd10 && (
            <View style={styles.icdContainer}>
              <Text variant="labelSmall" style={styles.icdLabel}>ICD-10:</Text>
              <Chip compact mode="outlined" style={styles.icdChip}>
                {diagnosis.icd10}
              </Chip>
            </View>
          )}

          {diagnosis.aciklama && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                📝 Açıklama:
              </Text>
              <Text variant="bodyMedium" style={styles.sectionText}>
                {diagnosis.aciklama}
              </Text>
            </View>
          )}

          {diagnosis.destekleyen_bulgular && diagnosis.destekleyen_bulgular.length > 0 && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                ✅ Destekleyen Bulgular:
              </Text>
              {diagnosis.destekleyen_bulgular.map((bulgu, idx) => (
                <Text key={idx} variant="bodySmall" style={styles.bulletText}>
                  • {bulgu}
                </Text>
              ))}
            </View>
          )}

          <Divider style={styles.divider} />
          <Text variant="bodySmall" style={styles.disclaimer}>
            ⚠️ Bu bir AI önerisidir. Nihai tanı hekime aittir.
          </Text>
        </Card.Content>
      </List.Accordion>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.white,
  },
  accordion: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentChip: {
    height: 28,
  },
  percentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    paddingTop: 8,
  },
  icdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  icdLabel: {
    color: colors.gray,
    fontWeight: '600',
  },
  icdChip: {
    height: 24,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    color: colors.darkGray,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionText: {
    color: colors.darkGray,
    lineHeight: 20,
  },
  bulletText: {
    color: colors.darkGray,
    marginLeft: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  disclaimer: {
    color: colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

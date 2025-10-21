import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip, List } from 'react-native-paper';
import colors from '../constants/colors';

const IMAGING_TYPES = {
  XRAY: { icon: 'image-filter-hdr', label: 'X-Ray', color: colors.info },
  CT: { icon: 'rotate-3d-variant', label: 'BT (CT)', color: colors.primary },
  MRI: { icon: 'cube-scan', label: 'MR', color: colors.secondary },
  ULTRASOUND: { icon: 'water', label: 'Ultrason', color: colors.warning },
  OTHER: { icon: 'file-image', label: 'Diğer', color: colors.gray },
};

export default function ImagingResultCard({ imagingResult, onEdit }) {
  const [expanded, setExpanded] = useState(true);

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

  const imagingInfo = IMAGING_TYPES[imagingResult.imagingType] || IMAGING_TYPES.OTHER;

  const STATUS_COLORS = {
    PENDING: colors.warning,
    COMPLETED: colors.info,
    REVIEWED: colors.success,
  };

  const STATUS_LABELS = {
    PENDING: 'Rapor Bekleniyor',
    COMPLETED: 'Rapor Geldi',
    REVIEWED: 'İncelendi',
  };

  return (
    <Card style={styles.card}>
      <List.Accordion
        title={`${imagingInfo.label} - ${imagingResult.bodyPart || 'Genel'}`}
        description={formatDate(imagingResult.orderedAt)}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        style={styles.accordion}
        titleStyle={styles.accordionTitle}
        descriptionStyle={styles.accordionDescription}
        left={props => <List.Icon {...props} icon={imagingInfo.icon} color={imagingInfo.color} />}
        right={props => (
          <View style={styles.rightContent}>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: STATUS_COLORS[imagingResult.status] + '20' }]}
              textStyle={[styles.statusText, { color: STATUS_COLORS[imagingResult.status] }]}
            >
              {STATUS_LABELS[imagingResult.status]}
            </Chip>
            <IconButton
              {...props}
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
            />
          </View>
        )}
      >
        <Card.Content>
          <View style={styles.section}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
              📝 Bulgular:
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {imagingResult.findings || 'Rapor bekleniyor...'}
            </Text>
          </View>

          {imagingResult.impression && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                💡 Yorum:
              </Text>
              <Text variant="bodyMedium" style={styles.sectionContent}>
                {imagingResult.impression}
              </Text>
            </View>
          )}

          {imagingResult.technique && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                🔬 Teknik:
              </Text>
              <Text variant="bodySmall" style={styles.techniqueText}>
                {imagingResult.technique}
              </Text>
            </View>
          )}

          {imagingResult.radiologist && (
            <View style={styles.section}>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                👨‍⚕️ Radyolog:
              </Text>
              <Text variant="bodySmall" style={styles.radiologistText}>
                {imagingResult.radiologist}
              </Text>
            </View>
          )}

          {onEdit && (
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                mode="contained-tonal"
                size={20}
                onPress={() => onEdit(imagingResult)}
                style={styles.actionButton}
              >
                Düzenle
              </IconButton>
            </View>
          )}
        </Card.Content>
      </List.Accordion>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.white,
    elevation: 2,
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  accordionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  accordionDescription: {
    fontSize: 12,
    color: colors.gray,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: colors.darkGray,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionContent: {
    color: colors.darkGray,
    lineHeight: 20,
  },
  techniqueText: {
    color: colors.gray,
    fontStyle: 'italic',
  },
  radiologistText: {
    color: colors.gray,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  actionButton: {
    marginHorizontal: 0,
  },
});

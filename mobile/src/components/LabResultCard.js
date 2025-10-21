import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip, DataTable, List } from 'react-native-paper';
import { LAB_CATEGORIES, getParameterStatusColor, getParameterStatusIcon, formatParameterValue } from '../utils/labReferenceRanges';
import colors from '../constants/colors';

export default function LabResultCard({ labResult, onEdit, onViewTrend }) {
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

  const categoryInfo = LAB_CATEGORIES[labResult.category] || LAB_CATEGORIES.BIOCHEMISTRY;

  const hasParameters = labResult.parameters && labResult.parameters.length > 0;

  const STATUS_COLORS = {
    PENDING: colors.warning,
    COMPLETED: colors.info,
    REVIEWED: colors.success,
  };

  const STATUS_LABELS = {
    PENDING: 'Bekliyor',
    COMPLETED: 'Tamamlandı',
    REVIEWED: 'İncelendi',
  };

  return (
    <Card style={styles.card}>
      <List.Accordion
        title={labResult.testName || 'Lab Sonucu'}
        description={`${categoryInfo.label} • ${formatDate(labResult.orderedAt)}`}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        style={styles.accordion}
        titleStyle={styles.accordionTitle}
        descriptionStyle={styles.accordionDescription}
        left={props => <List.Icon {...props} icon={categoryInfo.icon} color={categoryInfo.color} />}
        right={props => (
          <View style={styles.rightContent}>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: STATUS_COLORS[labResult.status] + '20' }]}
              textStyle={[styles.statusText, { color: STATUS_COLORS[labResult.status] }]}
            >
              {STATUS_LABELS[labResult.status]}
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
          {hasParameters ? (
            <>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={styles.paramNameCol}>Parametre</DataTable.Title>
                  <DataTable.Title numeric style={styles.valueCol}>Değer</DataTable.Title>
                  <DataTable.Title numeric style={styles.refCol}>Referans</DataTable.Title>
                  <DataTable.Title numeric style={styles.statusCol}></DataTable.Title>
                </DataTable.Header>

                {labResult.parameters.map((param, index) => {
                  const statusColor = getParameterStatusColor(param.status);
                  const statusIcon = getParameterStatusIcon(param.status);

                  return (
                    <DataTable.Row key={index} style={styles.paramRow}>
                      <DataTable.Cell style={styles.paramNameCol}>
                        <Text variant="bodyMedium" style={styles.paramName}>
                          {param.name}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric style={styles.valueCol}>
                        <Text 
                          variant="bodyMedium" 
                          style={[styles.paramValue, { color: statusColor, fontWeight: 'bold' }]}
                        >
                          {formatParameterValue(param.value)} {param.unit}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric style={styles.refCol}>
                        <Text variant="bodySmall" style={styles.refRange}>
                          {param.refMin !== null && param.refMax !== null 
                            ? `${param.refMin}-${param.refMax}` 
                            : param.refMax !== null 
                            ? `< ${param.refMax}` 
                            : '-'}
                        </Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric style={styles.statusCol}>
                        <IconButton
                          icon={statusIcon}
                          size={16}
                          iconColor={statusColor}
                          style={styles.statusIcon}
                        />
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })}
              </DataTable>

              <View style={styles.actions}>
                {onViewTrend && (
                  <IconButton
                    icon="chart-line"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => onViewTrend(labResult)}
                    style={styles.actionButton}
                  >
                    Trend
                  </IconButton>
                )}
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => onEdit(labResult)}
                    style={styles.actionButton}
                  >
                    Düzenle
                  </IconButton>
                )}
              </View>
            </>
          ) : (
            <>
              {labResult.results && (
                <>
                  <Text variant="bodySmall" style={styles.legacyLabel}>Sonuçlar:</Text>
                  <Text variant="bodyMedium" style={styles.legacyResults}>
                    {typeof labResult.results === 'object' ? JSON.stringify(labResult.results, null, 2) : labResult.results}
                  </Text>
                </>
              )}
              {onEdit && (
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    mode="contained-tonal"
                    size={20}
                    onPress={() => onEdit(labResult)}
                    style={styles.actionButton}
                  >
                    Düzenle
                  </IconButton>
                </View>
              )}
            </>
          )}

          {labResult.notes && (
            <View style={styles.notesSection}>
              <Text variant="bodySmall" style={styles.notesLabel}>Notlar:</Text>
              <Text variant="bodyMedium" style={styles.notesText}>{labResult.notes}</Text>
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
  paramRow: {
    minHeight: 48,
    paddingVertical: 4,
  },
  paramNameCol: {
    flex: 2.5,
  },
  valueCol: {
    flex: 1.5,
    justifyContent: 'flex-end',
  },
  refCol: {
    flex: 1.2,
    justifyContent: 'flex-end',
  },
  statusCol: {
    flex: 0.5,
    justifyContent: 'flex-end',
  },
  paramName: {
    fontSize: 13,
    color: colors.darkGray,
  },
  paramValue: {
    fontSize: 14,
  },
  refRange: {
    fontSize: 11,
    color: colors.gray,
  },
  statusIcon: {
    margin: 0,
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
  legacyLabel: {
    color: colors.gray,
    marginBottom: 4,
  },
  legacyResults: {
    color: colors.darkGray,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  notesLabel: {
    color: colors.gray,
    marginBottom: 4,
  },
  notesText: {
    color: colors.darkGray,
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, IconButton, Card, Chip, DataTable, Divider } from 'react-native-paper';
import { LAB_CATEGORIES, getParameterStatusColor, formatParameterValue } from '../utils/labReferenceRanges';
import colors from '../constants/colors';

export default function LabTrendModal({ visible, onDismiss, labResult, allLabs }) {
  if (!labResult) return null;

  const category = labResult.category;
  const categoryInfo = LAB_CATEGORIES[category] || {};

  const sameCategoryLabs = allLabs
    .filter(lab => lab.category === category)
    .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt))
    .slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getParameterHistory = (paramKey) => {
    return sameCategoryLabs
      .map(lab => {
        if (!lab.parameters || !Array.isArray(lab.parameters)) return null;
        const param = lab.parameters.find(p => p.key === paramKey);
        if (!param) return null;
        return {
          date: lab.orderedAt,
          value: param.value,
          status: param.status,
          unit: param.unit,
        };
      })
      .filter(Boolean);
  };

  const getTrendIndicator = (history) => {
    if (history.length < 2) return null;
    const latest = history[0].value;
    const previous = history[1].value;
    if (latest > previous) return { icon: 'trending-up', color: colors.error };
    if (latest < previous) return { icon: 'trending-down', color: colors.success };
    return { icon: 'trending-neutral', color: colors.gray };
  };

  const uniqueParameters = labResult.parameters && Array.isArray(labResult.parameters)
    ? labResult.parameters
    : [];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <IconButton
              icon={categoryInfo.icon}
              iconColor={categoryInfo.color}
              size={28}
            />
            <View style={styles.titleInfo}>
              <Text variant="titleLarge" style={styles.title}>
                Trend Analizi
              </Text>
              <Text variant="bodySmall" style={styles.subtitle}>
                {categoryInfo.label}
              </Text>
            </View>
          </View>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
          />
        </View>

        <Chip
          mode="flat"
          icon="chart-timeline-variant"
          style={styles.infoChip}
          textStyle={styles.infoChipText}
        >
          Son {sameCategoryLabs.length} test sonucu
        </Chip>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {uniqueParameters.map((param, index) => {
            const history = getParameterHistory(param.key);
            const trend = getTrendIndicator(history);

            if (history.length === 0) return null;

            return (
              <Card key={param.key} style={styles.parameterCard}>
                <Card.Content>
                  <View style={styles.paramHeader}>
                    <Text variant="titleMedium" style={styles.paramName}>
                      {param.name}
                    </Text>
                    {trend && (
                      <IconButton
                        icon={trend.icon}
                        iconColor={trend.color}
                        size={20}
                        style={styles.trendIcon}
                      />
                    )}
                  </View>

                  <Text variant="bodySmall" style={styles.paramUnit}>
                    Birim: {param.unit} • Normal: {param.refMin !== null && param.refMax !== null 
                      ? `${param.refMin}-${param.refMax}` 
                      : 'N/A'}
                  </Text>

                  <Divider style={styles.divider} />

                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title style={styles.dateCol}>Tarih</DataTable.Title>
                      <DataTable.Title numeric style={styles.valueCol}>Değer</DataTable.Title>
                      <DataTable.Title numeric style={styles.statusCol}>Durum</DataTable.Title>
                    </DataTable.Header>

                    {history.map((entry, idx) => (
                      <DataTable.Row key={idx} style={idx === 0 ? styles.latestRow : null}>
                        <DataTable.Cell style={styles.dateCol}>
                          <Text variant="bodySmall" style={idx === 0 ? styles.latestText : null}>
                            {formatDate(entry.date)}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric style={styles.valueCol}>
                          <Text 
                            variant="bodyMedium" 
                            style={[
                              { color: getParameterStatusColor(entry.status) },
                              idx === 0 && styles.latestText
                            ]}
                          >
                            {formatParameterValue(entry.value)}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric style={styles.statusCol}>
                          <Chip
                            mode="flat"
                            compact
                            style={[
                              styles.statusChip,
                              { backgroundColor: getParameterStatusColor(entry.status) }
                            ]}
                            textStyle={styles.statusChipText}
                          >
                            {entry.status === 'HIGH' ? 'Y' : entry.status === 'LOW' ? 'D' : 'N'}
                          </Chip>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </Card.Content>
              </Card>
            );
          })}

          {uniqueParameters.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Bu test için trend verisi mevcut değil
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleInfo: {
    marginLeft: 8,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    color: colors.gray,
  },
  infoChip: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.info + '20',
  },
  infoChipText: {
    color: colors.info,
    fontSize: 12,
  },
  scrollView: {
    maxHeight: 500,
    paddingHorizontal: 16,
  },
  parameterCard: {
    marginBottom: 16,
    elevation: 2,
  },
  paramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paramName: {
    fontWeight: 'bold',
    color: colors.darkGray,
    flex: 1,
  },
  trendIcon: {
    margin: 0,
  },
  paramUnit: {
    color: colors.gray,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  dateCol: {
    flex: 2,
  },
  valueCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusCol: {
    flex: 0.8,
    justifyContent: 'flex-end',
  },
  latestRow: {
    backgroundColor: colors.primary + '10',
  },
  latestText: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 20,
    minWidth: 24,
  },
  statusChipText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
  },
});

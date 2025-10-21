import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import colors from '../constants/colors';

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

const STATUS_COLORS = {
  EVALUATION: colors.patientStatus.EVALUATION,
  LAB_WAITING: colors.patientStatus.LAB_WAITING,
  CONSULTATION: colors.patientStatus.CONSULTATION,
  READY: colors.patientStatus.READY,
  DISCHARGED: colors.patientStatus.DISCHARGED,
};

const STATUS_LABELS = {
  EVALUATION: 'Değerlendirme',
  LAB_WAITING: 'Lab Bekliyor',
  CONSULTATION: 'Konsültasyon',
  READY: 'Hazır',
  DISCHARGED: 'Taburcu',
};

export default function PatientCard({ patient, onPress }) {
  const priorityColor = PRIORITY_COLORS[patient.priority] || colors.gray;
  const statusColor = STATUS_COLORS[patient.status] || colors.gray;

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

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: priorityColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="titleMedium" style={styles.name}>
            {patient.name}
          </Text>
          <Text variant="bodySmall" style={styles.info}>
            {patient.age} yaş • {patient.gender === 'MALE' ? 'Erkek' : patient.gender === 'FEMALE' ? 'Kadın' : 'Diğer'}
          </Text>
        </View>
        <View
          style={[styles.priorityBadge, { backgroundColor: priorityColor }]}
        >
          <Text style={styles.priorityText}>
            {PRIORITY_LABELS[patient.priority]}
          </Text>
        </View>
      </View>

      <View style={styles.complaint}>
        <Text variant="bodyMedium" style={styles.complaintText} numberOfLines={2}>
          {patient.complaint}
        </Text>
      </View>

      <View style={styles.footer}>
        <Chip
          mode="flat"
          style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
          textStyle={[styles.statusChipText, { color: statusColor }]}
        >
          {STATUS_LABELS[patient.status]}
        </Chip>
        <Text variant="bodySmall" style={styles.dateText}>
          {formatDate(patient.admissionTime)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  info: {
    color: colors.gray,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  complaint: {
    marginBottom: 12,
  },
  complaintText: {
    color: colors.darkGray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    color: colors.gray,
  },
});

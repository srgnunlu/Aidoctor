import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import colors from '../constants/colors';

const QUICK_QUESTIONS = [
  {
    id: 'vitals',
    icon: '💓',
    label: 'Vital Bulgular',
    color: '#FF6B6B',
    question: 'Son vital bulgularını değerlendir ve anormal olanları belirt.',
  },
  {
    id: 'diagnosis',
    icon: '🩺',
    label: 'Ayırıcı Tanı',
    color: '#4ECDC4',
    question: 'Bu hastanın şikayetlerine göre ayırıcı tanı listesi ver.',
  },
  {
    id: 'labs',
    icon: '🧪',
    label: 'Lab Sonuçları',
    color: '#95E1D3',
    question: 'Son laboratuvar sonuçlarını yorumla ve anormal değerleri açıkla.',
  },
  {
    id: 'emergency',
    icon: '🚨',
    label: 'Acil Müdahale',
    color: '#F38181',
    question: 'Acil müdahale gerektiren durumlar var mı? Öneri sun.',
  },
  {
    id: 'imaging',
    icon: '📷',
    label: 'Görüntüleme',
    color: '#AA96DA',
    question: 'Görüntüleme sonuçlarını özetle ve klinik önemi nedir?',
  },
  {
    id: 'tests',
    icon: '📋',
    label: 'Önerilen Tetkikler',
    color: '#FCBAD3',
    question: 'Hangi ek tetkikler istenmeli ve neden?',
  },
];

export default function QuickQuestions({ onSelectQuestion }) {
  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.title}>
        Hızlı Sorular
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_QUESTIONS.map((q) => (
          <TouchableOpacity
            key={q.id}
            onPress={() => onSelectQuestion(q.question)}
            style={[styles.chip, { backgroundColor: q.color + '15', borderColor: q.color }]}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{q.icon}</Text>
            <Text style={[styles.chipText, { color: q.color }]} numberOfLines={1}>
              {q.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    color: colors.darkGray,
    paddingHorizontal: 12,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    minWidth: 110,
  },
  icon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

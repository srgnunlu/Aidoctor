import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Checkbox, Text, Chip } from 'react-native-paper';
import colors from '../constants/colors';

export default function ChecklistItem({ 
  item, 
  type = 'test',
  onToggle,
  completed = false 
}) {
  const [checked, setChecked] = useState(completed);

  useEffect(() => {
    setChecked(completed);
  }, [completed]);

  const handleToggle = () => {
    const newState = !checked;
    setChecked(newState);
    if (onToggle) {
      onToggle(item, newState);
    }
  };

  const getPriorityColor = (priority) => {
    if (type === 'intervention') {
      switch (priority) {
        case 'IMMEDIATE': return colors.error;
        case 'URGENT': return '#FF6B6B';
        case 'ROUTINE': return colors.info;
        default: return colors.gray;
      }
    }
    
    switch (priority) {
      case 'URGENT': return colors.error;
      case 'HIGH': return colors.warning;
      case 'MEDIUM': return colors.info;
      case 'LOW': return colors.success;
      default: return colors.gray;
    }
  };

  const renderTestItem = () => (
    <>
      <View style={styles.itemHeader}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={handleToggle}
            color={colors.primary}
          />
          <Text 
            variant="titleSmall" 
            style={[
              styles.itemTitle,
              checked && styles.completedText
            ]}
          >
            {item.test}
          </Text>
        </View>
        <Chip
          compact
          mode="flat"
          style={[
            styles.priorityChip,
            { backgroundColor: getPriorityColor(item.oncelik) + '20' }
          ]}
          textStyle={[
            styles.priorityText,
            { color: getPriorityColor(item.oncelik) }
          ]}
        >
          {item.oncelik}
        </Chip>
      </View>
      {item.neden && (
        <Text 
          variant="bodySmall" 
          style={[
            styles.reasonText,
            checked && styles.completedText
          ]}
        >
          {item.neden}
        </Text>
      )}
    </>
  );

  const renderInterventionItem = () => (
    <>
      <View style={styles.itemHeader}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={handleToggle}
            color={colors.primary}
          />
          <Text 
            variant="titleSmall" 
            style={[
              styles.itemTitle,
              checked && styles.completedText
            ]}
          >
            {item.mudahale}
          </Text>
        </View>
        <Chip
          compact
          mode="flat"
          style={[
            styles.priorityChip,
            { backgroundColor: getPriorityColor(item.oncelik) + '20' }
          ]}
          textStyle={[
            styles.priorityText,
            { color: getPriorityColor(item.oncelik) }
          ]}
        >
          {item.oncelik}
        </Chip>
      </View>
      {item.aciklama && (
        <Text 
          variant="bodySmall" 
          style={[
            styles.reasonText,
            checked && styles.completedText
          ]}
        >
          {item.aciklama}
        </Text>
      )}
    </>
  );

  return (
    <Card style={[styles.card, checked && styles.completedCard]}>
      <Card.Content style={styles.content}>
        {type === 'test' ? renderTestItem() : renderInterventionItem()}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    elevation: 1,
    backgroundColor: colors.white,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: colors.lightGray + '40',
  },
  content: {
    paddingVertical: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    color: colors.darkGray,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray,
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
    marginLeft: 48,
  },
});

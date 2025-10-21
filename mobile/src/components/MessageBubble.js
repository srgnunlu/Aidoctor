import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import colors from '../constants/colors';

export default function MessageBubble({ message, isUser, onCopy, onDelete }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContent = (content) => {
    const lines = content.split('\n');
    const textColor = isUser ? colors.white : colors.darkGray;
    
    return lines.map((line, idx) => {
      if (line.startsWith('###')) {
        return (
          <Text key={idx} variant="titleSmall" style={[styles.heading3, { color: textColor }]}>
            {line.replace('###', '').trim()}
          </Text>
        );
      }
      if (line.startsWith('##')) {
        return (
          <Text key={idx} variant="titleMedium" style={[styles.heading2, { color: isUser ? colors.white : colors.primary }]}>
            {line.replace('##', '').trim()}
          </Text>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <Text key={idx} variant="bodyMedium" style={[styles.listItem, { color: textColor }]}>
            • {line.substring(2)}
          </Text>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <Text key={idx} variant="bodyMedium" style={[styles.numberedItem, { color: textColor }]}>
            {line}
          </Text>
        );
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Text key={idx} variant="bodyMedium" style={[styles.messageText, { color: textColor }]}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <Text key={i} style={styles.bold}>{part}</Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      }
      if (line.trim() === '') {
        return <View key={idx} style={styles.lineBreak} />;
      }
      return (
        <Text key={idx} variant="bodyMedium" style={[styles.messageText, { color: textColor }]}>
          {line}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <Avatar.Icon
          size={36}
          icon="robot"
          style={styles.aiAvatar}
          color={colors.white}
        />
      )}
      
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <View style={styles.content}>
          {formatContent(message.content)}
        </View>
        
        <View style={styles.footer}>
          <Text variant="bodySmall" style={[styles.time, isUser ? styles.userTime : styles.aiTime]}>
            {formatTime(message.createdAt)}
          </Text>
          
          {!isUser && onCopy && (
            <IconButton
              icon="content-copy"
              size={14}
              iconColor={colors.gray}
              onPress={() => onCopy(message.content)}
              style={styles.actionButton}
            />
          )}
        </View>
      </View>

      {isUser && (
        <Avatar.Icon
          size={36}
          icon="account"
          style={styles.userAvatar}
          color={colors.white}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  aiBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  content: {
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
    marginBottom: 4,
  },
  heading2: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 6,
  },
  heading3: {
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  listItem: {
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 20,
  },
  numberedItem: {
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  lineBreak: {
    height: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
  },
  userTime: {
    color: colors.white + 'CC',
  },
  aiTime: {
    color: colors.gray,
  },
  actionButton: {
    margin: 0,
    marginRight: -8,
  },
  aiAvatar: {
    backgroundColor: colors.secondary,
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
});

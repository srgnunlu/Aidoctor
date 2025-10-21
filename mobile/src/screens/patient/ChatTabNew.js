import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, FAB, Portal, Dialog, Button, Text, Snackbar } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, clearChatHistory, clearError, setRealtimeMessages } from '../../store/slices/chatSlice';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import MessageBubble from '../../components/MessageBubble';
import TypingIndicator from '../../components/TypingIndicator';
import QuickQuestions from '../../components/QuickQuestions';
import colors from '../../constants/colors';

export default function ChatTabNew({ patientId }) {
  const dispatch = useDispatch();
  const { messages, sending, error } = useSelector((state) => state.chat);
  const [inputMessage, setInputMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!patientId) return;

    const chatRef = collection(db, 'patients', patientId, 'chatMessages');
    const q = query(chatRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() 
            ? doc.data().createdAt.toDate().toISOString() 
            : doc.data().createdAt
        }));
        dispatch(setRealtimeMessages(messagesData));
      },
      (error) => {
        console.error('Real-time chat error:', error);
      }
    );

    return () => unsubscribe();
  }, [dispatch, patientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    const result = await dispatch(sendChatMessage({ patientId, message }));
    if (result.type === 'chat/sendChatMessage/fulfilled') {
      scrollToBottom();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleCopyMessage = async (content) => {
    await Clipboard.setStringAsync(content);
    showSnackbar('Mesaj kopyalandı');
  };

  const handleClearChat = async () => {
    setClearDialogVisible(false);
    const result = await dispatch(clearChatHistory(patientId));
    if (result.type === 'chat/clearChatHistory/fulfilled') {
      showSnackbar('Chat geçmişi temizlendi');
    } else {
      showSnackbar('Temizleme başarısız oldu');
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
    setShowScrollButton(!isNearBottom);
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="displaySmall" style={styles.emptyIcon}>🤖</Text>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        AI Medikal Asistan
      </Text>
      <Text variant="bodyLarge" style={styles.emptyDescription}>
        Hasta hakkında sorularınızı sorun
      </Text>
      <Text variant="bodyMedium" style={styles.emptyHint}>
        • Vital bulgularını değerlendirin{'\n'}
        • Ayırıcı tanı isteyebilirsiniz{'\n'}
        • Lab sonuçlarını yorumlayın{'\n'}
        • Acil müdahale önerileri alın
      </Text>
    </View>
  );

  const content = (
    <View style={styles.container}>
      <QuickQuestions onSelectQuestion={handleQuickQuestion} />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || `msg-${index}-${message.createdAt}`}
              message={message}
              isUser={message.role === 'USER'}
              onCopy={handleCopyMessage}
            />
          ))
        )}
        {sending && <TypingIndicator />}
      </ScrollView>

      {showScrollButton && (
        <FAB
          icon="arrow-down"
          style={styles.scrollFab}
          small
          onPress={() => scrollToBottom()}
          color={colors.white}
        />
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            mode="outlined"
            placeholder="Mesajınızı yazın..."
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={handleSend}
            multiline
            maxLength={1000}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            right={
              <TextInput.Icon
                icon="send"
                onPress={handleSend}
                disabled={!inputMessage.trim() || sending}
                color={inputMessage.trim() && !sending ? colors.primary : colors.gray}
              />
            }
          />
          {messages.length > 0 && (
            <IconButton
              icon="delete-sweep"
              size={24}
              iconColor={colors.error}
              onPress={() => setClearDialogVisible(true)}
              style={styles.clearButton}
            />
          )}
        </View>
      </View>

      <Portal>
        <Dialog visible={clearDialogVisible} onDismiss={() => setClearDialogVisible(false)}>
          <Dialog.Title>Chat Geçmişini Temizle</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tüm chat geçmişi silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDialogVisible(false)}>İptal</Button>
            <Button onPress={handleClearChat} textColor={colors.error}>
              Temizle
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 20}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.darkGray,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.gray,
    textAlign: 'left',
    lineHeight: 24,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    maxHeight: 120,
  },
  inputOutline: {
    borderRadius: 24,
    borderWidth: 2,
  },
  clearButton: {
    marginBottom: 4,
  },
  scrollFab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: colors.primary,
  },
  snackbar: {
    backgroundColor: colors.success,
  },
});

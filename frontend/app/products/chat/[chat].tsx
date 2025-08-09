import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  type?: string; // Added to distinguish between 'message' and 'system'
  sender?: string; // Added to store sender role (user or owner)
  timestamp?: string; // Added to store timestamp
}

interface ChatScreenProps {
  productName?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = () => {
  const [message, setMessage] = useState('');
  const { productName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Replace with your server URL (e.g., 'http://your-server:3000' for production)
    const socket = io('http://localhost:3000', {
      query: {
        productId: productName, // Using productName as productId
        role: 'user', // Hardcoded as 'user'; modify as needed
      },
    });
    socketRef.current = socket;

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Error: ${error.message}`,
          isUser: false,
          type: 'system',
        },
      ]);
    });

    // Handle system messages (e.g., "User joined")
    socket.on('system', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.message,
          isUser: false,
          type: 'system',
          timestamp: data.timestamp,
        },
      ]);
    });

    // Handle incoming messages
    socket.on('message', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.text,
          isUser: data.sender === 'user', // Mark as user if sender is 'user'
          type: 'message',
          sender: data.sender,
          timestamp: data.timestamp,
        },
      ]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [productName]);

  // Send a message
  const handleSend = () => {
    if (message.trim() && socketRef.current) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        type: 'message',
      };

      // Emit message to the server
      socketRef.current.emit('message', { text: message.trim() });
      setMessages((prev) => [...prev, newMessage]);
      setMessage('');

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Render message or system notification
  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'system'
          ? styles.systemMessage
          : item.isUser
          ? styles.userMessage
          : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.type === 'system'
            ? styles.systemMessageText
            : item.isUser
            ? styles.userMessageText
            : styles.aiMessageText,
        ]}
      >
        {item.type === 'system' ? item.text : `${item.sender}: ${item.text}`}
      </Text>
      {item.timestamp && (
        <Text style={styles.timestampText}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{productName}</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  message.trim()
                    ? styles.sendButtonActive
                    : styles.sendButtonInactive,
                ]}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={message.trim() ? '#fff' : '#999'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 40
  },
  keyboardAvoidingView: {
    flex: 1,
    marginTop: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerPlaceholder: {
    width: 40,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#000',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  systemMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#000',
  },
  systemMessageText: {
    color: '#555',
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#000',
  },
  sendButtonInactive: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default ChatScreen;
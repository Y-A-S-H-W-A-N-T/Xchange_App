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
import * as SecureStore from 'expo-secure-store';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  type: string; // 'message' or 'system'
  sender?: string; // Tracks sender (productOwner or userNumber)
}

interface ChatScreenProps {
  productName?: string;
}

const colors = {
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#999999',
  black: '#000000',
  green: '#28A745',
  red: '#DC3545',
};

const ChatScreen: React.FC<ChatScreenProps> = () => {
  const [currentUser, setCurrentUser] = useState<string>("");
  
    const fetchUserNumber = async () => {
      const val: any = await SecureStore.getItemAsync("user_phone");
      setCurrentUser(val);
    };
  
    useEffect(() => {
      fetchUserNumber();
    }, []);

  const [message, setMessage] = useState('');
  const { productName, productID, productOwner, userNumber } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Validate productID
    if (!productID || typeof productID !== 'string') {
      console.error('Invalid productID:', productID);
      setConnectionStatus('Invalid product ID');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Error: Invalid product ID',
          isUser: false,
          type: 'system',
        },
      ]);
      return;
    }

    // Use emulator-specific URL
    const serverUrl = Platform.OS === 'android' ? process.env.EXPO_PUBLIC_BACKEND_URL : process.env.EXPO_PUBLIC_BACKEND_URL;
    console.log('Connecting to:', serverUrl, 'with chatSpace:', `${productID}-${productOwner}-${userNumber}`);

    const socket = io(serverUrl, {
      query: {
        chatSpace: `${productID}-${productOwner}-${userNumber}`,
        productName: productName,
        sender: productOwner === userNumber ? 'Owner' : 'Customer',
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    console.log('Initial socket.connected:', socket.connected);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.connected);
      setConnectionStatus('Connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message, error);
      setConnectionStatus(`Connection failed: ${error.message}`);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `Connection error: ${error.message}`,
          isUser: false,
          type: 'system',
        },
      ]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

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
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socket.on('pastMessages', (pastMessages: { text: string; sender: string }[]) => {
      console.log('Received past messages:', pastMessages);
      setMessages((prev) => [
        ...prev,
        ...pastMessages.map((msg, index) => ({
          id: `past-${index}-${Date.now()}`,
          text: msg.text,
          isUser: msg.sender === userNumber,
          type: 'message',
          sender: msg.sender,
        })),
      ]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socket.on('message', (data) => {
      console.log('Received message:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.text,
          isUser: data.sender === userNumber,
          type: 'message',
          sender: data.sender,
        },
      ]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socket.on('system', (data) => {
      console.log('Received system message:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.message,
          isUser: false,
          type: 'system',
        },
      ]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus(`Disconnected: ${reason}`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [productID, productOwner, userNumber]);

  const handleSend = () => {
    if (message.trim() && socketRef.current) {
      const text = message.trim();
      const sender = productOwner === currentUser ? productOwner : userNumber;
      socketRef.current.emit('message', { text, sender });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          isUser: true,
          type: 'message',
          sender,
        },
      ]);
      setMessage('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'system'
          ? styles.systemMessage
          : item.sender === currentUser
          ? styles.userMessage
          : styles.ownerMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.type === 'system'
            ? styles.systemMessageText
            : item.sender === currentUser
            ? styles.userMessageText
            : styles.ownerMessageText,
        ]}
      >
        {/* VirtualizedList: You have a large list that is slow to update - make sure your renderItem function renders components that follow React performance best practices like PureComponent, shouldComponentUpdate, etc. {"contentLength": 7933.71435546875, "dt": 3505, "prevDt": 1970} */}
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{productName || 'Chat'}</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.connectionStatus}>
            <Text
              style={[
                styles.connectionStatusText,
                connectionStatus === 'Connected' ? styles.connected : styles.disconnected,
              ]}
            >
              {connectionStatus}
            </Text>
          </View>
          <View>
              <Text>Make Deal</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.darkGray}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  message.trim() ? styles.sendButtonActive : styles.sendButtonInactive,
                ]}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={message.trim() ? colors.white : colors.darkGray}
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
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  headerPlaceholder: {
    width: 40,
  },
  connectionStatus: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  connectionStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  connected: {
    color: colors.green,
  },
  disconnected: {
    color: colors.red,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: colors.black,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  ownerMessage: {
    backgroundColor: colors.mediumGray,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  systemMessage: {
    backgroundColor: colors.lightGray,
    alignSelf: 'center',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  ownerMessageText: {
    color: colors.black,
  },
  systemMessageText: {
    color: colors.darkGray,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.black,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.black,
  },
  sendButtonInactive: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
});

export default ChatScreen;
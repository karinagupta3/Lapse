import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Keyboard, Modal, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { GradientBackground } from '../components/GradientBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callChatGPT } from '../utils/chatgpt';
import { WelcomeWidget } from '../components/WelcomeWidget';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useScheduleStore } from '../data/scheduleStore';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledPressable = styled(Pressable);
const AnimatedStyledView = styled(Animated.View);

type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export const ChatbotScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [lastContext, setLastContext] = useState<string>(''); // Store last context for follow-up questions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to bottom when messages change or when keyboard appears
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    scrollToBottom();

    // Add keyboard listeners
    const keyboardDidShowListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', () => {
          setKeyboardVisible(true);
          scrollToBottom();
        })
      : Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
          scrollToBottom();
        });

    const keyboardDidHideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Create a new user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to the list
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get schedule information for context-aware responses
      const { events, findAvailableTimeSlot } = useScheduleStore.getState();
      
      // Format schedule information
      let scheduleInfo = '';
      
      // Only proceed with valid events
      const validEvents = events.filter(e => e.startTime && e.endTime);
      
      // Count meetings
      const meetingCount = validEvents.filter(e => e.type === 'meeting').length;
      scheduleInfo += `meeting count: ${meetingCount}|`;
      
      // Get busy times
      const busyTimes = validEvents
        .map(e => `${formatTime(e.startTime)}-${formatTime(e.endTime)}`)
        .join(', ');
      scheduleInfo += `busy times: ${busyTimes || 'none'}|`;
      
      // Generate schedule summary
      const summary = validEvents
        .map(e => `${e.title} (${formatTime(e.startTime)}-${formatTime(e.endTime)})`)
        .join(', ');
      scheduleInfo += `schedule summary: ${summary || 'No events scheduled'}|`;
      
      // Add previous context for follow-up questions
      if (lastContext) {
        scheduleInfo += `previous_context: ${lastContext}|`;
      }
      
      // Check if this is a follow-up question
      const isFollowUp = messages.length > 0 && 
        (input.toLowerCase().includes('what about') || 
         input.toLowerCase().includes('how about') || 
         input.toLowerCase().includes('and if') || 
         input.toLowerCase().includes('but if') ||
         input.toLowerCase().includes('instead'));
      
      if (isFollowUp) {
        scheduleInfo += `is_follow_up: true|`;
        // Get the last user and AI messages for context
        const prevUserMessages = messages.filter(m => m.sender === 'user');
        const prevAIMessages = messages.filter(m => m.sender === 'ai');
        
        if (prevUserMessages.length > 0) {
          const lastUserMessage = prevUserMessages[prevUserMessages.length - 1].text;
          scheduleInfo += `last_user_message: ${lastUserMessage}|`;
        }
        
        if (prevAIMessages.length > 0) {
          const lastAIMessage = prevAIMessages[prevAIMessages.length - 1].text;
          scheduleInfo += `last_ai_message: ${lastAIMessage}|`;
        }
      }
      
      // Find available gym slot if user is asking about gym
      if (input.toLowerCase().includes('gym') || input.toLowerCase().includes('workout') || input.toLowerCase().includes('exercise')) {
        try {
          const gymSlot = findAvailableTimeSlot(60, 'gym');
          if (gymSlot && gymSlot.startTime && gymSlot.endTime) {
            scheduleInfo += `gym slot available: ${formatTime(gymSlot.startTime)}-${formatTime(gymSlot.endTime)}|`;
          }
        } catch (error) {
          console.error('Error finding gym slot:', error);
        }
      }
      
      // Find available work/study slot if user is asking about work or study
      if (input.toLowerCase().includes('work') || input.toLowerCase().includes('focus') || 
          input.toLowerCase().includes('study') || input.toLowerCase().includes('homework')) {
        try {
          const workSlot = findAvailableTimeSlot(90, 'work');
          if (workSlot && workSlot.startTime && workSlot.endTime) {
            scheduleInfo += `work slot available: ${formatTime(workSlot.startTime)}-${formatTime(workSlot.endTime)}|`;
          }
        } catch (error) {
          console.error('Error finding work slot:', error);
        }
      }
      
      // Store this context for future follow-up questions
      setLastContext(input.toLowerCase());
      
      // Get AI response with schedule context
      const response = await callChatGPT(input, scheduleInfo);
      
      // Create AI message
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      // Add AI message to the list
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble processing that. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setShowWelcome(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: MessageType) => {
    const isUser = message.sender === 'user';
    
    return (
      <StyledPressable 
        key={message.id} 
        className={`mb-4 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Future implementation: copy message text
        }}
      >
        {!isUser && (
          <StyledView className="flex-row items-center mb-1 ml-1">
            <StyledView className="w-6 h-6 rounded-full bg-[#6366F1]/80 items-center justify-center mr-2">
              <Ionicons name="chatbubble" size={12} color="white" />
            </StyledView>
            <StyledText className="text-white/70 text-xs">AI Assistant</StyledText>
          </StyledView>
        )}
        <StyledView 
          className={`rounded-2xl p-3 ${isUser ? 'bg-[#6366F1]' : 'bg-white/10'} ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <StyledText className="text-white text-base leading-6">
            {message.text}
          </StyledText>
        </StyledView>
        <StyledText 
          className={`text-white/50 text-xs mt-1 ${isUser ? 'text-right mr-1' : 'text-left ml-1'}`}
        >
          {formatTime(message.timestamp)}
        </StyledText>
      </StyledPressable>
    );
  };

  const clearConversation = () => {
    setMessages([]);
    setShowWelcome(true);
    fadeAnim.setValue(1);
    setShowClearModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <StyledView 
          className="flex-1" 
          style={{ 
            marginTop: 56 + insets.top, // Adjusted for new tab bar height
            paddingBottom: insets.bottom
          }}
        >
          {/* Header with title and clear button */}
          {messages.length > 0 && (
            <StyledView className="flex-row justify-between items-center px-4 py-2">
              <StyledText className="text-xl font-bold text-white">AI Assistant</StyledText>
              <StyledTouchableOpacity 
                onPress={() => setShowClearModal(true)}
                className="p-2 rounded-full bg-white/10"
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </StyledTouchableOpacity>
            </StyledView>
          )}
          <StyledScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4 py-2"
            contentContainerStyle={{ 
              flexGrow: messages.length === 0 && showWelcome ? 1 : 0,
              paddingBottom: 100 
            }}
            keyboardShouldPersistTaps="handled"
          >
            {showWelcome && messages.length === 0 ? (
              <AnimatedStyledView style={{ opacity: fadeAnim }}>
                <WelcomeWidget onSuggestionPress={handleSuggestionPress} />
                
                {/* Calendar Button */}
                <StyledTouchableOpacity 
                  className="bg-white/10 p-4 rounded-xl mb-4"
                  onPress={() => navigation.navigate('Calendar')}
                >
                  <StyledView className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={24} color="white" style={{ marginRight: 10 }} />
                    <StyledView className="flex-1">
                      <StyledText className="text-white font-semibold text-lg">
                        Today's Schedule
                      </StyledText>
                      <StyledText className="text-white/70">
                        View your planned activities for today
                      </StyledText>
                    </StyledView>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </StyledView>
                </StyledTouchableOpacity>
              </AnimatedStyledView>
            ) : (
              <StyledView className="flex-1 justify-end">
                {messages.map(renderMessage)}
              </StyledView>
            )}
          </StyledScrollView>

          <StyledView 
            className="absolute bottom-0 left-0 right-0 px-4 py-5"
            style={{
              bottom: 10, 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <StyledView className="flex-row items-end space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2">
              <StyledTextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about scheduling..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                className="flex-1 px-3 py-3 text-white min-h-[45px] max-h-[100px]"
                multiline
                textAlignVertical="center"
                onSubmitEditing={() => handleSendMessage()}
                returnKeyType="send"
              />
              <StyledTouchableOpacity
                onPress={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className={`p-3 rounded-full ${isLoading || !input.trim() ? 'bg-white/20' : 'bg-[#6366F1]'}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </KeyboardAvoidingView>
      <Modal
        visible={showClearModal}
        transparent
        onRequestClose={() => setShowClearModal(false)}
      >
        <StyledView className="flex-1 justify-center items-center bg-black/50">
          <StyledView className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-80">
            <StyledText className="text-white text-lg font-bold mb-2">Clear Conversation</StyledText>
            <StyledText className="text-white/70 text-base mb-4">Are you sure you want to clear the conversation?</StyledText>
            <StyledView className="flex-row justify-end space-x-2">
              <StyledTouchableOpacity 
                onPress={() => setShowClearModal(false)}
                className="bg-white/20 p-3 rounded-full"
              >
                <StyledText className="text-white">Cancel</StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity 
                onPress={clearConversation}
                className="bg-[#6366F1] p-3 rounded-full"
              >
                <StyledText className="text-white">Clear</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>
    </GradientBackground>
  );
};

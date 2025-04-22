import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface WelcomeWidgetProps {
  onSuggestionPress?: (suggestion: string) => void;
}

export const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({ onSuggestionPress }) => (
  <StyledView className="bg-white/5 rounded-2xl p-6 mb-4 shadow-lg" style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }}>
    <StyledView className="flex-row items-center mb-6">
      <StyledView className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] items-center justify-center mr-4">
        <Ionicons name="chatbubble" size={24} color="white" />
      </StyledView>
      <StyledView>
        <StyledText className="text-3xl font-bold text-white">
          AI Assistant
        </StyledText>
        <StyledText className="text-white/70 text-base">
          Let me help optimize your day
        </StyledText>
      </StyledView>
    </StyledView>
    
    <StyledText className="text-white text-lg mb-4">
      I can help you with:
    </StyledText>
    <StyledView className="space-y-3 mb-5">
      {[
        {icon: "time-outline", text: "Finding the best time slots for activities"},
        {icon: "calendar-outline", text: "Planning your day around energy levels"},
        {icon: "repeat-outline", text: "Creating consistent routines"},
        {icon: "analytics-outline", text: "Optimizing your productivity"},
      ].map((item, index) => (
        <StyledView key={index} className="flex-row items-center">
          <StyledView className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1]/50 to-[#8B5CF6]/50 items-center justify-center mr-3">
            <Ionicons name={item.icon} size={14} color="white" />
          </StyledView>
          <StyledText className="text-white/90 text-base">{item.text}</StyledText>
        </StyledView>
      ))}
    </StyledView>
    
    <StyledText className="text-white/80 text-base mb-3 font-medium">
      Try asking:
    </StyledText>
    <StyledView className="space-y-3">
      {[
        "When is the best time for gym workouts?",
        "How can I be more productive at work?",
        "What's a good schedule for taking breaks?",
        "How much sleep should I get?",
      ].map((suggestion, index) => (
        <StyledTouchableOpacity
          key={index}
          className="bg-white/10 p-3 rounded-xl active:bg-white/15"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => onSuggestionPress?.(suggestion)}
        >
          <StyledView className="flex-row items-center">
            <Ionicons name="help-circle-outline" size={16} color="rgba(255, 255, 255, 0.6)" style={{ marginRight: 8 }} />
            <StyledText className="text-white/80 flex-1">{suggestion}</StyledText>
          </StyledView>
        </StyledTouchableOpacity>
      ))}
    </StyledView>
  </StyledView>
);

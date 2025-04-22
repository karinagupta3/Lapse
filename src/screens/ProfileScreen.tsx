import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { styled } from 'nativewind';
import { GradientBackground } from '../components/GradientBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfileStore } from '../data/userProfileStore';
import * as Haptics from 'expo-haptics';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { name, setName } = useUserProfileStore();
  const [userName, setUserName] = useState(name);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (userName.trim()) {
      setName(userName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <GradientBackground>
        <StyledView
          className="flex-1 px-4"
          style={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          {/* Header */}
          <StyledView className="flex-row items-center mb-8">
            <StyledTouchableOpacity 
              className="p-2" 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </StyledTouchableOpacity>
            <StyledText className="text-white text-2xl font-bold ml-2">
              Profile Settings
            </StyledText>
          </StyledView>

          {/* Profile Form */}
          <StyledView className="bg-white/10 rounded-xl p-6 mb-6">
            <StyledText className="text-white text-lg mb-2">Your Name</StyledText>
            <StyledTextInput
              className="bg-white/10 text-white p-4 rounded-lg mb-4"
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            
            <StyledTouchableOpacity
              className="bg-[#6366F1] py-3 rounded-lg items-center"
              onPress={handleSave}
            >
              <StyledText className="text-white font-bold text-lg">
                {isSaved ? 'Saved!' : 'Save'}
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>

          <StyledText className="text-white/60 text-center">
            Your name will be used to personalize your experience
          </StyledText>
        </StyledView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
};

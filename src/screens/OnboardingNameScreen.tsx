import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { GradientBackground } from '../components/GradientBackground';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingName'>;

export const OnboardingNameScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      navigation.navigate('OnboardingPreference', { name: name.trim() });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledSafeAreaView className="flex-1">
          <StyledView className="flex-1 px-6 py-8">
            <StyledText className="text-5xl font-bold text-white mb-4">
              Welcome to Lapse
            </StyledText>
            
            <StyledText className="text-xl text-white/80 mb-12">
              Let's start by getting to know you better.
            </StyledText>

            <StyledView className="mb-8">
              <StyledText className="text-white/90 text-lg mb-2">
                What's your name?
              </StyledText>

              <StyledTextInput
                className="bg-white/10 rounded-xl px-4 py-3 text-white text-lg"
                placeholder="Enter your name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={name}
                onChangeText={setName}
                onSubmitEditing={handleContinue}
                returnKeyType="next"
                autoFocus
              />
            </StyledView>

            <StyledView className="flex-1 justify-end">
              <StyledTouchableOpacity
                className={`w-full py-4 rounded-2xl ${
                  name.trim() ? 'bg-white/90' : 'bg-white/30'
                } shadow-lg`}
                onPress={handleContinue}
                disabled={!name.trim()}
              >
                <StyledText
                  className={`text-center text-lg font-semibold ${
                    name.trim() ? 'text-[#6366F1]' : 'text-white/50'
                  }`}
                >
                  Continue
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledSafeAreaView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

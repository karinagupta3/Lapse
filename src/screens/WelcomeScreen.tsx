import React from 'react';
import { StyledView, StyledText, StyledTouchableOpacity } from '../components/styled';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      className="flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StyledView className="flex-1 justify-between p-6">
        <StyledView className="flex-1 justify-center items-center">
          <StyledText className="text-4xl font-bold text-white mb-2">
            Welcome back
          </StyledText>
          <StyledText className="text-lg text-white/70 text-center mb-8">
            Let's continue working on your goals
          </StyledText>

          <StyledView className="w-full space-y-4">
            <StyledTouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              className="bg-[#6366F1] rounded-xl p-4 w-full"
            >
              <StyledText className="text-white text-center font-semibold text-lg">
                View Today's Tasks
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
              className="bg-white/10 rounded-xl p-4 w-full"
            >
              <StyledText className="text-white text-center font-semibold text-lg">
                Chat with AI Assistant
              </StyledText>
            </StyledTouchableOpacity>

            <StyledView className="bg-white/5 rounded-xl p-6 mt-6">
              <StyledText className="text-white font-semibold text-lg mb-2">
                Quick Stats
              </StyledText>
              <StyledView className="flex-row justify-between">
                <StyledView>
                  <StyledText className="text-white/70">Tasks Completed</StyledText>
                  <StyledText className="text-white text-2xl font-bold">12</StyledText>
                </StyledView>
                <StyledView>
                  <StyledText className="text-white/70">Points Earned</StyledText>
                  <StyledText className="text-white text-2xl font-bold">240</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </LinearGradient>
  );
}

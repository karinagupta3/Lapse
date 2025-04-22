

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { GradientBackground } from '../components/GradientBackground';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <GradientBackground>
      <StyledSafeAreaView className="flex-1">
        <StyledView className="flex-1 px-6 py-8">
          <StyledView className="flex-1 justify-center items-center">
            <StyledText className="text-7xl font-bold text-white mb-4">
              Lapse
            </StyledText>
            <StyledView className="mb-12">
              <StyledText className="text-2xl text-white/90 font-medium text-center">
                Your day,
              </StyledText>
              <StyledText className="text-2xl text-white/90 font-medium text-center">
                redesigned
              </StyledText>
              <StyledText className="text-2xl text-white/90 font-medium text-center">
                daily.
              </StyledText>
            </StyledView>
            
            <StyledTouchableOpacity
              onPress={() => navigation.navigate('OnboardingName')}
              className="bg-white/90 w-full py-4 rounded-2xl mb-4"
            >
              <StyledText className="text-center text-[#6366F1] font-semibold text-lg">
                Get Started
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => setShowLearnMore(true)}
              className="bg-white/10 w-full py-4 rounded-2xl"
            >
              <StyledText className="text-center text-white font-semibold text-lg">
                Learn More
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        <Modal
          visible={showLearnMore}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLearnMore(false)}
        >
          <StyledView className="flex-1 justify-end">
            <StyledView className="bg-[#1F2937] rounded-t-3xl">
              <StyledScrollView className="px-6 pt-6 pb-8">
                <StyledText className="text-3xl font-bold text-white mb-6">
                  About Lapse
                </StyledText>
                
                <StyledText className="text-lg text-white/90 mb-6">
                  Lapse is your intelligent time management companion, designed specifically for neurodivergent minds. Our app helps you:
                </StyledText>

                <StyledView className="mb-6">
                  <StyledText className="text-lg font-semibold text-white mb-2">
                    🎯 Smart Scheduling
                  </StyledText>
                  <StyledText className="text-white/80">
                    Get personalized schedule suggestions based on your energy levels and focus patterns.
                  </StyledText>
                </StyledView>

                <StyledView className="mb-6">
                  <StyledText className="text-lg font-semibold text-white mb-2">
                    🤖 AI Assistant
                  </StyledText>
                  <StyledText className="text-white/80">
                    Chat with our AI to get help with task planning, time management, and productivity tips.
                  </StyledText>
                </StyledView>

                <StyledView className="mb-6">
                  <StyledText className="text-lg font-semibold text-white mb-2">
                    🎮 Gamified Progress
                  </StyledText>
                  <StyledText className="text-white/80">
                    Track your achievements and earn points as you build better habits.
                  </StyledText>
                </StyledView>

                <StyledView className="mb-8">
                  <StyledText className="text-lg font-semibold text-white mb-2">
                    📊 Visual Planning
                  </StyledText>
                  <StyledText className="text-white/80">
                    See your schedule and tasks in a clear, visual format that makes sense for you.
                  </StyledText>
                </StyledView>

                <StyledTouchableOpacity
                  onPress={() => setShowLearnMore(false)}
                  className="bg-[#6366F1] py-4 rounded-xl"
                >
                  <StyledText className="text-white text-center font-semibold text-lg">
                    Got It
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledScrollView>
            </StyledView>
          </StyledView>
        </Modal>
      </StyledSafeAreaView>
    </GradientBackground>
  );
};

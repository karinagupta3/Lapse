import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { GradientBackground } from '../components/GradientBackground';
import { styled } from 'nativewind';
import { DEFAULT_TASKS } from '../types/tasks';
import { addTasksToCalendar } from '../utils/calendar';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingPreference'>;
type RoutePropType = RouteProp<RootStackParamList, 'OnboardingPreference'>;

interface Diagnosis {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
}

const diagnoses: Diagnosis[] = [
  {
    id: 'adhd',
    name: 'ADHD',
    description: 'Attention Deficit Hyperactivity Disorder',
    isAvailable: true,
  },
  {
    id: 'autism',
    name: 'Autism',
    description: 'Autism Spectrum Disorder',
    isAvailable: false,
  },
  {
    id: 'dyslexia',
    name: 'Dyslexia',
    description: 'Reading and Learning Disorder',
    isAvailable: false,
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    description: 'Generalized Anxiety Disorder',
    isAvailable: false,
  },
];

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  isSelected: boolean;
  onSelect: () => void;
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnosis,
  isSelected,
  onSelect,
}) => (
  <StyledTouchableOpacity
    onPress={diagnosis.isAvailable ? onSelect : undefined}
    className={`mb-4 p-6 rounded-2xl ${
      !diagnosis.isAvailable
        ? 'bg-white/5'
        : isSelected
        ? 'bg-[#6366F1]/90'
        : 'bg-white/10'
    }`}
  >
    <StyledView className="flex-row justify-between items-start">
      <StyledView className="flex-1">
        <StyledText
          className={`text-2xl font-bold mb-2 ${
            isSelected ? 'text-white' : 'text-white/90'
          }`}
        >
          {diagnosis.name}
        </StyledText>
        <StyledText
          className={`text-base ${
            isSelected ? 'text-white/90' : 'text-white/70'
          }`}
        >
          {diagnosis.description}
        </StyledText>
      </StyledView>
      {!diagnosis.isAvailable && (
        <StyledView className="bg-white/10 px-3 py-1 rounded-full">
          <StyledText className="text-white/70 text-sm">Coming Soon</StyledText>
        </StyledView>
      )}
    </StyledView>
  </StyledTouchableOpacity>
);

export const OnboardingPreferenceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);
  const { name } = route.params;

  const handleContinue = async () => {
    if (selectedDiagnosis) {
      navigation.navigate('OnboardingCalendar', {
        name,
        preference: selectedDiagnosis,
      });
    }
  };

  return (
    <GradientBackground>
      <StyledSafeAreaView className="flex-1">
        <StyledView className="flex-1 px-6 py-8">
          <StyledTouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-6"
          >
            <StyledText className="text-white/90 text-lg">← Back</StyledText>
          </StyledTouchableOpacity>

          <StyledText className="text-5xl font-bold text-white mb-4">
            Hi {name}!
          </StyledText>

          <StyledText className="text-xl text-white/80 mb-8">
            Select your neurodivergent diagnosis to
            help us personalize your experience.
          </StyledText>

          {diagnoses.map(diagnosis => (
            <DiagnosisCard
              key={diagnosis.id}
              diagnosis={diagnosis}
              isSelected={selectedDiagnosis === diagnosis.id}
              onSelect={() => setSelectedDiagnosis(diagnosis.id)}
            />
          ))}

          <StyledView className="flex-1 justify-end">
            <StyledTouchableOpacity
              className={`w-full py-4 rounded-2xl ${
                selectedDiagnosis ? 'bg-white/90' : 'bg-white/30'
              }`}
              onPress={handleContinue}
              disabled={!selectedDiagnosis}
            >
              <StyledText
                className={`text-center text-lg font-semibold ${
                  selectedDiagnosis ? 'text-[#6366F1]' : 'text-white/50'
                }`}
              >
                Continue
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledSafeAreaView>
    </GradientBackground>
  );
};

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { GradientBackground } from '../components/GradientBackground';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingCalendar'>;
type RoutePropType = RouteProp<RootStackParamList, 'OnboardingCalendar'>;

// Time block data
const defaultTimeBlocks = [
  { id: 'morning', label: 'Morning (6 AM - 12 PM)', startTime: '06:00', endTime: '12:00' },
  { id: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', startTime: '12:00', endTime: '17:00' },
  { id: 'evening', label: 'Evening (5 PM - 10 PM)', startTime: '17:00', endTime: '22:00' },
];

interface TimeBlockCardProps {
  block: typeof defaultTimeBlocks[0];
  isSelected: boolean;
  onSelect: () => void;
}

const TimeBlockCard: React.FC<TimeBlockCardProps> = ({ block, isSelected, onSelect }) => (
  <StyledTouchableOpacity
    onPress={onSelect}
    className={`mb-4 p-4 rounded-xl ${
      isSelected ? 'bg-white/90' : 'bg-white/10'
    }`}
  >
    <StyledText className={`text-lg ${
      isSelected ? 'text-[#6366F1]' : 'text-white'
    }`}>
      {block.label}
    </StyledText>
  </StyledTouchableOpacity>
);

export const OnboardingCalendarScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [isConnecting, setIsConnecting] = useState(false);
  const { name, preference } = route.params;

  const toggleTimeBlock = (blockId: string) => {
    setSelectedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const handleGoogleCalendarConnect = async () => {
    setIsConnecting(true);
    // Simulate connecting to Google Calendar
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { initialTab: 'Calendar' } }],
      });
    }, 2000);
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
            Set Your Schedule
          </StyledText>
          
          <StyledText className="text-xl text-white/80 mb-8">
            Choose your preferred time blocks for tasks. You can select multiple blocks that work best for you.
          </StyledText>

          {defaultTimeBlocks.map(block => (
            <TimeBlockCard
              key={block.id}
              block={block}
              isSelected={selectedBlocks.has(block.id)}
              onSelect={() => toggleTimeBlock(block.id)}
            />
          ))}

          <StyledView className="flex-1 justify-end">
            <StyledTouchableOpacity
              className={`w-full py-4 rounded-2xl ${
                selectedBlocks.size > 0 ? 'bg-white/90' : 'bg-white/30'
              } shadow-lg`}
              onPress={handleGoogleCalendarConnect}
              disabled={selectedBlocks.size === 0 || isConnecting}
            >
              {isConnecting ? (
                <StyledView className="flex-row items-center justify-center">
                  <ActivityIndicator color="#6366F1" />
                  <StyledText className="text-[#6366F1] ml-2 text-lg font-semibold">
                    Connecting...
                  </StyledText>
                </StyledView>
              ) : (
                <StyledText className={`text-center text-lg font-semibold ${
                  selectedBlocks.size > 0 ? 'text-[#6366F1]' : 'text-white/50'
                }`}>
                  Connect Google Calendar
                </StyledText>
              )}
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledSafeAreaView>
    </GradientBackground>
  );
};

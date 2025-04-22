import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { GradientBackground } from '../components/GradientBackground';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface TimeBlock {
  id: string;
  time: string;
  title: string;
  duration: string;
  type: 'focus' | 'break' | 'flexible';
  icon: string;
}

const getCurrentDate = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const now = new Date();
  const day = days[now.getDay()];
  const month = months[now.getMonth()];
  const date = now.getDate();
  
  return `${day}, ${month} ${date}`;
};

const todaysSchedule: TimeBlock[] = [
  {
    id: '1',
    time: '9:00 AM',
    title: 'Morning Exercise',
    duration: '45 min',
    type: 'break',
    icon: 'fitness'
  },
  {
    id: '2',
    time: '10:00 AM',
    title: 'Focused Work Block',
    duration: '90 min',
    type: 'focus',
    icon: 'code-working'
  },
  {
    id: '3',
    time: '12:00 PM',
    title: 'Lunch Break',
    duration: '60 min',
    type: 'break',
    icon: 'restaurant'
  },
  {
    id: '4',
    time: '1:30 PM',
    title: 'Mindful Break',
    duration: '15 min',
    type: 'break',
    icon: 'leaf'
  },
  {
    id: '5',
    time: '2:00 PM',
    title: 'Team Meeting',
    duration: '45 min',
    type: 'flexible',
    icon: 'people'
  },
  {
    id: '6',
    time: '3:00 PM',
    title: 'Deep Work Session',
    duration: '90 min',
    type: 'focus',
    icon: 'bulb'
  },
  {
    id: '7',
    time: '4:45 PM',
    title: 'Task Review',
    duration: '30 min',
    type: 'flexible',
    icon: 'checkmark-circle'
  },
];

const getTypeColor = (type: TimeBlock['type']) => {
  switch (type) {
    case 'focus':
      return 'bg-[#6366F1]';
    case 'break':
      return 'bg-[#34D399]';
    case 'flexible':
      return 'bg-[#F472B6]';
    default:
      return 'bg-gray-400';
  }
};

const getTypeColorValue = (type: TimeBlock['type']) => {
  switch (type) {
    case 'focus':
      return '#6366F1';
    case 'break':
      return '#34D399';
    case 'flexible':
      return '#F472B6';
    default:
      return '#9CA3AF';
  }
};

const TaskItem = ({ item, index }: { item: TimeBlock; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <StyledView className="bg-white/10 rounded-xl p-4 mb-4">
        <StyledView className="flex-row justify-between items-center">
          <StyledView className="flex-row items-center flex-1">
            <StyledView
              className={`w-10 h-10 rounded-full mr-4 items-center justify-center ${getTypeColor(item.type)}`}
            >
              <Ionicons name={item.icon as any} size={20} color="white" />
            </StyledView>
            
            <StyledView className="flex-1">
              <StyledText className="text-white font-semibold text-lg">
                {item.title}
              </StyledText>
              <StyledView className="flex-row items-center">
                <StyledText className="text-white/70 mr-2">
                  {item.time}
                </StyledText>
                <StyledView className="w-1 h-1 rounded-full bg-white/30 mr-2" />
                <StyledText className="text-white/70">
                  {item.duration}
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          <StyledTouchableOpacity
            className={`px-3 py-1 rounded-lg ml-2`}
            style={{ backgroundColor: `${getTypeColorValue(item.type)}30` }}
          >
            <StyledText style={{ color: getTypeColorValue(item.type) }} className="font-medium">
              Start
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </Animated.View>
  );
};

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <GradientBackground>
      <StyledSafeAreaView className="flex-1">
        <StyledView className="flex-1 px-6 py-4">
          <StyledView className="flex-row justify-between items-center mb-6">
            <StyledView>
              <StyledText className="text-3xl font-bold text-white">
                Today
              </StyledText>
              <StyledText className="text-white/70 text-base">
                {getCurrentDate()}
              </StyledText>
            </StyledView>
            
            <StyledView className="bg-white/10 rounded-full p-2">
              <Ionicons name="calendar-outline" size={24} color="white" />
            </StyledView>
          </StyledView>

          <StyledView className="bg-white/5 rounded-2xl p-5 mb-6">
            <StyledView className="flex-row justify-between items-center mb-3">
              <StyledText className="text-xl font-bold text-white">
                Current Progress
              </StyledText>
              
              <StyledView className="bg-[#6366F1]/20 px-3 py-1 rounded-full">
                <StyledText className="text-[#6366F1] font-medium">
                  3/7 Tasks
                </StyledText>
              </StyledView>
            </StyledView>
            
            <StyledView className="bg-white/10 h-2 rounded-full overflow-hidden">
              <StyledView className="bg-[#6366F1] h-full rounded-full" style={{ width: '42%' }} />
            </StyledView>
            
            <StyledView className="flex-row justify-between mt-3">
              <StyledText className="text-white/70">
                42% Complete
              </StyledText>
              <StyledText className="text-white/70">
                240 Points Earned
              </StyledText>
            </StyledView>
          </StyledView>

          <StyledText className="text-xl font-semibold text-white mb-4">
            Today's Schedule
          </StyledText>

          <StyledScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            {todaysSchedule.map((block, index) => (
              <TaskItem key={block.id} item={block} index={index} />
            ))}
            
            <StyledView className="h-4" />
          </StyledScrollView>

          <StyledTouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            className="bg-[#6366F1] py-4 rounded-xl mt-4"
          >
            <StyledText className="text-center text-white font-semibold text-lg">
              View Calendar
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledSafeAreaView>
    </GradientBackground>
  );
};

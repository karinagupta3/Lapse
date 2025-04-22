import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Achievement } from '../data/pointsData';

const StyledView = styled(View);
const StyledText = styled(Text);

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose?: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  if (!achievement) return null;
  
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
    
    // Slide out after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onClose) onClose();
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <StyledView className="flex-row items-center bg-[#6366F1] p-4 rounded-xl shadow-lg">
        <StyledView className="bg-white/20 p-2 rounded-full mr-3">
          <Ionicons name="trophy" size={24} color="#FFF" />
        </StyledView>
        <StyledView className="flex-1">
          <StyledText className="text-white text-xs font-bold mb-1">ACHIEVEMENT UNLOCKED</StyledText>
          <StyledText className="text-white text-lg font-bold">{achievement.title}</StyledText>
        </StyledView>
        <StyledView className="bg-white/20 px-3 py-1 rounded-full ml-2">
          <StyledText className="text-white font-bold">+{achievement.points}</StyledText>
        </StyledView>
      </StyledView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

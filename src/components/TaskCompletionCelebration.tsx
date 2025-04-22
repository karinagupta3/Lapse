import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Confetti } from './Confetti';

const { width, height } = Dimensions.get('window');

const StyledView = styled(View);
const StyledText = styled(Text);

type TaskCompletionCelebrationProps = {
  visible: boolean;
  points: number;
  taskName?: string;
  onAnimationComplete?: () => void;
};

export const TaskCompletionCelebration: React.FC<TaskCompletionCelebrationProps> = ({
  visible,
  points,
  taskName,
  onAnimationComplete,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayPoints, setDisplayPoints] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      pointsAnim.setValue(0);
      setShowConfetti(true);
      setDisplayPoints(points || 10);

      // Provide haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }

      // Start animations
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pointsAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowConfetti(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {showConfetti && <Confetti />}
      
      <Animated.View
        style={[
          styles.celebrationCard,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <StyledView className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl items-center">
          <StyledView className="w-16 h-16 rounded-full bg-[#6366F1] items-center justify-center mb-4">
            <Ionicons name="checkmark" size={32} color="white" />
          </StyledView>
          
          <StyledText className="text-white text-2xl font-bold mb-2">
            Task Complete!
          </StyledText>
          
          {taskName && (
            <StyledText className="text-white/80 text-center mb-4">
              {taskName}
            </StyledText>
          )}
          
          <StyledView className="flex-row items-center">
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Animated.Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 24,
                marginLeft: 8,
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
                transform: [
                  { scale: pointsAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.3, 1],
                  }) }
                ]
              }}
            >
              +{displayPoints}
            </Animated.Text>
          </StyledView>
        </StyledView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  celebrationCard: {
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

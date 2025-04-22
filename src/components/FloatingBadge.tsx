import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

type FloatingBadgeProps = {
  title: string;
  icon?: string;
  color?: string;
  visible: boolean;
  onPress?: () => void;
  onClose?: () => void;
  duration?: number;
};

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  title,
  icon = 'trophy',
  color = '#6366F1',
  visible,
  onPress,
  onClose,
  duration = 3000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values
      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.8);
      bounceValue.setValue(0);

      // Sequence of animations
      Animated.sequence([
        // Slide in and fade in
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        
        // Small bounce
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        
        // Wait for duration
        Animated.delay(duration),
        
        // Slide out and fade out
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (onClose) onClose();
      });
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  // Calculate bounce transform
  const bounce = bounceValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { scale: Animated.multiply(scale, bounce) },
          ],
          opacity,
        },
      ]}
    >
      <StyledTouchableOpacity
        className="flex-row items-center bg-[#1F2937] p-3 rounded-full"
        style={[
          styles.badge,
          { borderColor: color },
        ]}
        onPress={() => {
          if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }
        }}
        activeOpacity={0.8}
      >
        <StyledView 
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: color }}
        >
          <Ionicons name={icon} size={16} color="white" />
        </StyledView>
        <StyledText className="text-white font-medium flex-1">
          {title}
        </StyledText>
        <StyledTouchableOpacity
          className="ml-2 p-1"
          onPress={() => {
            if (onClose) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.8)" />
        </StyledTouchableOpacity>
      </StyledTouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  badge: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    maxWidth: '100%',
  },
});

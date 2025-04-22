import React, { useEffect, useState } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiProps {
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const Particle = ({ color, size, duration }: { color: string; size: number; duration: number }) => {
  const position = new Animated.ValueXY({ x: 0, y: 0 });
  const opacity = new Animated.Value(1);
  const rotation = new Animated.Value(0);
  
  // Random starting position (from top of screen)
  const startX = Math.random() * SCREEN_WIDTH;
  const startY = -20;
  
  // Random ending position
  const endX = startX + (Math.random() * 200 - 100);
  const endY = SCREEN_HEIGHT + 50;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: endX - startX, y: endY - startY },
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration * 0.8,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: Math.random() > 0.5 ? 1 : -1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const rotate = rotation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-360deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 10,
          transform: [
            { translateX: startX },
            { translateY: startY },
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
          opacity,
        },
      ]}
    />
  );
};

export const Confetti = ({ count = 100, duration = 2000, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    const newParticles = [];
    
    for (let i = 0; i < count; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = Math.random() * 8 + 4; // 4-12px
      const particleDuration = duration + Math.random() * 1000; // Vary duration
      
      newParticles.push(
        <Particle 
          key={i} 
          color={color} 
          size={size} 
          duration={particleDuration} 
        />
      );
    }
    
    setParticles(newParticles);
    
    // Call onComplete after animation finishes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration + 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <StyledView className="absolute inset-0 z-50 pointer-events-none">
      {particles}
    </StyledView>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});

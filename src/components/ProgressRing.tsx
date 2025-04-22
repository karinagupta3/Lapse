import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, ViewStyle } from 'react-native';
import { styled } from 'nativewind';

const StyledText = styled(Text);

type ProgressRingProps = {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
  duration?: number;
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 100,
  strokeWidth = 10,
  color = '#6366F1',
  backgroundColor = 'rgba(255, 255, 255, 0.2)',
  showPercentage = true,
  style,
  duration = 800,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const progressAnimation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [progress, duration]);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background Circle */}
      <View style={styles.backgroundCircle}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }}
        />
      </View>

      {/* Animated Progress Circle */}
      <Animated.View style={styles.progressCircle}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progressAnimation}
            strokeLinecap="round"
            fill="transparent"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </Animated.View>

      {/* Percentage Text */}
      {showPercentage && (
        <View style={styles.textContainer}>
          <Animated.Text
            style={{
              color: 'white',
              fontSize: size / 4,
              fontWeight: 'bold',
            }}
          >
            {animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            })}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Simple SVG components for the circle
const Svg = ({ children, width, height }) => {
  return (
    <View style={{ width, height }}>
      {children}
    </View>
  );
};

const Circle = ({
  cx,
  cy,
  r,
  stroke,
  strokeWidth,
  strokeDasharray,
  strokeDashoffset,
  fill,
  strokeLinecap,
  rotation,
  origin,
}) => {
  return (
    <Animated.View
      style={{
        width: cx * 2,
        height: cy * 2,
        borderRadius: r,
        borderWidth: strokeWidth,
        borderColor: stroke,
        borderStyle: 'solid',
        transform: [{ rotate: `${rotation}deg` }],
        position: 'absolute',
        top: 0,
        left: 0,
        // This is a simplified approach - in a real app you'd use react-native-svg
        // for proper SVG support
      }}
    />
  );
};

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ShimmerEffectProps = {
  style?: ViewStyle;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  duration?: number;
};

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  style,
  width = '100%',
  height = 100,
  borderRadius = 8,
  duration = 1500,
}) => {
  const translateX = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Convert width to number for animation
    const widthValue = typeof width === 'string' ? 300 : width;
    
    Animated.loop(
      Animated.timing(translateX, {
        toValue: widthValue,
        duration: duration,
        useNativeDriver: true,
      })
    ).start();
  }, [width, duration]);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.01)',
            'rgba(255, 255, 255, 0.15)',
            'rgba(255, 255, 255, 0.01)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

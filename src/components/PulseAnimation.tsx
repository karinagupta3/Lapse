import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type PulseAnimationProps = {
  children: React.ReactNode;
  isActive?: boolean;
  style?: ViewStyle;
  pulseColor?: string;
  duration?: number;
  maxScale?: number;
};

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  isActive = true,
  style,
  duration = 1500,
  maxScale = 1.2,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation;

    if (isActive) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: maxScale,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.5,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animationLoop.start();
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isActive, duration, maxScale]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 100, // Make it round
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

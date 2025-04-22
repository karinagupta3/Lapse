import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
};

export const AnimatedGradientBackground: React.FC<Props> = ({ children }) => {
  const colors = ['#6366F1', '#EC4899', '#6366F1'];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      {children}
    </View>
  );
};

import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = {
  text: string;
  style?: TextStyle;
  delay?: number;
  duration?: number;
};

export const TypewriterText: React.FC<Props> = ({
  text,
  style,
  delay = 500,
  duration = 1500,
}) => {
  const textLength = useSharedValue(0);

  useEffect(() => {
    textLength.value = withDelay(
      delay,
      withTiming(text.length, { duration })
    );
  }, [text]);

  const animatedProps = useAnimatedProps(() => ({
    text: text.slice(0, Math.floor(textLength.value)),
  }));

  return (
    <AnimatedText
      style={style}
      animatedProps={animatedProps}
    />
  );
};

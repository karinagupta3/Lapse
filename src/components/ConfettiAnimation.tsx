import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

interface ConfettiAnimationProps {
  visible: boolean;
  onAnimationFinish?: () => void;
}

export const ConfettiAnimation = ({ visible, onAnimationFinish }: ConfettiAnimationProps) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    } else if (animationRef.current) {
      animationRef.current.reset();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <StyledView className="absolute inset-0 z-10 pointer-events-none">
      <LottieView
        ref={animationRef}
        source={require('../assets/confetti.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        onAnimationFinish={onAnimationFinish}
      />
    </StyledView>
  );
};

const styles = StyleSheet.create({
  animation: {
    width: '100%',
    height: '100%',
  },
});

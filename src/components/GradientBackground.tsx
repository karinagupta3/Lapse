import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';

const StyledLinearGradient = styled(LinearGradient);

type Props = {
  children: React.ReactNode;
};

export const GradientBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={{ flex: 1 }}>
      <StyledLinearGradient
        colors={['#6366F1', '#EC4899']}
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

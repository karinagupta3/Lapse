import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { styled } from 'nativewind';
import { GradientBackground } from '../components/GradientBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePointsStore } from '../data/pointsData';
import { ShimmerEffect } from '../components/ShimmerEffect';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

export const PointsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { 
    totalPoints, 
    achievements, 
    completedTasksToday,
    completedTasksThisWeek,
    refreshAchievements,
    resetPoints,
    level,
    levelProgress,
    pointsToNextLevel,
    currentStreak,
    longestStreak
  } = usePointsStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const pointsAnimation = useRef(new Animated.Value(1)).current;
  const statsAnimation = useRef(new Animated.Value(0)).current;
  const streakAnimation = useRef(new Animated.Value(0)).current;
  const achievementsAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const refreshPoints = () => {
    setRefreshing(true);

    // Start rotation animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Refresh achievements
    refreshAchievements();
    
    // End refreshing state
    setTimeout(() => {
      setRefreshing(false);
      rotateAnim.setValue(0); // Reset animation
    }, 1000);
  };

  // Create interpolated rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Animate points counter when it changes
    Animated.sequence([
      Animated.timing(pointsAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pointsAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animate stats section with a subtle bounce
    Animated.timing(statsAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start();
    
    // Animate streak counter with a slide-in effect
    Animated.timing(streakAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();
    
    // Animate achievements section with a fade-in effect
    Animated.timing(achievementsAnimation, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [totalPoints]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <GradientBackground>
      <StyledView 
        className="flex-1" 
        style={{ 
          marginTop: 56 + insets.top, // Adjusted for new tab bar height
          paddingBottom: insets.bottom
        }}
      >
        <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <StyledView className="flex-row justify-between items-center p-4 mb-6">
            <StyledText className="text-4xl font-bold text-white">Points</StyledText>
            <StyledView className="flex-row space-x-3">
              <StyledTouchableOpacity 
                className="bg-white/10 p-2 rounded-full"
                onPress={refreshPoints}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons 
                    name="refresh-outline" 
                    size={22} 
                    color="white" 
                  />
                </Animated.View>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity 
                className="bg-white/10 p-2 rounded-full"
                onPress={() => setSettingsVisible(true)}
              >
                <Ionicons name="settings-outline" size={22} color="white" />
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>

          <StyledView className="items-center mb-6">
            <StyledView className="bg-white/10 rounded-full w-32 h-32 items-center justify-center mb-2">
              <Animated.Text 
                className="text-5xl font-bold text-white" 
                style={{ transform: [{ scale: pointsAnimation }] }}
              >
                {totalPoints}
              </Animated.Text>
            </StyledView>
            <StyledText className="text-white/80 text-lg">Total Points</StyledText>
            
            {/* Points Info */}
            <StyledView className="bg-white/10 rounded-xl p-3 mt-3 mb-1">
              <StyledText className="text-white/80 text-center text-sm">
                +10 points per task completion
              </StyledText>
              <StyledText className="text-white/80 text-center text-sm">
                +1-10 bonus points for streaks
              </StyledText>
            </StyledView>
            
            {/* Level Badge */}
            <StyledView className="bg-[#6366F1] rounded-full px-4 py-1 mt-2">
              <StyledText className="text-white font-bold">Level {level}</StyledText>
            </StyledView>
            
            {/* Level Progress Bar */}
            <StyledView className="w-48 h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
              <StyledView 
                className="h-full bg-[#6366F1]" 
                style={{ width: `${levelProgress}%` }} 
              />
            </StyledView>
            <StyledText className="text-white/60 text-xs mt-1">
              {Math.round(levelProgress)}% to Level {level + 1}
            </StyledText>
          </StyledView>

          <Animated.View style={{ transform: [{ scale: statsAnimation }] }}>
            <StyledView className="flex-row justify-center mb-8 px-4">
              <StyledView className="items-center w-1/3 px-2">
                <StyledText className="text-3xl font-bold text-white">{completedTasksToday}</StyledText>
                <StyledText className="text-white/70 text-sm text-center">Today</StyledText>
              </StyledView>
              <StyledView className="items-center w-1/3 px-2">
                <StyledText className="text-3xl font-bold text-white">{completedTasksThisWeek}</StyledText>
                <StyledText className="text-white/70 text-sm text-center">This Week</StyledText>
              </StyledView>
              <StyledView className="items-center w-1/3 px-2">
                <StyledText className="text-3xl font-bold text-white">{achievements.filter(a => a.unlocked).length}</StyledText>
                <StyledText className="text-white/70 text-sm text-center">Achievements</StyledText>
              </StyledView>
            </StyledView>
          </Animated.View>

          {/* Streak Counter */}
          <Animated.View style={{ transform: [{ translateY: streakAnimation.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }}>
            <StyledView className="bg-white/10 mx-4 p-4 rounded-xl mb-8">
              <StyledView className="flex-row justify-between items-center">
                <StyledView className="flex-row items-center">
                  <Ionicons name="flame" size={24} color="#F59E0B" />
                  <StyledText className="text-white font-bold text-lg ml-2">Current Streak</StyledText>
                </StyledView>
                <StyledText className="text-3xl font-bold text-[#F59E0B]">{currentStreak}</StyledText>
              </StyledView>
              <StyledText className="text-white/60 mt-1">Complete tasks daily to build your streak!</StyledText>
              <StyledView className="flex-row justify-between mt-3">
                <StyledText className="text-white/70">Longest Streak</StyledText>
                <StyledText className="text-white font-bold">{longestStreak}</StyledText>
              </StyledView>
            </StyledView>
          </Animated.View>

          <Animated.View style={{ opacity: achievementsAnimation }}>
            <StyledView className="px-4 flex-1">
              <StyledText className="text-2xl font-bold text-white mb-4">Achievements</StyledText>
              
              <StyledScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {isLoading ? (
                  <ShimmerEffect />
                ) : (
                  achievements.map((achievement) => (
                    <StyledView 
                      key={achievement.id} 
                      className={`mb-4 p-4 rounded-xl ${achievement.unlocked ? 'bg-white/10' : 'bg-white/5'}`}
                    >
                      <StyledView className="flex-row justify-between items-center">
                        <StyledView className="flex-1">
                          <StyledText className="text-xl font-bold text-white">
                            {achievement.title}
                          </StyledText>
                          <StyledText className="text-white/70">
                            {achievement.description}
                          </StyledText>
                          {achievement.unlocked && (
                            <StyledText className="text-[#4ade80] mt-1">
                              <Ionicons name="checkmark-circle" size={14} /> Unlocked
                            </StyledText>
                          )}
                        </StyledView>
                        <StyledView className="bg-white/10 px-3 py-1 rounded-full">
                          <StyledText className="text-white font-medium">
                            {achievement.points} pts
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  ))
                )}
                
                <StyledText className="text-white/60 text-center my-4 px-4">
                  Complete more tasks to earn points and unlock achievements!
                </StyledText>
                
                <StyledView className="h-20" />
              </StyledScrollView>
            </StyledView>
          </Animated.View>

          {/* Settings Modal */}
          <Modal
            visible={settingsVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setSettingsVisible(false)}
          >
            <StyledView className="flex-1 justify-end">
              <StyledView className="bg-[#1F2937] rounded-t-3xl p-6">
                <StyledView className="flex-row justify-between items-center mb-6">
                  <StyledText className="text-2xl font-bold text-white">
                    Settings
                  </StyledText>
                  <StyledTouchableOpacity onPress={() => setSettingsVisible(false)}>
                    <Ionicons name="close" size={24} color="white" />
                  </StyledTouchableOpacity>
                </StyledView>
                
                <StyledView className="mb-4">
                  <StyledText className="text-white text-lg mb-2">Points Settings</StyledText>
                  <StyledTouchableOpacity 
                    className="bg-white/10 p-4 rounded-xl mb-2 flex-row justify-between items-center"
                    onPress={() => {
                      resetPoints();
                      setSettingsVisible(false);
                    }}
                  >
                    <StyledText className="text-white">Reset Points</StyledText>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            </StyledView>
          </Modal>
        </StyledScrollView>
      </StyledView>
    </GradientBackground>
  );
};

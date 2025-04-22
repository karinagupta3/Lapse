import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { styled } from 'nativewind';
import { GradientBackground } from '../components/GradientBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scheduleEvents, formatTimeForDisplay, formatDuration, formatDurationMinutes, getTypeColor, getTypeBackground, getTypeGradient, ScheduleEvent } from '../data/scheduleData';
import { usePointsStore } from '../data/pointsData';
import { useScheduleStore } from '../data/scheduleStore';
import { Confetti } from '../components/Confetti';
import { ConfettiAnimation } from '../components/ConfettiAnimation';
import * as Haptics from 'expo-haptics';
import { AchievementNotification } from '../components/AchievementNotification';
import { FloatingBadge } from '../components/FloatingBadge';
import { TaskCompletionCelebration } from '../components/TaskCompletionCelebration';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

const EVENT_TYPES = [
  { label: 'Work', value: 'work' },
  { label: 'Break', value: 'break' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Gym', value: 'gym' },
];

export const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('work');
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTaskCelebration, setShowTaskCelebration] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [completedTaskPoints, setCompletedTaskPoints] = useState(0);
  const [completedTaskName, setCompletedTaskName] = useState('');
  const [showFloatingBadge, setShowFloatingBadge] = useState(false);
  const [floatingBadgeMessage, setFloatingBadgeMessage] = useState('');
  const [floatingBadgeColor, setFloatingBadgeColor] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Use the schedule store
  const { events, setEvents, addEvent, updateEvent, removeEvent } = useScheduleStore();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Get points data
  const { newlyUnlockedAchievement, clearNewAchievement } = usePointsStore();
  
  // Check for newly unlocked achievements
  useEffect(() => {
    if (newlyUnlockedAchievement) {
      setShowAchievement(true);
      // Extra haptic feedback for achievement
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [newlyUnlockedAchievement]);
  
  useEffect(() => {
    // Calculate progress percentage based on completed events
    if (events.length === 0) {
      setProgressPercentage(0);
      progressAnimation.setValue(0);
      return;
    }
    
    try {
      const completedCount = events.filter(event => event.completed).length;
      const totalCount = events.length;
      const percentage = Math.round((completedCount / totalCount) * 100);
      
      setProgressPercentage(percentage);
      
      // Animate progress bar
      Animated.timing(progressAnimation, {
        toValue: percentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error calculating progress:', error);
      setProgressPercentage(0);
      progressAnimation.setValue(0);
    }
  }, [events]);
  
  // Filter events based on search query
  const filteredEvents = events;

  const addEventToCalendar = async () => {
    try {
      const eventId = Date.now().toString();
      
      // Create end time based on start time and duration
      const endTimeDate = new Date(startTime.getTime() + duration * 60 * 1000);
      
      const newScheduleEvent: ScheduleEvent = {
        id: eventId,
        title: eventTitle || 'Untitled Event',
        description: eventDescription || '',
        startTime: startTime,
        endTime: endTimeDate,
        type: eventType as 'work' | 'break' | 'meeting' | 'gym',
      };

      addEvent(newScheduleEvent);
      setModalVisible(false);
      resetFormFields();
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const editEvent = () => {
    try {
      if (!editingEventId) return;
      
      // Create end time based on start time and duration
      const endTimeDate = new Date(startTime.getTime() + duration * 60 * 1000);
      
      const updatedEvent: Partial<ScheduleEvent> = {
        title: eventTitle || 'Untitled Event',
        description: eventDescription || '',
        startTime: startTime,
        endTime: endTimeDate,
        type: eventType as 'work' | 'break' | 'meeting' | 'gym',
      };

      updateEvent(editingEventId, updatedEvent);
      setModalVisible(false);
      resetFormFields();
      setIsEditing(false);
      setEditingEventId(null);
    } catch (error) {
      console.error('Error editing event:', error);
    }
  };

  const handleEditEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    // Calculate duration in minutes
    let durationMinutes = 60;
    try {
      if (event.startTime && event.endTime) {
        const durationMs = event.endTime.getTime() - event.startTime.getTime();
        durationMinutes = Math.round(durationMs / (60 * 1000));
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
    }
    
    // Set form fields
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventType(event.type);
    setStartTime(event.startTime);
    setDuration(durationMinutes);
    
    // Set editing state
    setIsEditing(true);
    setEditingEventId(id);
    setModalVisible(true);
  };

  const resetFormFields = () => {
    setEventTitle('');
    setEventDescription('');
    setEventType('work');
    setStartTime(new Date());
    setDuration(60);
  };

  const openAddEventModal = () => {
    resetFormFields();
    setIsEditing(false);
    setEditingEventId(null);
    setModalVisible(true);
  };

  const toggleEventCompletion = (id: string) => {
    try {
      // Find the event
      const event = events.find(e => e.id === id);
      if (!event) return;
      
      const isCompleting = !event.completed;
      
      // Update local state
      updateEvent(id, { completed: isCompleting });
      
      // Update points store
      if (isCompleting) {
        // If marking as completed
        try {
          const pointsResult = usePointsStore.getState().addCompletedTask(id, event);
          
          // Trigger haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Set task celebration data
          setCompletedTaskPoints(pointsResult?.pointsEarned || 10);
          setCompletedTaskName(event.title);
          
          // Show task completion celebration
          setShowTaskCelebration(true);
          
          // Show floating badge with points info
          const message = `+${pointsResult?.pointsEarned || 10} points!`;
          setFloatingBadgeMessage(pointsResult?.streakBonus ? `${message} 🔥 Streak bonus!` : message);
          setFloatingBadgeColor('#22C55E'); // Green color for completion
          
          // Show floating badge after a short delay
          setTimeout(() => {
            setShowFloatingBadge(true);
          }, 500);
          
          // Show confetti animation (with a slight delay to ensure state updates first)
          setTimeout(() => {
            setShowConfetti(true);
          }, 50);
        } catch (error) {
          console.error('Error updating points:', error);
        }
      } else {
        // If marking as incomplete
        try {
          usePointsStore.getState().removeCompletedTask(id);
          
          // Trigger light haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          // Show floating badge with points info
          setFloatingBadgeMessage('Task marked incomplete');
          setFloatingBadgeColor('#EF4444'); // Red color for incomplete
          setTimeout(() => {
            setShowFloatingBadge(true);
          }, 100);
        } catch (error) {
          console.error('Error removing points:', error);
        }
      }
    } catch (error) {
      console.error('Error toggling event completion:', error);
    }
  };

  const deleteEvent = (id: string) => {
    try {
      if (id) {
        removeEvent(id);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <GradientBackground>
      <StyledView 
        className="flex-1"
        style={{ 
          marginTop: 56 + insets.top, 
          paddingBottom: insets.bottom
        }}
      >
        <StyledView className="px-4 pt-2 pb-4">
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="text-3xl font-bold text-white">Today's Schedule</StyledText>
            <StyledTouchableOpacity 
              className="bg-white/10 p-2 rounded-full"
              onPress={() => {}}
            >
              <Ionicons name="search-outline" size={22} color="white" />
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Progress Section */}
        <StyledView className="mx-4 mb-6 bg-white/10 p-4 rounded-xl">
          <StyledText className="text-white font-medium mb-2">Today's Progress</StyledText>
          <StyledView className="bg-white/10 h-2 rounded-full overflow-hidden mb-1">
            <Animated.View
              style={{
                height: '100%',
                borderRadius: 9999,
                backgroundColor: progressPercentage === 100 ? '#10B981' : '#6366F1',
                width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })
              }}
            />
          </StyledView>
          <StyledText className="text-white/70 text-sm text-right">
            {events.filter(e => e.completed).length}/{events.length} completed
          </StyledText>
          
          {progressPercentage === 100 && (
            <StyledText className="text-green-400 text-center mt-2 font-semibold">
              All tasks completed! 🎉
            </StyledText>
          )}
        </StyledView>
        <StyledScrollView 
          ref={scrollViewRef} 
          className="flex-1 px-4"
        >
          {filteredEvents.length === 0 ? (
            <StyledView className="flex-1 items-center justify-center py-8">
              <StyledText className="text-white/60 text-center">
                No events scheduled for today.
                Add your first event to get started.
              </StyledText>
            </StyledView>
          ) : (
            filteredEvents.map(event => (
              <StyledTouchableOpacity
                key={event.id}
                className={`mb-4 rounded-xl overflow-hidden ${event.completed ? 'opacity-60' : 'opacity-100'}`}
                onPress={() => {}}
                style={{ elevation: 2 }}
              >
                <LinearGradient
                  colors={[...getTypeGradient(event.type)]}
                  className="flex-1 p-4 rounded-xl mb-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <StyledView className="flex-row justify-between items-start mb-2">
                    <StyledText className="text-white font-bold text-xl">
                      {event.title}
                    </StyledText>
                    
                    <StyledView className="flex-row">
                      <StyledTouchableOpacity
                        className="mr-2"
                        onPress={() => toggleEventCompletion(event.id)}
                      >
                        <Ionicons
                          name={event.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                          size={24}
                          color="white"
                        />
                      </StyledTouchableOpacity>
                      
                      <StyledTouchableOpacity
                        className="mr-2"
                        onPress={() => handleEditEvent(event.id)}
                      >
                        <Ionicons name="pencil-outline" size={22} color="white" />
                      </StyledTouchableOpacity>
                      
                      <StyledTouchableOpacity
                        onPress={() => deleteEvent(event.id)}
                      >
                        <Ionicons name="trash-outline" size={22} color="white" />
                      </StyledTouchableOpacity>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="flex-row items-center mb-1">
                    <Ionicons name="time-outline" size={16} color="white" />
                    <StyledText className="text-white/90 ml-1">
                      {formatTimeForDisplay(event.startTime)} - {formatTimeForDisplay(event.endTime)} · {formatDuration(event.startTime, event.endTime)}
                    </StyledText>
                  </StyledView>
                  
                  {event.description && (
                    <StyledView className="flex-row items-start mt-1">
                      <Ionicons name="information-circle-outline" size={16} color="white" style={{ marginTop: 3 }} />
                      <StyledText className="text-white/80 ml-1 flex-1">
                        {event.description}
                      </StyledText>
                    </StyledView>
                  )}
                </LinearGradient>
              </StyledTouchableOpacity>
            ))
          )}
        </StyledScrollView>

        <StyledTouchableOpacity
          className="bg-[#6366F1] py-3 px-4 rounded-xl mb-4 mx-4"
          onPress={openAddEventModal}
        >
          <StyledText className="text-white text-center font-semibold">
            Add New Event
          </StyledText>
        </StyledTouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <StyledView className="flex-1 justify-end">
            <StyledView className="bg-[#1F2937] rounded-t-3xl p-6">
              <StyledView className="flex-row justify-between items-center mb-6">
                <StyledText className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Event' : 'Add New Event'}
                </StyledText>
                <StyledTouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </StyledTouchableOpacity>
              </StyledView>

              <StyledView className="mb-4">
                <StyledText className="text-white/80 mb-2">Event Title</StyledText>
                <StyledTextInput
                  className="bg-white/10 p-3 rounded-xl text-white"
                  placeholder="Enter event title"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={eventTitle}
                  onChangeText={(text) => setEventTitle(text)}
                />
              </StyledView>

              <StyledView className="mb-4">
                <StyledText className="text-white/80 mb-2">Description (Optional)</StyledText>
                <StyledTextInput
                  className="bg-white/10 p-3 rounded-xl text-white"
                  placeholder="Enter event description"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={eventDescription}
                  onChangeText={(text) => setEventDescription(text)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </StyledView>

              <StyledText className="text-white/80 mb-2">Start Time</StyledText>
              <StyledTouchableOpacity
                className="bg-white/10 p-3 rounded-xl mb-4"
                onPress={() => {
                  setShowStartTimePicker(true);
                  setShowDurationPicker(false);
                }}
              >
                <StyledText className="text-white">
                  {startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </StyledText>
              </StyledTouchableOpacity>

              <StyledText className="text-white/80 mb-2">Duration</StyledText>
              <StyledTouchableOpacity
                className="bg-white/10 p-3 rounded-xl mb-4"
                onPress={() => {
                  setShowDurationPicker(true);
                  setShowStartTimePicker(false);
                }}
              >
                <StyledText className="text-white">
                  {formatDurationMinutes(duration)}
                </StyledText>
              </StyledTouchableOpacity>

              {showStartTimePicker && Platform.OS === 'ios' && (
                <StyledView className="bg-white/10 p-4 rounded-xl mb-4">
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setStartTime(selectedTime);
                      }
                    }}
                    style={{ height: 120 }}
                    textColor="white"
                  />
                  <StyledTouchableOpacity
                    className="bg-[#6366F1] p-3 rounded-xl mt-2"
                    onPress={() => setShowStartTimePicker(false)}
                  >
                    <StyledText className="text-white text-center font-semibold">Done</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              )}

              {showDurationPicker && Platform.OS === 'ios' && (
                <StyledView className="bg-white/10 p-4 rounded-xl mb-4">
                  <StyledView className="flex-row flex-wrap">
                    {DURATIONS.map((durationOption) => (
                      <StyledTouchableOpacity
                        key={durationOption.value}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full ${duration === durationOption.value ? 'bg-[#6366F1]' : 'bg-white/10'}`}
                        onPress={() => setDuration(durationOption.value)}
                      >
                        <StyledText className="text-white">{durationOption.label}</StyledText>
                      </StyledTouchableOpacity>
                    ))}
                  </StyledView>
                  <StyledTouchableOpacity
                    className="bg-[#6366F1] p-3 rounded-xl mt-2"
                    onPress={() => setShowDurationPicker(false)}
                  >
                    <StyledText className="text-white text-center font-semibold">Done</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              )}

              {showStartTimePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowStartTimePicker(false);
                    if (selectedTime) {
                      setStartTime(selectedTime);
                    }
                  }}
                />
              )}

              <StyledView className="mb-6">
                <StyledText className="text-white/80 mb-2">Event Type</StyledText>
                <StyledView className="flex-row flex-wrap">
                  {EVENT_TYPES.map((type) => (
                    <StyledTouchableOpacity
                      key={type.value}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${eventType === type.value ? getTypeColor(type.value) : 'bg-white/10'}`}
                      onPress={() => setEventType(type.value)}
                    >
                      <StyledText className="text-white">{type.label}</StyledText>
                    </StyledTouchableOpacity>
                  ))}
                </StyledView>
              </StyledView>

              <StyledTouchableOpacity
                className="bg-[#6366F1] p-4 rounded-xl"
                onPress={isEditing ? editEvent : addEventToCalendar}
              >
                <StyledText className="text-white text-center font-semibold text-lg">
                  {isEditing ? 'Save Changes' : 'Add Event'}
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </Modal>
        
        {/* Floating Badge */}
        <FloatingBadge
          title={floatingBadgeMessage}
          icon="trophy"
          color={floatingBadgeColor}
          visible={showFloatingBadge}
          onClose={() => setShowFloatingBadge(false)}
        />
        
        {/* Task Completion Celebration */}
        <TaskCompletionCelebration
          visible={showTaskCelebration}
          points={completedTaskPoints}
          taskName={completedTaskName}
          onAnimationComplete={() => setShowTaskCelebration(false)}
        />
        
        {/* Achievement Notification */}
        {showAchievement && newlyUnlockedAchievement && (
          <AchievementNotification
            achievement={newlyUnlockedAchievement}
            onClose={() => {
              setShowAchievement(false);
              clearNewAchievement();
            }}
          />
        )}
        
        {/* Confetti Animation */}
        {showConfetti && (
          <Confetti
            count={50}
            duration={2000}
            onComplete={() => setShowConfetti(false)}
          />
        )}
      </StyledView>
    </GradientBackground>
  );
};

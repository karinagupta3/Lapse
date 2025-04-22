import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatbotScreen } from '../screens/ChatbotScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { PointsScreen } from '../screens/PointsScreen';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const StyledView = styled(View);
const StyledText = styled(Text);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const tabWidth = width / state.routes.length;
  
  return (
    <StyledView 
      className="flex-row items-center justify-center bg-white/5 backdrop-blur-md"
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        height: 56,
        paddingHorizontal: 20,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = route.name;
        const isFocused = state.index === index;
        
        let iconName;
        if (route.name === 'Chat') {
          iconName = 'chatbubble';
        } else if (route.name === 'Calendar') {
          iconName = 'calendar';
        } else if (route.name === 'Points') {
          iconName = 'trophy';
        }
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        return (
          <StyledView 
            key={index} 
            className={`flex-1 items-center justify-center py-2 ${isFocused ? 'bg-[#6366F1] rounded-full' : ''}`}
            style={{ maxWidth: tabWidth - 20 }}
          >
            <StyledText
              className={`text-base font-medium ${isFocused ? 'text-white' : 'text-white/60'}`}
              onPress={onPress}
            >
              {label}
            </StyledText>
          </StyledView>
        );
      })}
    </StyledView>
  );
};

export const MainTabs = ({ route }) => {
  // Get initialTab from route params if available
  const initialTab = route?.params?.initialTab || 'Chat';
  
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialTab}
    >
      <Tab.Screen name="Chat" component={ChatbotScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Points" component={PointsScreen} />
    </Tab.Navigator>
  );
};

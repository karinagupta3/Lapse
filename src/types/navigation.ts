export type RootStackParamList = {
  Onboarding: undefined;
  OnboardingName: undefined;
  OnboardingPreference: {
    name: string;
  };
  OnboardingCalendar: {
    name: string;
    preference: string;
  };
  Home: undefined;
  Main: {
    initialTab?: 'Chat' | 'Calendar' | 'Points';
  };
  Welcome: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  Calendar: undefined;
  Points: undefined;
};

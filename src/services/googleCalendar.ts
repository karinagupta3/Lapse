import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Replace these with your Google Cloud credentials
const CLIENT_ID = 'YOUR_CLIENT_ID';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export const useGoogleCalendar = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    redirectUri: makeRedirectUri({
      scheme: 'lapse'
    }),
  });

  const fetchCalendarEvents = async (accessToken: string) => {
    try {
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  };

  return {
    request,
    response,
    promptAsync,
    fetchCalendarEvents,
  };
};

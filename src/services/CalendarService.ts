import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useState } from 'react';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const useGoogleCalendar = () => {
  const CLIENT_ID = '685052568523-v0vv2u3ktjmt32f4fm9a55o92ncrrjd1.apps.googleusercontent.com';
  const CLIENT_SECRET = ''; // TODO: Add your client secret
  const REDIRECT_URI = 'com.lapse.app:/oauth2redirect';
  const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

  const exchangeCodeForTokens = async (code: string) => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to exchange code for tokens');
    }

    // Store tokens securely
    await SecureStore.setItemAsync('refreshToken', data.refresh_token);
    await SecureStore.setItemAsync('accessToken', data.access_token);
    await SecureStore.setItemAsync('tokenExpiry', (Date.now() + data.expires_in * 1000).toString());

    return data.access_token;
  };

  const refreshAccessToken = async (refreshToken: string) => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to refresh access token');
    }

    // Store new access token
    await SecureStore.setItemAsync('accessToken', data.access_token);
    await SecureStore.setItemAsync('tokenExpiry', (Date.now() + data.expires_in * 1000).toString());

    return data.access_token;
  };

  const getValidAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const tokenExpiry = await SecureStore.getItemAsync('tokenExpiry');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    if (!accessToken || !tokenExpiry || !refreshToken) {
      return null;
    }

    // Check if token is expired
    if (Date.now() > parseInt(tokenExpiry)) {
      return await refreshAccessToken(refreshToken);
    }

    return accessToken;
  };

  const [isSignInVisible, setIsSignInVisible] = useState(false);

  const signIn = async () => {
    try {
      // Check if we already have a valid token
      const existingToken = await getValidAccessToken();
      if (existingToken) {
        return existingToken;
      }

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}`;

      // Add event listener for handling the redirect
      const handleRedirect = (event: { url: string }) => {
        if (event.url.includes('code=')) {
          const code = event.url.split('code=')[1].split('&')[0];
          Linking.removeEventListener('url', handleRedirect);
          return code;
        }
      };

      Linking.addEventListener('url', handleRedirect);

      // Open auth URL
      await Linking.openURL(authUrl);

      // Return a promise that resolves when we get the code
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          Linking.removeEventListener('url', handleRedirect);
          reject(new Error('Authentication timed out'));
        }, 60000); // 1 minute timeout

        const checkForCode = setInterval(async () => {
          const url = await Linking.getInitialURL();
          if (url && url.includes('code=')) {
            clearInterval(checkForCode);
            clearTimeout(timeout);
            const code = url.split('code=')[1].split('&')[0];
            try {
              const accessToken = await exchangeCodeForTokens(code);
              resolve(accessToken);
            } catch (error) {
              reject(error);
            }
          }
        }, 1000);
      });
    } catch (error) {
      setIsSignInVisible(false);
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const getCalendars = async (accessToken: string) => {
    try {
      const validToken = await getValidAccessToken() || accessToken;
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        }
      );
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Get calendars error:', error);
      throw error;
    }
  };

  const createEvents = async (accessToken: string, calendarId: string, timeBlocks: Array<{startTime: string, endTime: string}>) => {
    const validToken = await getValidAccessToken() || accessToken;
    const events = timeBlocks.map(block => ({
      summary: 'Lapse Time Block',
      description: 'Scheduled time block for tasks',
      start: {
        dateTime: block.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: block.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      recurrence: ['RRULE:FREQ=WEEKLY'],
    }));

    try {
      const results = await Promise.all(
        events.map(event =>
          fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${validToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(event),
            }
          ).then(res => res.json())
        )
      );
      return results;
    } catch (error) {
      console.error('Create events error:', error);
      throw error;
    }
  };

  return {
    signIn,
    getCalendars,
    createEvents,
    isSignInVisible,
    handleClose: () => setIsSignInVisible(false)
  };
};

export { useGoogleCalendar };

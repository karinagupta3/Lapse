import React, { useState } from 'react';
import { Modal } from 'react-native';
import { WebView } from 'react-native-webview';

interface GoogleSignInProps {
  onSuccess: (accessToken: string) => void;
  onError: (error: any) => void;
  onClose: () => void;
  visible: boolean;
}

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=685052568523-v0vv2u3ktjmt32f4fm9a55o92ncrrjd1.apps.googleusercontent.com&` +
  `redirect_uri=com.lapse.app:/oauth2redirect&` +
  `response_type=token&` +
  `scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events`;

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  onClose,
  visible
}) => {
  const handleNavigationStateChange = (navState: any) => {
    // Check if the URL contains the access token
    if (navState.url.includes('access_token=')) {
      const accessToken = navState.url.split('access_token=')[1].split('&')[0];
      onSuccess(accessToken);
      onClose();
    }
    // Check if the URL contains an error
    if (navState.url.includes('error=')) {
      const error = navState.url.split('error=')[1].split('&')[0];
      onError(new Error(error));
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <WebView
        source={{ uri: GOOGLE_AUTH_URL }}
        onNavigationStateChange={handleNavigationStateChange}
        incognito={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </Modal>
  );
};

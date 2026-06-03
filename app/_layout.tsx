import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../constants/tokens';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Yeseva+One&family=Oswald:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);

    // CSS animations for live pulse + halo
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blip {
        0%   { box-shadow: 0 0 0 0   rgba(181,72,46,.55); }
        70%  { box-shadow: 0 0 0 7px rgba(181,72,46,0);   }
        100% { box-shadow: 0 0 0 0   rgba(181,72,46,0);   }
      }
      @keyframes blip-cream {
        0%   { box-shadow: 0 0 0 0   rgba(244,235,217,.55); }
        70%  { box-shadow: 0 0 0 7px rgba(244,235,217,0);   }
        100% { box-shadow: 0 0 0 0   rgba(244,235,217,0);   }
      }
      .dot-blip       { animation: blip       1.6s infinite; }
      .dot-blip-cream { animation: blip-cream 1.6s infinite; }
      @media (prefers-reduced-motion: reduce) {
        .dot-blip, .dot-blip-cream { animation: none; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.green },
        headerTintColor: colors.cream,
        headerTitleStyle: { fontWeight: '700', fontFamily: 'Oswald' },
      }}
    >
      <Stack.Screen name="index"   options={{ headerShown: false }} />
      <Stack.Screen name="deliver" options={{ title: 'DELIVERING BREAD' }} />
      <Stack.Screen name="track"   options={{ headerShown: false }} />
    </Stack>
  );
}

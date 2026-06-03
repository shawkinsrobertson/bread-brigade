import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#c2410c',
        tabBarStyle: { backgroundColor: '#fff' },
        headerStyle: { backgroundColor: '#c2410c' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Track 🍞', tabBarLabel: 'Track' }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarLabel: 'Orders' }}
      />
      <Tabs.Screen
        name="broadcast"
        options={{ title: 'Broadcasting', tabBarLabel: 'Broadcast' }}
      />
    </Tabs>
  );
}

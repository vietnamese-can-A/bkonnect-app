import { Tabs } from 'expo-router';
import { type ColorValue, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={[styles.icon, { color }]}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.indigo,
        tabBarInactiveTintColor: '#52525B',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Đăng tin',
          tabBarIcon: ({ color }) => <TabIcon glyph="＋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Hoạt động',
          tabBarIcon: ({ color }) => <TabIcon glyph="▤" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <TabIcon glyph="◎" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopColor: '#EEF2F7',
    height: 68,
    paddingBottom: 8,
    paddingTop: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
  icon: {
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 24,
  },
});

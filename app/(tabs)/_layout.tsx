import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="abastecimento"
        options={{
          title: "Abastecimento",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="fuelpump.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manutencao"
        options={{
          title: "Manutenção",
          tabBarIcon: ({ color }) => (
            <Ionicons name={"construct-outline"} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

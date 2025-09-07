import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import Navbar from "@/components/Navbar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Navbar/>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
          android: {
            bottom: 80,
            left: 16,
            right: 16,
            height: 70,
            borderRadius: 100,
            marginRight: 25,
            marginLeft: 25,
            elevation: 3,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          animation: "shift",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol style={{ flex: 1, marginTop: focused? 2: 10, marginBottom: -50, marginRight: -20 }} size={focused? 39: 28} name="house.fill" color={`${focused? 'black': color}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          animation: "shift",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol style={{ flex: 1, marginTop: focused? 2: 10, marginBottom: -50, marginRight: -20 }} size={focused? 39: 28} name="plus" color={`${focused? 'black': color}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "",
          animation: "shift",
          tabBarIcon: ({ color, focused }) => (
              <IconSymbol style={{ flex: 1, marginTop: focused? 2: 10, marginBottom: -50, marginRight: -20 }} size={focused? 39: 28} name="message" color={`${focused? 'black': color}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="BuyNBorrow"
        options={{
          title: "",
          animation: "shift",
          tabBarIcon: ({ color, focused }) => (
              <IconSymbol style={{ flex: 1, marginTop: focused? 2: 10, marginBottom: -50, marginRight: -20 }} size={focused? 39: 28} name="magnifyingglass" color={`${focused? 'black': color}`} />
          ),
        }}
      />
      {/* alerts Tab */}
    </Tabs>

    </>
  );
}

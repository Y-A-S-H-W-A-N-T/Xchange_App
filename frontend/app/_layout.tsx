import client from "@/graphql/client";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ApolloProvider } from "@apollo/client";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import axios from "axios";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  axios.defaults.baseURL = process.env.EXPO_PUBLIC_BACKEND_URL; // BACKEND_URL

  return (
    <ApolloProvider client={client}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* CHANGES - temporary, remove the initialRouteName */}
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="signIn/signin"
            options={{ headerShown: false, animation: "ios_from_left" }}
          />
          <Stack.Screen
            name="signUp/signup"
            options={{ headerShown: false, animation: "ios_from_right" }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, animation: "ios_from_right" }}
          />
          <Stack.Screen
            name="products/[id]"
            options={{ headerShown: false, animation: "ios_from_right" }}
          />
          <Stack.Screen
            name="products/chat/[chat]"
            options={{ headerShown: false, animation: "ios_from_right" }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ApolloProvider>
  );
}

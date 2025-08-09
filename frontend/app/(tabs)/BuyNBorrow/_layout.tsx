"use client"

import { HapticTab } from "@/components/HapticTab"
import { Feather } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { useEffect, useRef } from "react"
import { Animated, Platform, StyleSheet, View } from "react-native"

export default function TabLayout() {
  const slideAnim = useRef(new Animated.Value(-100)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animate tab bar entrance
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const CustomTabBar = (props) => {
    return (
      <Animated.View
        style={[
          styles.tabBarContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.tabBar}>
          <View style={styles.tabBarContent}>
            {props.state.routes.map((route, index) => {
              const { options } = props.descriptors[route.key]
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name

              const isFocused = props.state.index === index

              const onPress = () => {
                const event = props.navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                })

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name)
                }
              }

              return (
                <TabButton
                  key={route.key}
                  label={label}
                  isFocused={isFocused}
                  onPress={onPress}
                  routeName={route.name}
                />
              )
            })}
          </View>
        </View>
      </Animated.View>
    )
  }

  const TabButton = ({ label, isFocused, onPress, routeName }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current
    const colorAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current

    useEffect(() => {
      Animated.timing(colorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }, [isFocused])

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    const getIcon = () => {
      switch (routeName) {
        case "buy":
          return "shopping-cart"
        case "borrow":
          return "clock"
        default:
          return "circle"
      }
    }

    const backgroundColor = colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "#111827"],
    })

    const textColor = colorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#6B7280", "#FFFFFF"],
    })

    return (
      <Animated.View
        style={[
          styles.tabButton,
          {
            backgroundColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <HapticTab
          style={styles.tabButtonTouchable}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.tabButtonContent}>
            <Feather name={getIcon()} size={20} color={isFocused ? "#FFFFFF" : "#6B7280"} />
            <Animated.Text style={[styles.tabButtonText, { color: textColor }]}>{label}</Animated.Text>
          </View>
        </HapticTab>
      </Animated.View>
    )
  }

  return (
      <Tabs
        tabBar={CustomTabBar}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="buy"
          options={{
            title: "Buy",
            animation: "shift",
          }}
        />
        <Tabs.Screen
          name="borrow"
          options={{
            title: "Borrow",
            animation: "shift",
          }}
        />
      </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? 10 : 20,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 24,
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarContent: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 4,
    overflow: "hidden",
  },
  tabButtonTouchable: {
    flex: 1,
  },
  tabButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
})

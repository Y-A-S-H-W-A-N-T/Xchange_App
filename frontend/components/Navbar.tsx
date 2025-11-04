import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const Navbar = () => {
  const [isThemeToggleVisible, setIsThemeToggleVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const themeToggleTranslateX = useRef(new Animated.Value(0)).current; // Start hidden behind logo
  const router = useRouter()

  const toggleThemeButton = () => {
    setIsThemeToggleVisible(!isThemeToggleVisible);
    Animated.timing(themeToggleTranslateX, {
      toValue: isThemeToggleVisible ? 0 : 60, // Slide right by 60px
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    console.log('Theme toggled:', isDarkMode ? 'Light Mode' : 'Dark Mode');
  };

  const animatedThemeToggleStyle = {
    transform: [{ translateX: themeToggleTranslateX }],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BlurView intensity={80} tint="dark" style={styles.navbar}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={toggleThemeButton}
          activeOpacity={0.7}
        >
          <Feather name="x" size={30} color="#ffffff" />
        </TouchableOpacity>
        {isThemeToggleVisible && (
          <Animated.View style={[styles.themeToggleContainer, animatedThemeToggleStyle]}>
            <TouchableOpacity
              style={styles.themeToggleButton}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Feather
                name={isDarkMode ? 'sun' : 'moon'}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.themeToggleButton}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Feather
                name={isDarkMode ? 'sun' : 'moon'}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
          </Animated.View>
        )}
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => router.push('/profilePage') }
          activeOpacity={0.7}
        >
          <Feather name="user" size={24} color="#7a0000" />
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
    width: width,
    paddingHorizontal: 15,
    marginTop: 0,
    backgroundColor: 'black'
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  themeToggleContainer: {
    position: 'absolute',
    left: 20, // Right of logo (50px width + 15px padding)
    top: 20,
    flexDirection: 'row',
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 5
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff', // White background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default Navbar;
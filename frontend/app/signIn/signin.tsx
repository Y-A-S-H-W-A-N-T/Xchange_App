import { useMutation } from "@apollo/client";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Sign_In } from "../../graphql/queries";

const { width, height } = Dimensions.get("window");

type requiredProps = {
  setComponent: any;
};

const SignIn = ({ setComponent }: requiredProps) => {
  const [phone, setPhone] = useState("8179230511"); // 7330913164
  const [password, setPassword] = useState("yash"); // yashwant
  const router = useRouter()

  const [signin, { loading, error }] = useMutation(Sign_In, {
    onCompleted: (data) => {
      if(data.signIn.message === "User Not Found"){
        alert("User Not Found")
      }
      else{
        storeUser()
        router.replace({ pathname: "/(tabs)", params: { phone: phone } })
      }
    },
    onError: (data)=>{
      alert("Unexpected Error !!!")
    }
  });

  const storeUser = async()=>{
    try {
      await SecureStore.setItemAsync('user_phone', phone);
    } catch (error) {
      console.log("Error storing User")
    }
  }

  const handleSignIn = async() => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter Credentials");
      return;
    }
    await signin({
      variables: {
        number: phone,
        password: password,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to sign in
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            accessibilityLabel="Phone Number Input"
            placeholderTextColor="#7a0000"
          />

          <TextInput
            style={styles.input}
            placeholder="password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#7a0000"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.signInText}>
            Don’t have an account?{" "}
            <TouchableOpacity>
              <Text
                style={styles.signInBold}
                onPress={() => setComponent("signup")}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000000",
    height: height + 200,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
  },
  formContainer: {
    width: width * 0.85,
    maxWidth: 360,
    padding: 24,
    backgroundColor: "#ffffff", // White form background
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000", // Black text
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7a0000", // Deep red
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff", // White input background
    borderWidth: 1,
    borderColor: "#7a0000", // Deep red border
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000000", // Black input text
  },
  button: {
    width: "100%",
    backgroundColor: "#7a0000", // Deep red button
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff", // White button text
    fontWeight: "600",
  },
  signInText: {
    fontSize: 14,
    color: "#7a0000", // Deep red
  },
  signInBold: {
    fontWeight: "bold",
    color: "#7a0000", // Deep red
  },
});

export default SignIn;

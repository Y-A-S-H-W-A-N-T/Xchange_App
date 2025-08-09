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
  View,
} from "react-native";

import { ADD_USER } from "../../graphql/queries";

import { useMutation } from "@apollo/client";

const { width, height } = Dimensions.get("window");

type requiredProps = {
  setComponent: any;
};

const SignUp = ({ setComponent }: requiredProps) => {
  const [form, setForm] = useState({
    name: "",
    number: "",
    password: "",
  });

  const [registerUser, { loading, error }] = useMutation(ADD_USER, {
    onCompleted: (t) => {
      console.log("????", t);
      alert(`You are registered! Login with your credentials`);
      setComponent("signin");
    },
  });

  const handleInputChange = (field: any, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSignUp = async () => {
    if (!form.name || !form.number) {
      Alert.alert("Error", "Please enter both name and number number");
      return;
    }

    // Validate number number: exactly 10 digits
    const numberRegex = /^\d{10}$/;
    if (!numberRegex.test(form.number)) {
      Alert.alert(
        "Error",
        "Please enter a valid phone number (exactly 10 digits)"
      );
      return;
    }
    registerUser({
      variables: {
        name: form.name,
        number: form.number,
        password: form.password
      }
    })
    // try {
    //   const response = await axios.post("/user/signup", form);
    //   console.log("API Response:", response.data);
    //   if (response.data.status === 201) {
    //     alert(`You are registered! Login with your credentials`);
    //     setComponent("signin");
    //   } else if (response.data.status === 409) {
    //     alert("User Already Exists with this number");
    //   }
    // } catch (error) {
    //   console.error("API Error:", error);
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={form.name}
            onChangeText={(text) => handleInputChange("name", text)}
            accessibilityLabel="Full Name Input"
            autoCapitalize="words"
            placeholderTextColor="#7a0000"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={form.number}
            onChangeText={(text) => handleInputChange("number", text)}
            keyboardType="phone-pad"
            accessibilityLabel="Phone Number Input"
            placeholderTextColor="#7a0000"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={form.password}
            // passwordRules={} add some password rules
            onChangeText={(text) => handleInputChange("password", text)}
            placeholderTextColor="#7a0000"
            keyboardType="visible-password"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.signInText}>
            Already have an account?{" "}
            <TouchableOpacity>
              <Text
                style={styles.signInBold}
                onPress={() => setComponent("signin")}
              >
                Sign In
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
  signInLink: {
    alignItems: "center",
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

export default SignUp;

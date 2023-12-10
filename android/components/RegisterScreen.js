import React, { useState } from "react";
import { View, Text } from "react-native";
import { Input, Button } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { BASE_URL } from '@env';
  
const RegisterScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");  
  const [error, setError] = useState({});

  const handleRegister = async () => {
    if (!username || !phoneNumber || !email || !password) {
      setError({
        username: !username ? "Username is required" : "",
        phoneNumber: !phoneNumber ? "Phone Number is required" : "",
        email: !email ? "Email is required" : "",
        password: !password ? "Password is required" : "",
      });
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/sign-up/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            phone_number: phoneNumber,
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData) {
          const errors = Object.entries(errorData).map(
            // @ts-ignore
            ([key, value]) => `${key}: ${value.join(", ")}`
          );
          Alert.alert("Registration Failed", errors.join("\n"));
        } else {
          throw new Error(errorData.detail || "An error occurred");
        }
      } else {
        const data = await response.json();
        console.log("Registration Successful:", data);

        navigation.navigate("Login");
      }
    } catch (error) {
    //   console.error("Registration Error:", error);
    //   setError({ ...error });
    }
  };

  const handleRegisterLink = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
        Register
      </Text>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Username"
          onChangeText={(text) => setUsername(text)}
        />
        {error.username ? (
          <Text style={{ color: "red" }}>{error.username}</Text>
        ) : null}
      </View>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Phone Number"
          keyboardType="numeric"
          onChangeText={(text) => setPhoneNumber(text)}
        />
        {error.phoneNumber ? (
          <Text style={{ color: "red" }}>{error.phoneNumber}</Text>
        ) : null}
      </View>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Email"
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
        />
        {error.email ? (
          <Text style={{ color: "red" }}>{error.email}</Text>
        ) : null}
      </View>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
        {error.password ? (
          <Text style={{ color: "red" }}>{error.password}</Text>
        ) : null}
      </View>
      <Button block onPress={handleRegister}>
        <Text style={{ color: "white" }}>Register</Text>
      </Button>
      <Text
        style={{ textAlign: "center", marginTop: 10, color: "blue" }}
        onPress={handleRegisterLink}
      >
        Already have an account? Login here
      </Text>
    </View>
  );
};

export default RegisterScreen;

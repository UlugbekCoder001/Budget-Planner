// @ts-nocheck
import React, { useState } from "react";
import { View, Text } from "react-native";
import { Input, Button } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setAccessToken } from "../src/redux/actions/tokenActions";
import { Alert } from "react-native";
import { BASE_URL } from '@env';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});
  const dispatch = useDispatch();

  const handleLogin = async () => {
    console.log(BASE_URL);
    if (!username || !password) {
      setError({
        username: !username ? "Username is required" : "",
        password: !password ? "Password is required" : "",
      });
      return;
    }

    try {       
      const response = await fetch(
        `${BASE_URL}/sign-in/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Login failed', errorData?.detail)
      } else {
        const data = await response.json();
        console.log("Login Successful:", data);

        dispatch(setAccessToken(data.tokens.access));

        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError({ ...error });
    }
  };

  const handleRegisterLink = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
        Login   
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
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
        {error.password ? (
          <Text style={{ color: "red" }}>{error.password}</Text>
        ) : null}
      </View>
      <Button block onPress={handleLogin}>
        <Text style={{ color: "white" }}>Login</Text>
      </Button>
      <Text
        style={{ textAlign: "center", marginTop: 10, color: "blue" }}
        onPress={handleRegisterLink}
      >
        Don't have an account? Register here
      </Text>
    </View>
  );
};

export default LoginScreen;

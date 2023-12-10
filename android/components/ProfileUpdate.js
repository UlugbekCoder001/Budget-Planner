import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { Input, Button } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { BASE_URL } from '@env';

const UpdateProfile = () => {
  const navigation = useNavigation();
  const accessToken = useSelector((state) => state.token.accessToken);

  const [userData, setUserData] = useState({
    username: "",
    phone_number: "",
    email: "",
  });

  const [error, setError] = useState({});

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-user-data/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to fetch user data");
      } else {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Fetch User Data Error:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/update_profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to update profile");
      } else {
        Alert.alert("Success", "Profile updated successfully");
        navigation.navigate('Login')
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
        Update Profile
      </Text>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Username"
          value={userData.username}
          onChangeText={(text) => setUserData({ ...userData, username: text })}
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Phone Number"
          value={userData.phone_number}
          onChangeText={(text) => setUserData({ ...userData, phone_number: text })}
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Input
          placeholder="Email"
          value={userData.email}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
        />
      </View>
      <Button block onPress={handleUpdateProfile}>
        <Text style={{ color: "white" }}>Update Profile</Text>
      </Button>
    </View>
  );
};

export default UpdateProfile;

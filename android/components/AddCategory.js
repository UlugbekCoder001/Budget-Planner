import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "@env";

const AddCategory = () => {    
  const accessToken = useSelector((state) => state.token.accessToken);
  const [categoryName, setCategoryName] = useState("");

  const navigation = useNavigation();

  const handleAddCategory = async () => {
    if (!categoryName) {
      Alert.alert("Adding Category Failed", "Category name is required");
      return;
    }

    // Perform API request to create a new category
    const response = await fetch(`${BASE_URL}/create-category/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: categoryName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400 && errorData) {
        const errors = Object.entries(errorData).map(
          // @ts-ignore
          ([key, value]) => `${key}: ${value.join(", ")}`
        );
        Alert.alert("Category Adding Failed", errors.join("\n"));
      } else {
        throw new Error(errorData.detail || "An error occurred");
      }
    } else {
      const data = await response.json();

      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity onPress={handleAddCategory}>
          <MaterialIcons name="save" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Category Name Input */}
      <TextInput
        placeholder="Category Name"
        value={categoryName}
        onChangeText={(text) => setCategoryName(text)}
        style={{
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 5,
          padding: 10,
          marginVertical: 20,
        }}
      />

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleAddCategory}
        style={{
          alignItems: "center",
          backgroundColor: "#3498db",
          borderRadius: 8,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Save Category
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddCategory;

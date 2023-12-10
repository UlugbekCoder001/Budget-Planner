import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { BASE_URL } from "@env";
import { SelectList } from "react-native-dropdown-select-list";

const AddOutcome = () => {  
  const accessToken = useSelector((state) => state.token.accessToken);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch(`${BASE_URL}/list-categories/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };

  const handleAddOutcome = async () => {
    if (!amount || !categoryId) {
      Alert.alert("Adding Outcome Failed", "Amount and category are required");
      return;
    }

    // Perform API request to create a new outcome
    const response = await fetch(`${BASE_URL}/add-outcome/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        category: categoryId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400 && errorData) {
        const errors = Object.entries(errorData).map(
          // @ts-ignore
          ([key, value]) => `${key}: ${value.join(", ")}`
        );
        Alert.alert("Outcome Adding Failed", errors.join("\n"));
      } else {
        throw new Error(errorData.detail || "An error occurred");
      }
    } else {
      const data = await response.json();
      console.log("Outcome added successfully", data);

      // Navigate back to the outcomes list or perform any other navigation logic
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
        <TouchableOpacity onPress={handleAddOutcome}>
          <MaterialIcons name="save" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 5,
          padding: 10,
          marginVertical: 20,
        }}
      />

      <SelectList
        setSelected={(val) => setCategoryId(val)}
        data={categories.map((category) => ({
          key: category.id,
          value: category.name,
        }))}
        save="key"
      />

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleAddOutcome}
        style={{
          alignItems: "center",
          backgroundColor: "#3498db",
          borderRadius: 8,
          paddingVertical: 10,
          marginTop: 16
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Save Outcome</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddOutcome;

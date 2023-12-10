import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { SelectList } from "react-native-dropdown-select-list";
import { BASE_URL } from "@env";

const EditOutcome = ({ onCancel, onEdit }) => {   
  const accessToken = useSelector((state) => state.token.accessToken);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const outcomeId = route.params.outcomeId;

  useEffect(() => {
    fetchOutcomeDetails();
    fetchCategories();
  }, [outcomeId]);

  const fetchOutcomeDetails = () => {
    fetch(`${BASE_URL}/get-outcome/${outcomeId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAmount(data.amount.toString());
        setCategoryId(data.category.id);
      })
      .catch((error) => {
        console.error("Error fetching outcome details:", error);
      });
  };

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

  const handleEditOutcome = async () => {
    if (!amount || !categoryId) {
      Alert.alert("Editing Outcome Failed", "Amount and category are required");
      return;
    }

    // Perform API request to edit the outcome
    const response = await fetch(`${BASE_URL}edit-outcome/${outcomeId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        category_id: categoryId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400 && errorData) {
        const errors = Object.entries(errorData).map(
          ([key, value]) => `${key}: ${value.join(", ")}`
        );
        Alert.alert("Outcome Editing Failed", errors.join("\n"));
      } else {
        throw new Error(errorData.detail || "An error occurred");
      }
    } else {
      const data = await response.json();
      console.log("Outcome edited successfully", data);

      // Notify the parent component that the edit is done
      onEdit();
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* Back Button */}
        <TouchableOpacity onPress={onCancel}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity onPress={handleEditOutcome}>
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

      {/* Category Dropdown */}
      <SelectList
        setSelected={(val) => setCategoryId(val)}
        data={categories.map((category) => ({
          key: category.id,
          value: category.name,
        }))}
        save="key"
        selected={categoryId}
      />

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleEditOutcome}
        style={{
          alignItems: "center",
          backgroundColor: "#3498db",
          borderRadius: 8,
          paddingVertical: 10,
          marginTop: 16,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Save Outcome
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditOutcome;

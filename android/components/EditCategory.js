import React, { useState, useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { BASE_URL } from "@env";
import { useSelector } from "react-redux";

const EditCategory = ({ category_id, onCancel, onEdit }) => {
  const [categoryName, setCategoryName] = useState("");
  const accessToken = useSelector((state) => state.token.accessToken);

  useEffect(() => {   
    fetch(`${BASE_URL}/get-category/${category_id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCategoryName(data.name);
      })
      .catch((error) => {
        console.error("Error fetching category details:", error);
      });
  }, [category_id]);

  const handleEdit = () => {
    // Send a request to edit the category
    fetch(`${BASE_URL}/edit-category/${category_id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: categoryName }),
    })
      .then((response) => response.json())
      .then((data) => {
        onEdit();
      })
      .catch((error) => {
        console.error("Error editing category:", error);
      });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Edit Category</Text>
      <TextInput
        value={categoryName}
        onChangeText={setCategoryName}
        placeholder="Category Name"
        style={{
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 5,
          padding: 5,
          marginBottom: 10,
          marginTop: 10
        }}
      />
      <TouchableOpacity
        onPress={handleEdit}
        style={{
          alignItems: "center",
          backgroundColor: "#3498db",
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Edit Category
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onCancel}
        style={{
          alignItems: "center",
          borderColor: 'red',
          borderWidth: 1,
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 20,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "red" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditCategory;

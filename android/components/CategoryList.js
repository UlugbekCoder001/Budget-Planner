import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, Button } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { BASE_URL } from "@env";
import EditCategory from "./EditCategory";

const CategoryList = ({ navigation }) => {
  const accessToken = useSelector((state) => state.token.accessToken);
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, [handleEditDone, handleDelete]);

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
        // console.error("Error fetching categories:", error);
      });
  };

  const handleEdit = (category_id) => {
    // Set the selected category and open the modal
    setSelectedCategory(category_id);
    setModalVisible(true);
  };

  const handleEditDone = () => {
    setModalVisible(false);
    setSelectedCategory(null);

    fetchCategories(); // Refresh the category list
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
  };

  const handleDelete = (categoryId) => {
    // Send a request to delete the category
    fetch(`${BASE_URL}/delete-category/${categoryId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log(`Category with ID ${categoryId} deleted successfully`);
          navigate.goBack();
        } else {
          console.error(`Failed to delete category with ID ${categoryId}`);
        }
      })
      .catch((error) => {
        // console.error("Error deleting category:", error);
      });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log(`Category selected: ${item.category_id}`);
      }}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Text */}
      <Text style={{ flex: 1 }}>{item.name}</Text>

      {/* Icons */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity onPress={() => handleEdit(item.id)}>
          <MaterialIcons name="edit" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center" }}>No Data</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%", // Adjust the width as needed
            }}
          >
            <EditCategory
              category_id={selectedCategory}
              onCancel={closeModal}
              onEdit={handleEditDone}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryList;

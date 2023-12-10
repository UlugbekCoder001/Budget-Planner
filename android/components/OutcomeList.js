import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { BASE_URL } from "@env";
import EditOutcome from "./EditOutcome";

const ListOutcomes = ({ navigation }) => {
  const accessToken = useSelector((state) => state.token.accessToken);
  const [outcomes, setOutcomes] = useState([]);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    fetchOutcomes();
  }, []);

  const fetchOutcomes = () => {
    // Include filters in the fetch URL
    const url = `${BASE_URL}/list-outcomes/?min_price=${minPrice}&max_price=${maxPrice}&created_at=${createdAt}`;

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOutcomes(data);
      })
      .catch((error) => {
        console.error("Error fetching outcomes:", error);
      });
  };

  const handleEdit = (outcome_id) => {
    setSelectedOutcome(outcome_id);
    setModalVisible(true);
  };

  const handleDelete = (outcome_id) => {
    fetch(`${BASE_URL}/delete-outcome/${outcome_id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log(`Outcome with ID ${outcome_id} deleted successfully`);
          fetchOutcomes(); // Refresh the outcome list
        } else {
          console.error(`Failed to delete outcome with ID ${outcome_id}`);
        }
      })
      .catch((error) => {
        console.error("Error deleting outcome:", error);
      });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOutcome(null);
  };

  const renderOutcomeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log(`Outcome selected: ${item.outcome_id}`);
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
      <Text style={{ flex: 1 }}>{item.amount}</Text>
      <Text style={{ flex: 1 }}>{item.category_name}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity onPress={() => handleEdit(item.outcome_id)}>
          <MaterialIcons name="edit" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.outcome_id)}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Filter Inputs */}
      <View style={{ flexDirection: "row", marginBottom: 10, marginTop: 10 }}>
        <TextInput
          placeholder="Min Price"
          keyboardType="numeric"
          value={minPrice}
          onChangeText={(text) => setMinPrice(text)}
          style={{ flex: 1, marginRight: 10, borderWidth: 1, padding: 8, borderRadius: 8 }}
        />
        <TextInput  
          placeholder="Max Price"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={(text) => setMaxPrice(text)}
          style={{ flex: 1, marginRight: 10, borderWidth: 1, padding: 8, borderRadius: 8 }}
        />
        <Button title="Apply Filters" onPress={fetchOutcomes} />
      </View>

      <FlatList
        data={outcomes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOutcomeItem}
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
            <EditOutcome
              outcome_id={selectedOutcome}
              onCancel={closeModal}
              onEdit={fetchOutcomes}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListOutcomes;

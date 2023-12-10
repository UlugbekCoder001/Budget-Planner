import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { View } from "native-base";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { BASE_URL } from "@env";
import { PieChart } from "react-native-chart-kit";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const Home = () => {
  const accessToken = useSelector((state) => state.token.accessToken);
  const [modalVisible, setModalVisible] = useState(false);
  const [balance, setBalance] = useState(0);
  const [viewMode, setViewMode] = useState("pieChart");
  const [outcomeData, setOutcomeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getChartColor = (index) => {
    const predefinedColors = [
      "#FF5733",
      "#33FF57",
      "#5733FF",
      "#FF5733",
      "#33FF57",
      "#5733FF",
      "#FFD700",
      "#00BFFF",
    ];

    return predefinedColors[index % predefinedColors.length];
  };

  const chartColors = outcomeData.map((_, index) => getChartColor(index));

  const navigate = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchBalance();
      if (viewMode === "pieChart") {
        fetchOutcomeData();
      }
    }, [accessToken])
  );

  const fetchBalance = () => {
    fetch(`${BASE_URL}get-balance`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setBalance(data.balance);
      })
      .catch((error) => {
        console.error("Error fetching balance:", error);
      });
  };

  const fetchOutcomeData = () => {
    setLoading(true);
    fetch(`${BASE_URL}list-outcomes-with-statistics/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.map((item, index) => ({
          // ...item,
          name: item.category_name,
          total_amount: parseFloat(item.total_amount) || 1,
          percentage: item.percentage.toFixed(2) || 0,
          color: getChartColor(index),
        }));
        setOutcomeData(processedData);
        setLoading(false);
        console.log(processedData);
      })
      .catch((error) => {
        console.error("Error fetching outcomes with statistics:", error);
        setLoading(false);
      });
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleBalanceChange = (text) => {
    setBalance(text);

    fetch(`${BASE_URL}/edit-balance/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: text,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error("Error editing balance:", error);
      });
  };

  const toggleViewMode = () => {
    fetchOutcomeData();
    setViewMode((prevMode) =>
      prevMode === "pieChart" ? "outcomeList" : "pieChart"
    );
  };

  const renderOutcomeItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
      }}
    >
      <Text>{item.name || "No Data"}</Text>
      <Text>{item.total_amount || "0.00"}</Text>
      <Text>{item.percentage || "0.00"}%</Text>
    </View>
  );

  // Default dataset for PieChart when there's no data
  const defaultPieChartData = [
    { total_amount: 1, color: "#999999", name: "No Data" },
  ];

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View
        style={{ flexDirection: "row", justifyContent: "space-between" }}
        mt={5}
      >
        {/* Filter Button */}
        <TouchableOpacity >
          <MaterialIcons name="filter-list" size={24} color="black" />
        </TouchableOpacity>

        {/* Balance Input */}
        <TextInput
          value={balance.toString()}
          onChangeText={handleBalanceChange}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 5,
            padding: 5,
            width: 100,
            textAlign: "center",
          }}
        />

        {/* User Profile Icon */}
        <TouchableOpacity onPress={() => navigate.navigate("ProfileUpdate")}>
          <MaterialIcons name="person" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {viewMode === "pieChart" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <PieChart
              data={outcomeData.length > 0 ? outcomeData : defaultPieChartData}
              width={300}
              height={200}
              chartConfig={{
                backgroundGradientFrom: "#1E2923",
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: "#08130D",
                backgroundGradientToOpacity: 0.5,
                color: (opacity = 0.5) => `rgba(26, 255, 146, ${opacity})`,
                strokeWidth: 2,
                barPercentage: 0.5,
                useShadowColorFromDataset: false,
              }}
              accessor={"total_amount"}
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1, marginTop: 20 }}>
          <FlatList
            data={outcomeData}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={renderOutcomeItem}
            ListEmptyComponent={
              <Text style={{ textAlign: "center" }}>No Data</Text>
            }
          />
        </View>
      )}

      <TouchableOpacity
        onPress={toggleViewMode}
        style={{
          alignItems: "center",
          backgroundColor: "#3498db",
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 20,
          marginBottom: 35,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Toggle View</Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "gray",
          paddingTop: 10,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
          }}
          onPress={() => navigate.navigate("AddOutcome")}
        >
          <MaterialIcons name="add" size={24} color="black" />
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            Add
          </Text>
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            Outcome
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
          }}
          onPress={() => navigate.navigate("ListOutcomes")}
        >
          <MaterialIcons name="list" size={24} color="black" />
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            List of
          </Text>
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            Outcomes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
          }}
          onPress={() => navigate.navigate("AddCategory")}
        >
          <MaterialIcons name="add-box" size={24} color="black" />
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            Add
          </Text>
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            Category
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
          }}
          onPress={() => navigate.navigate("CategoryList")}
        >
          <MaterialIcons name="view-module" size={24} color="black" />
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            List of
          </Text>
          <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 12 }}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
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
            style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
          >
            <Text>Filter Modal</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;

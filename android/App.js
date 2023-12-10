import React from "react";
import {
  Text,
  Link,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  NativeBaseProvider,
  extendTheme,
  VStack,
  Box,
} from "native-base";
import NativeBaseIcon from "./components/NativeBaseIcon";
import { Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import { NavigationContainer } from "@react-navigation/native";
import store from './src/redux/store';
import { Provider } from 'react-redux';
import Home from "./components/Home";
import CategoryList from "./components/CategoryList";
import AddCategory from "./components/AddCategory";
import ListOutcomes from "./components/OutcomeList";
import AddOutcome from "./components/AddOutcome";
import EditOutcome from "./components/EditOutcome";
import UpdateProfile from "./components/ProfileUpdate";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CategoryList"
            component={CategoryList}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddCategory"
            component={AddCategory}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ListOutcomes"
            component={ListOutcomes}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddOutcome"
            component={AddOutcome}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditOutcome"
            component={EditOutcome}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileUpdate"
            component={UpdateProfile}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
    </Provider>
    
  );
}

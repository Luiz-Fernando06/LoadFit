import { StatusBar } from "expo-status-bar";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TelaLogin from "./src/telas/TelaLogin";

import TelaMenu from "./src/telas/TelaMenu";

import TelaCadastro from "./src/telas/TelaCadastro";


const Stack = createNativeStackNavigator();


export default function App() {

  return (

    <NavigationContainer>

      <StatusBar style="dark" />

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >

        <Stack.Screen
          name="Login"
          component={TelaLogin}
        />

        <Stack.Screen
          name="Menu"
          component={TelaMenu}
        />

        <Stack.Screen
          name="Cadastro"
          component={TelaCadastro}
        />

      </Stack.Navigator>

    </NavigationContainer>

  );
}
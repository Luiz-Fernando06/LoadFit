import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  View,
  StyleSheet,
  Platform
} from "react-native";

import TelaLogin from "./src/telas/TelaLogin";
import TelaMenu from "./src/telas/TelaMenu";
import TelaCadastro from "./src/telas/TelaCadastro";
import TelaCadastroCaminhao from "./src/telas/TelaCadastroCaminhao";
import TelaMateriais from "./src/telas/TelaMateriais";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <View style={styles.pagina}>

      <View style={styles.appMobile}>

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

            <Stack.Screen
              name="CadastroCaminhao"
              component={TelaCadastroCaminhao}
            />

            <Stack.Screen
              name="Materiais"
              component={TelaMateriais}
            />

          </Stack.Navigator>

        </NavigationContainer>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  pagina: {
    flex: 1,

    alignItems:
      Platform.OS === "web"
        ? "center"
        : "stretch",

    backgroundColor:
      Platform.OS === "web"
        ? "#D1D5DB"
        : "#F8FAFC"
  },

  appMobile: {
    flex: 1,
    width: "100%",

    maxWidth: //codigo para apresentar modo mobile no navegador //
      Platform.OS === "web"
        ? 430
        : undefined,

    backgroundColor: "#F8FAFC"
  }

});

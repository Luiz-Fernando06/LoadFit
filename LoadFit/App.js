import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TelaLogin from "./src/telas/TelaLogin";
import TelaMenu from "./src/telas/TelaMenu";
import TelaCadastro from "./src/telas/TelaCadastro";
import TelaCadastroCaminhao from "./src/telas/TelaCadastroCaminhao"; // Importação da nova tela

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
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Menu" component={TelaMenu} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="CadastroCaminhao" component={TelaCadastroCaminhao} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

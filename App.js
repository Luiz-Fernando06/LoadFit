import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TelaLogin from "./src/telas/TelaLogin";
import TelaMenu from "./src/telas/TelaMenu";
import TelaCadastro from "./src/telas/TelaCadastro";
import TelaCadastroCaminhao from "./src/telas/TelaCadastroCaminhao"; 
import TelaCadastroMateriais from "./src/telas/TelaCadastroMateriais";
import TelaCadastroCliente from "./src/telas/TelaCadastroCliente";
import TelaCadastroMotorista from "./src/telas/TelaCadastroMotorista";
import OrganizarCarga from "./src/OrganizarCarga";
import Pedidos from "./src/Pedidos";
import CriarRotas from "./src/CriarRotas";

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
        <Stack.Screen name="CadastroMaterial" component={TelaCadastroMateriais} />
        <Stack.Screen name="CadastroCliente" component={TelaCadastroCliente} />
        <Stack.Screen name="CadastroMotorista" component={TelaCadastroMotorista} />
        <Stack.Screen name="OrganizarCarga" component={OrganizarCarga} />
        <Stack.Screen name="CadastroPedido" component={Pedidos} />
        <Stack.Screen  name="CriarRota" component={CriarRotas}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

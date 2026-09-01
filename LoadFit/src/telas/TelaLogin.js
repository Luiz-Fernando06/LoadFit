//O useState é usado para armazenar valores que mudam enquanto o app esta sendo usado
import { useState } from "react";

import {
    //Serve para gerar container (montar layout)
    View,

    //Serve para gerar textos
    Text,

    //Serve para receber entrada do usuario
    TextInput,

    //Serve para dizer que esse componente pode ser clicado, direcionando para algo
    Pressable,

    //Serve para criar os estilos CSS no react-native
    StyleSheet,

    //Monta uma caixa de aviso nativo do celular
    Alert,

    //Serve para impedir que o teclado virtual do celular fique em cima dos campos da tela.
    KeyboardAvoidingView,

    //Serve para descobrir em qual S.O o app esta rodando
    Platform
} from "react-native";

//Biblioteca para responsividade da tela do app, para não ocupar a barra de status e a de navegação 
import { SafeAreaView } from "react-native-safe-area-context";

//Esse componente pode ser importado por outro arquivo
export default function TelaLogin({ navigation  }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    function entrar() {

        if (!email.trim() || !senha.trim()) {
            Alert.alert(
                "Campos obrigatórios",
                "Preencha o e-mail e a senha."
            );

            return;
        }

        navigation.replace("Menu");
    }

    return(
        
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.content} 
            behavior={Platform.OS === "ios" ? "padding" : undefined}>

                <View style={styles.logo}>
                    <Text style={styles.logoText}>Luiz Fernando,
            Thadeu,
            Guilherme,
            Gustavo</Text>
                </View>

                <Text style={styles.subtitulo}>
                    Organizador de Cargas
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>E-mail</Text>

                    <TextInput
                         style={styles.input}
                         placeholder="Digite seu e-mail"
                         keyboardType="email-address"
                         autoCapitalize="none"
                         value={email}
                         onChangeText={setEmail}
                    />


                    <Text style={styles.label}>Senha</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        secureTextEntry
                        value={senha}
                        onChangeText={setSenha}
                    />


                    <Pressable style={styles.botao} onPress={entrar}>
                        <Text style={styles.textoBotao}>Entrar</Text>
                    </Pressable>

                    <Pressable>
                      <Text style={styles.botaoCadastro} onPress={() => navigation.navigate("Cadastro")}>Criar Usuario</Text>
                    </Pressable>
                      
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20
  },

  subtitulo: {
    fontSize: 15,
    textAlign: "center",
    color: "#64748B",
    marginTop: 5,
    marginBottom: 40
  },

  form: {
    width: "100%"
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    marginBottom: 20
  },

  botao: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold"
  },

  botaoCadastro: {
    color: "#004ffa",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20
  }

});

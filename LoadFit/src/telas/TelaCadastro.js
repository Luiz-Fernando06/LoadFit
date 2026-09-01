import { useState } from "react";

import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Button
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function TelaCadastro({navigation}) {

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    function cadastrar() {
        if (!nome.trim() || !email.trim() || !senha.trim()) {
            Alert.alert(
                "Campos obrigatórios",
                "Preencha o e-mail e a senha."
            );

            return;
        }

        navigation.navigate("Login")
    }

    return (

        <SafeAreaView style={styles.container}>

            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >


                    <View style={styles.header}>

                        <Pressable
                            style={styles.botaoVoltar}
                            onPress={() => navigation.goBack()}
                        >

                            <Text style={styles.textoVoltar}>
                                ←
                            </Text>

                        </Pressable>


                        <Text style={styles.titulo}>
                           Luiz Fernando,
            Thadeu,
            Guilherme,
            Gustavo
                        </Text>

                    </View>


                    <Text style={styles.descricao}>
                        Preencha os dados abaixo para cadastrar um novo usuário.
                    </Text>


                    <View style={styles.form}>


                        <Text style={styles.label}>
                            Nome
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome"
                            value={nome}
                            onChangeText={setNome}
                        />


                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu e-mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />


                        <Text style={styles.label}>
                            Senha
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua senha"
                            secureTextEntry
                            value={senha}
                            onChangeText={setSenha}
                        />


                        <Pressable style={styles.botaoCadastrar} onPress={cadastrar}>
                            <Text style={styles.textoBotao}>Cadastrar</Text>
                        </Pressable>

                    </View>


                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8FAFC"
    },


    keyboard: {
        flex: 1
    },


    content: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 15,
        paddingBottom: 30
    },


    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15
    },


    botaoVoltar: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },


    textoVoltar: {
        fontSize: 24,
        color: "#0F172A"
    },


    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0F172A"
    },


    descricao: {
        color: "#64748B",
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 30
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
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 20
    },


    botaoCadastrar: {
        height: 55,
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
    }

});
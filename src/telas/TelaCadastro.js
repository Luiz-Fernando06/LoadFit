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
    useWindowDimensions,
    Image
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";


export default function TelaCadastro({ navigation }) {

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    // Retorna a largura atual da tela
    const { width } = useWindowDimensions();

    // Consideramos desktop/tablet telas maiores que 768px
    const isDesktop = width >= 768;


    function cadastrar() {

        if (!nome.trim() || !email.trim() || !senha.trim()) {

            Alert.alert(
                "Campos obrigatórios",
                "Preencha o nome, e-mail e a senha."
            );

            return;
        }

        navigation.navigate("Login");
    }


    return (

        <SafeAreaView style={styles.container}>

            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    <View
                        style={[
                            styles.content,
                            isDesktop && styles.contentDesktop
                        ]}
                    >

                        {/* Botão voltar */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.botaoVoltar,
                                pressed && styles.botaoVoltarPressionado
                            ]}
                            onPress={() => navigation.goBack()}
                        >

                            <Image source={require("../../assets/voltar.png")} 
                            style={styles.imageVoltar}/>

                        </Pressable>


                        {/* Cabeçalho */}
                        <View style={styles.header}>

                            <Text style={styles.titulo}>
                                Criar conta
                            </Text>

                            <Text style={styles.descricao}>
                                Preencha seus dados para começar a utilizar o LoadFit.
                            </Text>

                        </View>


                        {/* Formulário */}
                        <View style={styles.form}>

                            {/* Nome */}
                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Nome
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite seu nome"
                                    placeholderTextColor="#8B949E"
                                    autoCapitalize="words"
                                    value={nome}
                                    onChangeText={setNome}
                                />

                            </View>


                            {/* Email */}
                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    E-mail
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite seu e-mail"
                                    placeholderTextColor="#8B949E"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                />

                            </View>


                            {/* Senha */}
                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Senha
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Crie uma senha"
                                    placeholderTextColor="#8B949E"
                                    secureTextEntry
                                    value={senha}
                                    onChangeText={setSenha}
                                />

                            </View>


                            {/* Botão */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.botaoCadastrar,
                                    pressed && styles.botaoPressionado
                                ]}
                                onPress={cadastrar}
                            >

                                <Text style={styles.textoBotao}>
                                    Criar conta
                                </Text>

                            </Pressable>


                            {/* Link para login */}
                            <View style={styles.areaLogin}>

                                <Text style={styles.textoLogin}>
                                    Já possui uma conta?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        navigation.navigate("Login")
                                    }
                                >

                                    <Text style={styles.botaoLogin}>
                                        Entrar
                                    </Text>

                                </Pressable>

                            </View>

                        </View>

                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>

    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,

        // Mesmo fundo utilizado na tela de login
        backgroundColor: "#e4b89e"
    },


    keyboard: {
        flex: 1
    },


    scrollContent: {
        flexGrow: 1,

        justifyContent: "center",

        paddingVertical: 40,
        paddingHorizontal: 20
    },


    /*
        O conteúdo ocupa 100% no celular,
        mas não passa de 440px no computador.
    */
    content: {
        width: "100%",
        maxWidth: 440,

        alignSelf: "center"
    },


    contentDesktop: {
        paddingHorizontal: 10
    },


    /*
        Botão de voltar separado do título.
        Isso deixa o cabeçalho mais limpo.
    */
    botaoVoltar: {
        width: 42,
        height: 42,

        borderRadius: 10,

        backgroundColor: "#e4b89e",

        borderWidth: 1,
        borderColor: "#e4b89e",

        justifyContent: "center",
        alignItems: "center",

        marginBottom: 28
    },


    botaoVoltarPressionado: {
        opacity: 0.7
    },


    imageVoltar: {
        width: 24,
        height: 24,
        resizeMode: "contain"
    },


    header: {
        marginBottom: 32
    },


    titulo: {
        fontSize: 30,

        fontWeight: "700",

        color: "#20262E",

        letterSpacing: -0.5
    },


    descricao: {
        fontSize: 14,

        lineHeight: 21,

        color: "#6B7280",

        marginTop: 8
    },


    form: {
        width: "100%"
    },


    campo: {
        marginBottom: 19
    },


    label: {
        fontSize: 14,

        fontWeight: "600",

        color: "#303842",

        marginBottom: 8
    },


    input: {
        width: "100%",

        minHeight: 52,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,

        // Mesmo tom utilizado no login
        borderColor: "#7a3f074d",

        borderRadius: 9,

        paddingHorizontal: 15,

        fontSize: 16,

        color: "#20262E"
    },


    botaoCadastrar: {
        width: "100%",

        minHeight: 52,

        backgroundColor: "#252B33",

        borderRadius: 9,

        justifyContent: "center",
        alignItems: "center",

        marginTop: 7
    },


    botaoPressionado: {
        opacity: 0.85
    },


    textoBotao: {
        color: "#FFFFFF",

        fontSize: 16,

        fontWeight: "600"
    },


    areaLogin: {
        flexDirection: "row",

        justifyContent: "center",
        alignItems: "center",

        flexWrap: "wrap",

        marginTop: 22
    },


    textoLogin: {
        color: "#6B7280",

        fontSize: 13,

        marginRight: 5
    },


    botaoLogin: {
        color: "#C96A22",

        fontSize: 13,

        fontWeight: "700"
    }

});
// O useState é usado para armazenar valores que mudam enquanto o app está sendo usado.
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
    useWindowDimensions
} from "react-native";

// Evita que o conteúdo fique embaixo da barra de status
// e da área de navegação do celular.
import { SafeAreaView } from "react-native-safe-area-context";


export default function TelaLogin({ navigation }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    // Retorna a largura atual da tela.
    // Muda automaticamente caso a janela seja redimensionada.
    const { width } = useWindowDimensions();

    // Consideramos desktop/tablet telas maiores que 768px.
    const isDesktop = width >= 768;


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


    return (

        <SafeAreaView style={styles.container}>

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >

                    <View
                        style={[
                            styles.content,
                            isDesktop && styles.contentDesktop
                        ]}
                    >

                        {/* Identidade do sistema */}
                        <View style={styles.header}>

                            <View style={styles.logo}>

                                <Text style={styles.logoIcon}>
                                    LF
                                </Text>

                            </View>

                            <Text style={styles.nomeSistema}>
                                LoadFit
                            </Text>

                            <Text style={styles.subtitulo}>
                                Organização inteligente de cargas
                            </Text>

                        </View>


                        {/* Formulário */}
                        <View style={styles.form}>

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


                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Senha
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite sua senha"
                                    placeholderTextColor="#8B949E"
                                    secureTextEntry
                                    value={senha}
                                    onChangeText={setSenha}
                                />

                            </View>


                            <Pressable
                                style={({ pressed }) => [
                                    styles.botao,
                                    pressed && styles.botaoPressionado
                                ]}
                                onPress={entrar}
                            >

                                <Text style={styles.textoBotao}>
                                    Entrar
                                </Text>

                            </Pressable>


                            <View style={styles.areaCadastro}>

                                <Text style={styles.textoCadastro}>
                                    Ainda não possui uma conta?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        navigation.navigate("Cadastro")
                                    }
                                >

                                    <Text style={styles.botaoCadastro}>
                                        Criar usuário
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

    // Tela inteira
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6"
    },


    keyboardContainer: {
        flex: 1
    },


    // Permite centralizar verticalmente,
    // mas continua funcionando caso a tela seja pequena.
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20
    },


    // Container principal.
    // width 100% para celular.
    content: {
        width: "100%",
        maxWidth: 440,
        alignSelf: "center"
    },


    // Pequena adaptação exclusiva para telas maiores.
    contentDesktop: {
        paddingHorizontal: 10
    },


    header: {
        alignItems: "center",
        marginBottom: 38
    },


    // Símbolo simples da marca.
    logo: {
        width: 64,
        height: 64,

        borderRadius: 16,

        backgroundColor: "#252B33",

        justifyContent: "center",
        alignItems: "center",

        marginBottom: 18
    },


    logoIcon: {
        color: "#F28C28",

        fontSize: 19,
        fontWeight: "800",

        letterSpacing: 1
    },


    nomeSistema: {
        fontSize: 30,

        fontWeight: "700",

        color: "#20262E",

        letterSpacing: -0.5
    },


    subtitulo: {
        fontSize: 14,

        color: "#6B7280",

        textAlign: "center",

        marginTop: 7
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

        borderWidth: 1,
        borderColor: "#D5DAE0",

        borderRadius: 9,

        paddingHorizontal: 15,

        backgroundColor: "#FFFFFF",

        color: "#20262E",

        fontSize: 16
    },


    botao: {
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


    areaCadastro: {
        flexDirection: "row",

        justifyContent: "center",
        alignItems: "center",

        flexWrap: "wrap",

        marginTop: 22
    },


    textoCadastro: {
        color: "#6B7280",

        fontSize: 13,

        marginRight: 5
    },


    botaoCadastro: {
        color: "#C96A22",

        fontSize: 13,

        fontWeight: "700"
    }

});
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
    Platform,

    //Serve para exibir imagens dentro do aplicativo
    Image

} from "react-native";

//Biblioteca para responsividade da tela do app, para não ocupar a barra de status e a de navegação 
import { SafeAreaView } from "react-native-safe-area-context";

//Importa a configuração da API para comunicação com o backend
import { api } from "../servicos/api";


//Esse componente pode ser importado por outro arquivo
export default function TelaLogin({ navigation }) {

    //Armazena o e-mail digitado pelo usuario
    const [email, setEmail] = useState("");

    //Armazena a senha digitada pelo usuario
    const [senha, setSenha] = useState("");

    //Controla se o login esta sendo processado
    const [carregando, setCarregando] = useState(false);


    // Enquanto o banco ainda estiver sendo configurado, este modo permite
    // continuar testando as telas quando a API estiver fora do ar.
    // Quando o SQL estiver pronto, troque EXPO_PUBLIC_MODO_TESTE para false.
    const modoTeste = process.env.EXPO_PUBLIC_MODO_TESTE === "true";


    //Função utilizada quando o usuario clicar no botão Entrar
    async function entrar() {

        //Verifica se o usuario deixou algum campo vazio
        if (!email.trim() || !senha.trim()) {

            Alert.alert(
                "Campos obrigatórios",
                "Preencha o e-mail e a senha."
            );

            return;
        }


        try {

            //Informa que o login começou a ser processado
            setCarregando(true);


            //Envia os dados digitados para a API
            await api("/login", {

                method: "POST",

                body: JSON.stringify({

                    //Remove espaços e transforma o e-mail em letras minusculas
                    email: email.trim().toLowerCase(),

                    //Envia a senha digitada
                    senha

                })

            });


            //Se o login estiver correto, direciona o usuario para o Menu
            navigation.replace("Menu");


        } catch (erro) {

            // Só libera o acesso de teste quando NÃO houve resposta da API.
            // Erros 401/400 continuam bloqueando o login normalmente.
            if (modoTeste && !erro.status) {

                navigation.replace("Menu");

                return;
            }


            //Mostra uma mensagem caso aconteça algum erro durante o login
            Alert.alert(
                "Não foi possível entrar",
                erro.message
            );


        } finally {

            //Finaliza o estado de carregamento
            setCarregando(false);

        }

    }


    return (

        //SafeAreaView impede que os componentes fiquem embaixo
        //das barras do sistema operacional
        <SafeAreaView style={styles.container}>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : undefined
                }
            >


                {/* Logo do aplicativo */}
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />


                {/* Subtitulo da aplicação */}
                <Text style={styles.subtitulo}>
                    Organizador de Cargas
                </Text>


                {/* Container que possui os campos do formulario */}
                <View style={styles.form}>


                    {/* Campo de E-mail */}
                    <Text style={styles.label}>
                        E-mail
                    </Text>


                    <TextInput

                        style={styles.input}

                        placeholder="Digite seu e-mail"

                        //Exibe teclado adequado para digitação de e-mail
                        keyboardType="email-address"

                        //Impede letras maiusculas automaticamente
                        autoCapitalize="none"

                        //Valor armazenado no estado email
                        value={email}

                        //Atualiza o estado sempre que o usuario digitar
                        onChangeText={setEmail}

                    />


                    {/* Campo de Senha */}
                    <Text style={styles.label}>
                        Senha
                    </Text>


                    <TextInput

                        style={styles.input}

                        placeholder="Digite sua senha"

                        //Esconde os caracteres digitados
                        secureTextEntry

                        //Valor armazenado no estado senha
                        value={senha}

                        //Atualiza a senha conforme o usuario digita
                        onChangeText={setSenha}

                    />


                    {/* Botão para realizar o login */}
                    <Pressable

                        style={[
                            styles.botao,

                            //Aplica o estilo caso esteja carregando
                            carregando &&
                            styles.botaoDesabilitado
                        ]}

                        //Chama a função entrar
                        onPress={entrar}

                        //Impede vários cliques enquanto estiver carregando
                        disabled={carregando}

                    >

                        <Text style={styles.textoBotao}>

                            {
                                carregando
                                    ? "Entrando..."
                                    : "Entrar"
                            }

                        </Text>

                    </Pressable>


                    {/* Botão para abrir a tela de cadastro */}
                    <Pressable

                        onPress={() =>
                            navigation.navigate("Cadastro")
                        }

                    >

                        <Text style={styles.botaoCadastro}>
                            Criar Usuario
                        </Text>

                    </Pressable>


                </View>


            </KeyboardAvoidingView>


        </SafeAreaView>

    );

}


//Estilos utilizados pelos componentes da tela
const styles = StyleSheet.create({

    //Container principal da tela
    container: {

        flex: 1,

        backgroundColor: "#F8FAFC"

    },


    //Container onde fica todo o conteudo
    content: {

        flex: 1,

        justifyContent: "center",

        paddingHorizontal: 30

    },


    //Estilo da logo
    logo: {

        width: 190,

        height: 130,

        alignSelf: "center",

        marginBottom: 10

    },


    //Texto abaixo da logo
    subtitulo: {

        fontSize: 15,

        textAlign: "center",

        color: "#64748B",

        marginTop: 5,

        marginBottom: 40

    },


    //Container do formulario
    form: {

        width: "100%"

    },


    //Texto que fica acima dos inputs
    label: {

        fontSize: 15,

        fontWeight: "600",

        color: "#334155",

        marginBottom: 7

    },


    //Estilo dos campos de entrada
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


    //Botão Entrar
    botao: {

        height: 52,

        backgroundColor: "#2563EB",

        borderRadius: 10,

        justifyContent: "center",

        alignItems: "center",

        marginTop: 10

    },


    //Estilo utilizado enquanto o login esta carregando
    botaoDesabilitado: {

        opacity: 0.65

    },


    //Texto dentro do botão Entrar
    textoBotao: {

        color: "#FFFFFF",

        fontSize: 16,

        fontWeight: "bold"

    },


    //Texto utilizado para acessar a tela de cadastro
    botaoCadastro: {

        color: "#004ffa",

        fontSize: 13,

        fontWeight: "600",

        textAlign: "center",

        marginTop: 20

    }

});

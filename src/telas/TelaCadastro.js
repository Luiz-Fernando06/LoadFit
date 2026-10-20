import { useState } from "react"; //Guarda as informaçoes

import {
    View, // Conteiner, é como se fosse o div do html

    Text, //Exibe os textos

    TextInput, //Cria campos para digitar

    Pressable, //É como se fosse o botao, so que com mais facilidade de personalizar, respondem a toques ou cliques

    StyleSheet, // É o componente que organiza todo o estilo da interface, é dentro dele que a interface é feita

    KeyboardAvoidingView, //Componente para responsividade do app, que impede que o teclado do celular oculte algum elemento da tela

    Platform, // Identifica qual plataforma esta sendo excutada o app

    ScrollView, //Permite rolar a tela quando o conteúdo não cabe.

    useWindowDimensions, //Obtém as dimensões atuais da janela.

    Image //Exibe imagens

} from "react-native";

//ajuda a manter o conteúdo dentro da área segura da tela.
import { SafeAreaView } from "react-native-safe-area-context"; 

//importa o cliente do Supabase e uma variável de controle da configuração.
//Onde permite que o aplicativo se comunique com o servidor do Supabase
import { supabase, supabaseConfigurado } from "../servicos/supabase"; 

/*
Aqui to criando uma função que pode ser importada por outros arquivos e que recebe
o objeto navigation, que me permite navegar entre outras telas(arquivos).
*/
export default function TelaCadastro({ navigation }) {

    /*
    Aqui crio uma variavel que contem dois elementos, onde uma guarda o estado atual e 
    outro a alteração desse estado, onde essas variaveis estão sendo atribuidas ao useState
    com o valor inicial de uma string vazia e outro com o valor logico sendo falso.
    */
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false); //Controla se o processo de cadastro esta em andamento ou não
    const [mensagem, setMensagem] = useState(""); //Guarda as mensagens de instruçoes do app

    // Retorna apenas a largura atual da tela
    const dimensoes = useWindowDimensions();
    const largura = dimensoes.width;

    // Aqui to querendo saber se vai ser desktop/tablet ou não, considerando que as telas dos desktop/tablet são maiores que 768px
    const isDesktop = largura >= 768;

    /*
    Aqui to criando uma função que vai funcionar como botao, que pode guarda 
    operaçõs assicronas, caso demore cadastrar um usuario
    */
    async function cadastrar() {

        //A cada execução do botão cadstrar ele limpa a mensagem anterior
        setMensagem("");

        //Trim() -> remove espaço do começo e do final da frase

        if (!nome.trim() || !email.trim() || !senha.trim()) {
            setMensagem("Preencha o nome, e-mail e a senha.");
            return;
        }

        //include() -> verifica se uma string possui determinado trecho

        if (!email.includes("@") || !email.includes(".")) {
            setMensagem("Digite um endereço de e-mail válido.");
            return;
        }

        //length -> conta o comprimento da variavel

        if (senha.length < 6) {
            setMensagem("A senha deve possuir pelo menos 6 caracteres.");
            return;
        }

        //Caso a configuração com o servidor não tenha sido feita ainda
        if (!supabaseConfigurado) {
            setMensagem("Erro no servidor da aplicação! Os moderadores estão resolvendo.");
            return;
        }

        //Estado de cadastro em andamento
        setCarregando(true);

        /*
        Aqui eu to criando uma exceção, com uma variavel que pega os dados do usuario e o erro caso a atentificação falhar,
        onde dentro dela tenho o cliente supabase com seus recursos de autentificação e solicito a criação de uma conta, 
        onde o comando await aguarda a conclusão da operação assíncrona antes de executar a próxima linha.  
        */
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(), // toLowerCase -> Converte as letras maiusculas em minusculas
                password: senha,
                options: {
                    data: { nome: nome.trim() } //Aqui envio o nome que é uma coisas a mais que tem no cadastro alem de email e senha
                }
            });

            if (error) throw error; //Se o Supabase retornar um erro, o código o lança com throw.
            //Isso interrompe a execução normal do bloco try e transfere o controle para o catch.

            //Se a autentificação foi feita com sucesso vai oferecer uma sessão para o usuario supabase e direciona para o menu
            if (data.session) {
                navigation.replace("Menu");
            } else {
                setMensagem("Conta criada. Confirme seu e-mail para depois entrar no sistema.");
            }
        } 
catch (erro) {
    console.error("Erro ao criar conta:", erro);

    const texto = (erro.message || "").toLowerCase();

    if (
        texto.includes("already registered") ||
        texto.includes("already been registered")
    ) {
        setMensagem("Já existe uma conta cadastrada com esse e-mail.");
    } else {
        setMensagem("Não foi possível criar a conta. Tente novamente mais tarde.");
    }
        } finally {
            //Caso tudo falhe ou de certo volta ao estado normal do cadastro
            setCarregando(false);
        }
    }


    return (

        <SafeAreaView style={styles.container}>

            {/*Se a plataforma for iOS, o comportamento do teclado será "padding". Nas demais plataformas, essa propriedade recebe undefined.*/}
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >

                {/* 
                    1. contentContainerStyle: aplica estilo ao contêiner interno do conteúdo.
                    2. keyboardShouldPersistTaps="handled": permite que toques sejam tratados pelos componentes apropriados mesmo com o teclado aberto.
                    3. showsVerticalScrollIndicator={false}: oculta o indicador vertical de rolagem. 
                */}
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


                            {/* Mensagens de validação, erro ou sucesso */}
                            {mensagem ? (
                                <Text style={styles.mensagemCadastro}>
                                    {mensagem}
                                </Text>
                            ) : null}

                            {/* Botão */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.botaoCadastrar,
                                    pressed && styles.botaoPressionado,
                                    carregando && styles.botaoDesabilitado
                                ]}
                                onPress={cadastrar}
                                disabled={carregando}
                            >

                                <Text style={styles.textoBotao}>
                                    {carregando ? "Criando conta..." : "Criar conta"}
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


    mensagemCadastro: {
        color: "#B91C1C",
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
        padding: 10,
        fontSize: 13,
        textAlign: "center",
        marginBottom: 12
    },

    botaoDesabilitado: {
        opacity: 0.65
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
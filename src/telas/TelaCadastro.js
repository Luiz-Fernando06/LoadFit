//O useState é utilizado para armazenar os dados digitados no formulário
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

//Importa a conexão com o Supabase
import {
  supabase,
  supabaseConfigurado
} from "../servicos/supabase";


export default function TelaCadastro({ navigation }) {

  //Armazena o nome digitado pelo usuário
  const [nome, setNome] = useState("");

  //Armazena o e-mail digitado pelo usuário
  const [email, setEmail] = useState("");

  //Armazena a senha digitada pelo usuário
  const [senha, setSenha] = useState("");

  //Armazena a confirmação da senha
  const [confirmarSenha, setConfirmarSenha] = useState("");

  //Controla o botão enquanto o cadastro é processado
  const [carregando, setCarregando] = useState(false);

  //Armazena mensagens que serão exibidas na própria tela
  const [mensagem, setMensagem] = useState("");

  //Controla o tipo da mensagem:
  //erro, sucesso ou informação
  const [tipoMensagem, setTipoMensagem] = useState("");


  //Função responsável pelo cadastro do usuário no Supabase Auth
  async function cadastrar() {

    //Limpa mensagens anteriores
    setMensagem("");
    setTipoMensagem("");


    //Verifica se todos os campos foram preenchidos
    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !confirmarSenha.trim()
    ) {

      setTipoMensagem("erro");

      setMensagem(
        "Preencha todos os campos."
      );

      return;
    }


    //Faz uma validação simples do e-mail
    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {

      setTipoMensagem("erro");

      setMensagem(
        "Digite um endereço de e-mail válido."
      );

      return;
    }


    //O Supabase aceita a senha, porém mantemos uma regra mínima no aplicativo
    if (senha.length < 6) {

      setTipoMensagem("erro");

      setMensagem(
        "A senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }


    //Confere se as duas senhas são iguais
    if (senha !== confirmarSenha) {

      setTipoMensagem("erro");

      setMensagem(
        "A senha e a confirmação precisam ser iguais."
      );

      return;
    }


    //Verifica se os dados reais do Supabase já foram colocados no arquivo .env
    if (!supabaseConfigurado) {

      setTipoMensagem("erro");

      setMensagem(
        "Supabase não configurado. Verifique o arquivo .env."
      );

      return;
    }


    try {

      //Indica que o processo de cadastro começou
      setCarregando(true);

      setTipoMensagem("info");

      setMensagem(
        "Conectando ao Supabase..."
      );


      //Exibe no console do navegador o e-mail que esta sendo cadastrado
      console.log(
        "Tentando cadastrar:",
        email.trim().toLowerCase()
      );


      //Cria o usuário utilizando o sistema de autenticação do Supabase
      const { data, error } =
        await supabase.auth.signUp({

          email:
            email.trim().toLowerCase(),

          password: senha,

          //Salva o nome nos metadados do usuário do Supabase.
          //O trigger criado em supabase/setup.sql usa esse nome
          //para preencher a tabela public.usuarios
          options: {

            data: {

              nome: nome.trim(),

            },

          },

        });


      //Mostra no console a resposta recebida do Supabase
      console.log(
        "Resposta do Supabase:",
        data
      );


      console.log(
        "Erro do Supabase:",
        error
      );


      //Caso o Supabase retorne um erro,
      //interrompe o cadastro
      if (error) {

        throw error;

      }


      //Confere se realmente foi criado um usuário
      if (!data.user) {

        throw new Error(
          "O Supabase não retornou o usuário cadastrado."
        );

      }


      //Se a confirmação de e-mail estiver desabilitada no Supabase,
      //o cadastro pode iniciar uma sessão automaticamente.
      //Fazemos logout para que o usuário teste o login normalmente.
      if (data.session) {

        await supabase.auth.signOut();

      }


      //Quando não existe sessão,
      //normalmente a confirmação por e-mail está habilitada
      const textoSucesso =
        data.session
          ? "Usuário cadastrado com sucesso!"
          : "Usuário cadastrado! Verifique seu e-mail para confirmar a conta.";


      //Mostra a mensagem de sucesso na própria tela
      setTipoMensagem("sucesso");

      setMensagem(
        textoSucesso
      );


      //Limpa os campos depois do cadastro
      setNome("");

      setEmail("");

      setSenha("");

      setConfirmarSenha("");


      //Depois de alguns segundos,
      //retorna para a tela de Login
      setTimeout(() => {

        navigation.navigate("Login");

      }, 2000);


    } catch (erro) {

      //Mostra o erro completo no console do navegador
      console.error(
        "ERRO AO CADASTRAR:",
        erro
      );


      setTipoMensagem("erro");

      setMensagem(
        traduzirErroCadastro(
          erro?.message
        )
      );


    } finally {

      //Libera novamente o botão
      setCarregando(false);

    }

  }


  return (

    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView

        style={styles.keyboard}

        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }

      >

        <ScrollView

          contentContainerStyle={styles.content}

          keyboardShouldPersistTaps="handled"

          showsVerticalScrollIndicator={false}

        >


          {/* Cabeçalho da tela */}
          <View style={styles.header}>


            {/* Botão voltar */}
            <Pressable

              style={styles.botaoVoltar}

              onPress={() =>
                navigation.goBack()
              }

            >

              <Text style={styles.textoVoltar}>
                ←
              </Text>

            </Pressable>


            {/* Textos do cabeçalho */}
            <View style={styles.headerTextos}>

              <Text style={styles.titulo}>
                Criar conta
              </Text>

              <Text style={styles.subtitulo}>
                Cadastre um novo usuário no LoadFit
              </Text>

            </View>


          </View>


          {/* Card do formulário */}
          <View style={styles.formCard}>


            {/* Nome */}
            <Text style={styles.label}>
              Nome completo
            </Text>


            <TextInput

              style={styles.input}

              placeholder="Digite seu nome"

              value={nome}

              onChangeText={setNome}

              autoCapitalize="words"

            />


            {/* E-mail */}
            <Text style={styles.label}>
              E-mail
            </Text>


            <TextInput

              style={styles.input}

              placeholder="exemplo@email.com"

              keyboardType="email-address"

              autoCapitalize="none"

              value={email}

              onChangeText={setEmail}

            />


            {/* Senha */}
            <Text style={styles.label}>
              Senha
            </Text>


            <TextInput

              style={styles.input}

              placeholder="Mínimo de 6 caracteres"

              secureTextEntry

              value={senha}

              onChangeText={setSenha}

            />


            {/* Confirmar senha */}
            <Text style={styles.label}>
              Confirmar senha
            </Text>


            <TextInput

              style={styles.input}

              placeholder="Digite a senha novamente"

              secureTextEntry

              value={confirmarSenha}

              onChangeText={setConfirmarSenha}

            />


            {/* Mensagem de erro, sucesso ou informação */}
            {mensagem !== "" && (

              <View

                style={[
                  styles.caixaMensagem,

                  tipoMensagem === "erro"
                    ? styles.caixaErro
                    : tipoMensagem === "sucesso"
                    ? styles.caixaSucesso
                    : styles.caixaInfo
                ]}

              >

                <Text

                  style={[
                    styles.textoMensagem,

                    tipoMensagem === "erro"
                      ? styles.textoErro
                      : tipoMensagem === "sucesso"
                      ? styles.textoSucesso
                      : styles.textoInfo
                  ]}

                >

                  {mensagem}

                </Text>

              </View>

            )}


            {/* Botão cadastrar usuário */}
            <Pressable

              style={[
                styles.botaoCadastrar,

                carregando &&
                styles.botaoDesabilitado
              ]}

              onPress={cadastrar}

              disabled={carregando}

            >

              <Text style={styles.textoBotao}>

                {
                  carregando
                    ? "Cadastrando..."
                    : "Cadastrar usuário"
                }

              </Text>

            </Pressable>


            {/* Botão cancelar */}
            <Pressable

              style={styles.botaoCancelar}

              onPress={() =>
                navigation.goBack()
              }

            >

              <Text style={styles.textoCancelar}>
                Cancelar
              </Text>

            </Pressable>


          </View>


        </ScrollView>


      </KeyboardAvoidingView>


    </SafeAreaView>

  );

}


//Transforma algumas mensagens do Supabase
//em textos mais amigáveis para o usuário
function traduzirErroCadastro(mensagem = "") {

  const texto =
    mensagem.toLowerCase();


  if (
    texto.includes(
      "user already registered"
    )
  ) {

    return "Já existe um usuário cadastrado com este e-mail.";

  }


  if (
    texto.includes(
      "already been registered"
    )
  ) {

    return "Já existe um usuário cadastrado com este e-mail.";

  }


  if (
    texto.includes(
      "invalid email"
    )
  ) {

    return "O endereço de e-mail informado é inválido.";

  }


  if (
    texto.includes(
      "password"
    )
  ) {

    return "A senha informada não atende aos requisitos do Supabase.";

  }


  if (
    texto.includes(
      "email rate limit"
    )
  ) {

    return "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.";

  }


  if (
    texto.includes(
      "failed to fetch"
    )
  ) {

    return "Não foi possível conectar ao Supabase. Verifique sua internet, URL e chave no arquivo .env.";

  }


  if (
    texto.includes(
      "network request failed"
    )
  ) {

    return "Falha de conexão com o Supabase.";

  }


  if (
    texto.includes(
      "database error"
    )
  ) {

    return "O usuário chegou ao Supabase, mas ocorreu um erro ao gravar os dados no banco. Verifique o setup.sql e o trigger da tabela usuarios.";

  }


  return (
    mensagem ||
    "Não foi possível cadastrar o usuário."
  );

}


const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F8FAFC",

  },


  keyboard: {

    flex: 1,

  },


  content: {

    flexGrow: 1,

    paddingHorizontal: 24,

    paddingTop: 18,

    paddingBottom: 30,

  },


  header: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 24,

  },


  headerTextos: {

    flex: 1,

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

    marginRight: 14,

  },


  textoVoltar: {

    fontSize: 24,

    color: "#0F172A",

  },


  titulo: {

    fontSize: 24,

    fontWeight: "bold",

    color: "#0F172A",

  },


  subtitulo: {

    color: "#64748B",

    fontSize: 13,

    marginTop: 3,

  },


  formCard: {

    width: "100%",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",

    borderRadius: 14,

    padding: 20,

  },


  label: {

    fontSize: 14,

    fontWeight: "600",

    color: "#334155",

    marginBottom: 7,

  },


  input: {

    height: 52,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,

    borderColor: "#CBD5E1",

    borderRadius: 10,

    paddingHorizontal: 14,

    fontSize: 15,

    color: "#0F172A",

    marginBottom: 18,

  },


  //Caixa utilizada para mostrar mensagens ao usuário
  caixaMensagem: {

    padding: 12,

    borderRadius: 8,

    marginBottom: 15,

  },


  //Fundo para mensagens de erro
  caixaErro: {

    backgroundColor: "#FEE2E2",

  },


  //Fundo para mensagens de sucesso
  caixaSucesso: {

    backgroundColor: "#DCFCE7",

  },


  //Fundo para mensagens informativas
  caixaInfo: {

    backgroundColor: "#DBEAFE",

  },


  //Configuração geral dos textos das mensagens
  textoMensagem: {

    fontSize: 13,

    fontWeight: "600",

    textAlign: "center",

  },


  textoErro: {

    color: "#B91C1C",

  },


  textoSucesso: {

    color: "#15803D",

  },


  textoInfo: {

    color: "#1D4ED8",

  },


  botaoCadastrar: {

    height: 54,

    backgroundColor: "#2563EB",

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 4,

  },


  botaoDesabilitado: {

    opacity: 0.65,

  },


  textoBotao: {

    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "bold",

  },


  botaoCancelar: {

    paddingVertical: 14,

    alignItems: "center",

  },


  textoCancelar: {

    color: "#64748B",

    fontSize: 14,

    fontWeight: "600",

  },

});
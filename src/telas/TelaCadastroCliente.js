import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  useWindowDimensions,
  Image
} from "react-native";

export default function TelaCadastroCliente({ navigation }) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const { width } = useWindowDimensions();

  const telaGrande = width >= 768;

  const handleSalvar = () => {
    if (
      !nome ||
      !endereco ||
      !cidade ||
      !estado
    ) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    const dadosCliente = {
      nome,
      endereco,
      cidade,
      estado,
    };

    console.log("Cliente salvo:", dadosCliente);

    Alert.alert(
      "Sucesso",
      "Cliente cadastrado com sucesso!"
    );

    navigation.navigate("Menu");
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        telaGrande && styles.containerGrande,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.conteudo,
          telaGrande && styles.conteudoGrande,
        ]}
      >

        {/* CABEÇALHO */}

        <View style={styles.cabecalho}>

          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image source={require("../../assets/voltar.png")} 
                                                style={styles.imageVoltar}/>
          </TouchableOpacity>

          <View style={styles.tituloArea}>

            <Text
              style={[
                styles.titulo,
                telaGrande && styles.tituloGrande,
              ]}
            >
              Cadastrar Cliente
            </Text>

            <Text style={styles.subtitulo}>
              Informe os dados do cliente
            </Text>

          </View>

        </View>

        {/* FORMULÁRIO */}

        <View
          style={[
            styles.formCard,
            telaGrande && styles.formCardGrande,
          ]}
        >

          {/* NOME */}

          <Text style={styles.label}>
            Nome do Cliente
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: João da Silva"
            placeholderTextColor="#8A8A8A"
            value={nome}
            onChangeText={setNome}
          />

          {/* ENDEREÇO */}

          <Text style={styles.label}>
            Endereço
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: Rua das Flores, 100"
            placeholderTextColor="#8A8A8A"
            value={endereco}
            onChangeText={setEndereco}
          />

          {/* CIDADE */}

          <Text style={styles.label}>
            Cidade
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: São Gonçalo"
            placeholderTextColor="#8A8A8A"
            value={cidade}
            onChangeText={setCidade}
          />

          {/* ESTADO */}

          <Text style={styles.label}>
            Estado
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: RJ"
            placeholderTextColor="#8A8A8A"
            value={estado}
            onChangeText={setEstado}
            autoCapitalize="characters"
            maxLength={2}
          />

          {/* BOTÃO CADASTRAR */}

          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={handleSalvar}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotao}>
              Cadastrar Cliente
            </Text>
          </TouchableOpacity>

          {/* CANCELAR */}

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.textoCancelar}>
              Cancelar
            </Text>
          </TouchableOpacity>

        </View>

        {/* RODAPÉ */}

        <Text style={styles.rodape}>
          LoadFit • Organizador de Cargas
        </Text>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  /* CONTAINER */

  container: {
    flexGrow: 1,
    backgroundColor: "#E4B89E",
  },

  conteudo: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 25,
  },

  containerGrande: {
    justifyContent: "center",
  },

  conteudoGrande: {
    maxWidth: 650,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 30,
  },

  /* CABEÇALHO */

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  imageVoltar: {
        width: 24,
        height: 24,
        resizeMode: "contain"
    },

  tituloArea: {
    flex: 1,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "800",
    color: "#252B33",
  },

  tituloGrande: {
    fontSize: 28,
  },

  subtitulo: {
    fontSize: 14,
    color: "#5F514A",
    marginTop: 4,
  },

  /* CARD */

  formCard: {
    width: "100%",
    backgroundColor: "#FFF9F5",
    borderRadius: 18,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 3,
  },

  formCardGrande: {
    padding: 28,
    borderRadius: 20,
  },

  /* CAMPOS */

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#252B33",
    marginBottom: 7,
  },

  input: {
    height: 50,
    width: "100%",

    backgroundColor: "#F3E5DD",

    borderWidth: 1,
    borderColor: "#E0C8B9",
    borderRadius: 10,

    paddingHorizontal: 14,

    fontSize: 15,
    color: "#252B33",

    marginBottom: 18,
  },

  /* BOTÃO PRINCIPAL */

  botaoSalvar: {
    width: "100%",
    height: 52,

    backgroundColor: "#C96A22",

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 5,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  /* CANCELAR */

  botaoCancelar: {
    height: 45,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 5,
  },

  textoCancelar: {
    color: "#6D5B52",
    fontSize: 14,
    fontWeight: "600",
  },

  /* RODAPÉ */

  rodape: {
    textAlign: "center",
    color: "#806C61",
    fontSize: 12,
    marginTop: 22,
  },
});
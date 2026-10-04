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
} from "react-native";

export default function TelaCadastroMotorista({ navigation }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoriaCnh, setCategoriaCnh] = useState("");

  const { width } = useWindowDimensions();

  // Define se a tela é grande
  const telaGrande = width >= 768;

  const handleSalvar = () => {
    if (!nome || !telefone || !cnh || !categoriaCnh) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    const dadosMotorista = {
      nome,
      telefone,
      cnh,
      categoria_cnh: categoriaCnh,
    };

    console.log("Motorista salvo:", dadosMotorista);

    Alert.alert(
      "Sucesso",
      "Motorista cadastrado com sucesso!"
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
            <Text style={styles.textoVoltar}>‹</Text>
          </TouchableOpacity>

          <View style={styles.tituloArea}>

            <Text
              style={[
                styles.titulo,
                telaGrande && styles.tituloGrande,
              ]}
            >
              Cadastrar Motorista
            </Text>

            <Text style={styles.subtitulo}>
              Informe os dados do motorista
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
            Nome do Motorista
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: João da Silva"
            placeholderTextColor="#8A8A8A"
            value={nome}
            onChangeText={setNome}
          />

          {/* TELEFONE */}

          <Text style={styles.label}>
            Telefone
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: (21) 99999-9999"
            placeholderTextColor="#8A8A8A"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          {/* CNH */}

          <Text style={styles.label}>
            CNH
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 01234567890"
            placeholderTextColor="#8A8A8A"
            value={cnh}
            onChangeText={setCnh}
            keyboardType="numeric"
          />

          {/* CATEGORIA DA CNH */}

          <Text style={styles.label}>
            Categoria da CNH
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: C, D ou E"
            placeholderTextColor="#8A8A8A"
            value={categoriaCnh}
            onChangeText={setCategoriaCnh}
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
              Cadastrar Motorista
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
    backgroundColor: "#252B33",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  textoVoltar: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -4,
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
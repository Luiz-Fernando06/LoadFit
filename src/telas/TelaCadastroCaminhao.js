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


export default function TelaCadastroCaminhao({ navigation }) {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");

  const { width } = useWindowDimensions();

  // Considera telas com 768px ou mais como tablet/desktop
  const telaGrande = width >= 768;

  const handleSalvar = () => {
    if (!placa || !modelo || !capacidade) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    const dadosCaminhao = {
      placa,
      modelo,
      capacidade: parseFloat(capacidade),
    };

    console.log("Caminhão salvo:", dadosCaminhao);

    Alert.alert("Sucesso", "Caminhão cadastrado com sucesso!");

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
              Cadastrar Caminhão
            </Text>

            <Text style={styles.subtitulo}>
              Informe os dados do veículo
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

          <Text style={styles.label}>
            Placa do Veículo
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: ABC-1234 ou ABC1D23"
            placeholderTextColor="#8A8A8A"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            Tipo de Veículo
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: Truck, Malhal"
            placeholderTextColor="#8A8A8A"
            value={modelo}
            onChangeText={setModelo}
          />

          <Text style={styles.label}>
            Capacidade de Carga
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 15000 kg"
            placeholderTextColor="#8A8A8A"
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType="numeric"
          />

          {/* BOTÃO CADASTRAR */}

          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={handleSalvar}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotao}>
              Cadastrar Veículo
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
  container: {
    flexGrow: 1,
    backgroundColor: "#E4B89E",
  },

  // Configuração para telas normais
  conteudo: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 25,
  },

  // Em telas grandes, o conteúdo fica centralizado
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

  /* BOTÃO */

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


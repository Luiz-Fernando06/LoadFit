import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

export default function TelaCadastroCaminhao({ navigation }) {
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");

  const handleSalvar = () => {
    if (!placa || !marca || !modelo || !capacidade) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    const dadosCaminhao = {
      placa,
      marca,
      modelo,
      capacidade: parseFloat(capacidade),
    };

    console.log("Caminhão salvo:", dadosCaminhao);
    Alert.alert("Sucesso", "Caminhão cadastrado com sucesso!");
    navigation.navigate("Menu");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastrar Caminhão</Text>
      <Text style={styles.subtitulo}>Informe os dados do veículo para o sistema</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Placa do Veículo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: ABC-1234 ou ABC1D23"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Volvo, Scania, Mercedes"
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Modelo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: FH 540, R 450"
          value={modelo}
          onChangeText={setModelo}
        />

        <Text style={styles.label}>Capacidade de Carga (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15000"
          value={capacidade}
          onChangeText={setCapacidade}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.textoBotao}>Cadastrar Veículo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    color: "#0F172A",
  },
  botaoSalvar: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoCancelar: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  textoCancelar: {
    color: "#64748B",
    fontSize: 14,
  },
});
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

//Importa a conexão com o Supabase
import { supabase } from "../servicos/supabase";


export default function TelaCadastroCaminhao({ navigation }) {

  //Dados do veículo digitados pelo usuário
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");

  //Controla o botão enquanto o veículo está sendo salvo
  const [carregando, setCarregando] = useState(false);


  //Função que cadastra o caminhão no Supabase
  async function handleSalvar() {

    //Verifica se todos os campos obrigatórios foram preenchidos
    if (!placa.trim() || !marca.trim() || !modelo.trim() || !capacidade.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }


    //Converte a capacidade digitada para número
    const capacidadeNumero = Number(capacidade.replace(",", "."));


    if (Number.isNaN(capacidadeNumero) || capacidadeNumero <= 0) {
      Alert.alert("Capacidade inválida", "Informe uma capacidade maior que zero.");
      return;
    }


    try {

      setCarregando(true);


      //Insere o veículo no PostgreSQL do Supabase
      const { error } = await supabase
        .from("caminhoes")
        .insert({
          placa: placa.trim().toUpperCase(),
          marca: marca.trim(),
          modelo: modelo.trim(),
          capacidade: capacidadeNumero,
        });


      if (error) {
        throw error;
      }


      Alert.alert(
        "Sucesso",
        "Caminhão cadastrado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Menu"),
          },
        ]
      );


    } catch (erro) {

      const mensagem = erro.code === "23505"
        ? "Já existe um caminhão com esta placa cadastrado para este usuário."
        : erro.message;

      Alert.alert("Erro ao cadastrar", mensagem);


    } finally {

      setCarregando(false);

    }

  }


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
          placeholder="Ex: Volvo, Scania, Mercedes-Benz"
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Tipo de Veículo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Truck, Carreta, Toco"
          value={modelo}
          onChangeText={setModelo}
        />

        <Text style={styles.label}>Capacidade de Carga (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15000"
          value={capacidade}
          onChangeText={setCapacidade}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={[styles.botaoSalvar, carregando && styles.botaoDesabilitado]}
          onPress={handleSalvar}
          disabled={carregando}
        >
          <Text style={styles.textoBotao}>
            {carregando ? "Salvando..." : "Cadastrar Veículo"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => navigation.goBack()}
          disabled={carregando}
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
  botaoDesabilitado: {
    opacity: 0.65,
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

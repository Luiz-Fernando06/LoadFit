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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../servicos/api";

export default function TelaCadastro({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Permite testar a tela de cadastro enquanto a API/SQL ainda não estiverem ativos.
  const modoTeste = process.env.EXPO_PUBLIC_MODO_TESTE === "true";

  async function cadastrar() {
    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("E-mail inválido", "Digite um endereço de e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Senha inválida", "A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Senhas diferentes", "A senha e a confirmação precisam ser iguais.");
      return;
    }

    try {
      setCarregando(true);

      await api("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
        }),
      });

      Alert.alert(
        "Cadastro realizado",
        "Usuário cadastrado no banco de dados com sucesso!",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (erro) {
      // Em modo de teste, se a API estiver fora do ar, deixa seguir com o fluxo
      // sem gravar no banco. Quando o SQL estiver pronto, use MODO_TESTE=false.
      if (modoTeste && !erro.status) {
        Alert.alert(
          "Cadastro de teste",
          "Usuário validado localmente. O banco ainda não está conectado.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
        return;
      }

      Alert.alert("Erro no cadastro", erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
              <Text style={styles.textoVoltar}>←</Text>
            </Pressable>

            <View style={styles.headerTextos}>
              <Text style={styles.titulo}>Criar conta</Text>
              <Text style={styles.subtitulo}>Cadastre um novo usuário no LoadFit</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo de 6 caracteres"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a senha novamente"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <Pressable
              style={[styles.botaoCadastrar, carregando && styles.botaoDesabilitado]}
              onPress={cadastrar}
              disabled={carregando}
            >
              <Text style={styles.textoBotao}>
                {carregando ? "Cadastrando..." : "Cadastrar usuário"}
              </Text>
            </Pressable>

            <Pressable style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

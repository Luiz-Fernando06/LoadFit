import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase, supabaseConfigurado } from "../servicos/supabase";

export default function TelaCadastroCaminhao({ navigation }) {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [caminhoes, setCaminhoes] = useState([]);
  const [caminhaoEditando, setCaminhaoEditando] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");

  const { width } = useWindowDimensions();
  // Considera telas com 768px ou mais como tablet/desktop.
  const telaGrande = width >= 768;

  function mostrarMensagem(texto, tipo = "info") {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  const carregarCaminhoes = useCallback(async () => {
    if (!supabaseConfigurado) {
      setCarregandoLista(false);
      mostrarMensagem(
        "Configure EXPO_PUBLIC_SUPABASE_URL e a chave no arquivo .env para conectar ao banco.",
        "erro"
      );
      return;
    }

    setCarregandoLista(true);
    try {
      const { data: usuarioData, error: usuarioErro } = await supabase.auth.getUser();
      if (usuarioErro) throw usuarioErro;
      if (!usuarioData.user) {
        setCaminhoes([]);
        mostrarMensagem("Faça login para consultar seus caminhões.", "erro");
        return;
      }

      const { data, error } = await supabase
        .from("caminhoes")
        .select("id, user_id, placa, marca, modelo, capacidade, criado_em")
        .eq("user_id", usuarioData.user.id)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setCaminhoes(data || []);
    } catch (erro) {
      console.error("Erro ao carregar caminhões:", erro);
      mostrarMensagem(
        `Não foi possível carregar os caminhões. ${erro.message || "Confira a tabela caminhoes e as políticas RLS no Supabase."}`,
        "erro"
      );
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  // Atualiza a lista toda vez que a tela recebe foco.
  useFocusEffect(
    useCallback(() => {
      carregarCaminhoes();
    }, [carregarCaminhoes])
  );

  function limparFormulario() {
    setPlaca("");
    setModelo("");
    setCapacidade("");
    setCaminhaoEditando(null);
    setConfirmarExclusaoId(null);
  }

  function iniciarEdicao(caminhao) {
    setCaminhaoEditando(caminhao.id);
    setPlaca(caminhao.placa || "");
    setModelo(caminhao.modelo || "");
    setCapacidade(String(caminhao.capacidade ?? ""));
    setConfirmarExclusaoId(null);
    mostrarMensagem("Edite os campos e clique em Salvar alterações.", "info");
  }

  async function handleSalvar() {
    const placaNormalizada = placa.trim().toUpperCase();
    const modeloNormalizado = modelo.trim();
    const capacidadeNormalizada = Number(
      capacidade.trim().replace(/\s/g, "").replace(",", ".")
    );

    if (!placaNormalizada || !modeloNormalizado || !capacidade.trim()) {
      mostrarMensagem("Preencha a placa, o tipo de veículo e a capacidade.", "erro");
      return;
    }

    if (!Number.isFinite(capacidadeNormalizada) || capacidadeNormalizada <= 0) {
      mostrarMensagem("Informe uma capacidade válida, maior que zero.", "erro");
      return;
    }

    if (!supabaseConfigurado) {
      mostrarMensagem("Supabase não configurado. Preencha o arquivo .env e reinicie o Expo.", "erro");
      return;
    }

    setSalvando(true);
    try {
      const { data: usuarioData, error: usuarioErro } = await supabase.auth.getUser();
      if (usuarioErro) throw usuarioErro;
      if (!usuarioData.user) {
        mostrarMensagem("Sua sessão expirou. Entre novamente no sistema.", "erro");
        return;
      }

      const dadosCaminhao = {
        user_id: usuarioData.user.id,
        placa: placaNormalizada,
        // A tela atual pede tipo/modelo, por isso a marca fica com um valor padrão.
        marca: "Não informado",
        modelo: modeloNormalizado,
        capacidade: capacidadeNormalizada,
      };

      let error;
      if (caminhaoEditando) {
        ({ error } = await supabase
          .from("caminhoes")
          .update(dadosCaminhao)
          .eq("id", caminhaoEditando)
          .eq("user_id", usuarioData.user.id));
      } else {
        ({ error } = await supabase.from("caminhoes").insert(dadosCaminhao));
      }

      if (error) throw error;

      const estavaEditando = Boolean(caminhaoEditando);
      limparFormulario();
      await carregarCaminhoes();
      mostrarMensagem(
        estavaEditando ? "Caminhão atualizado com sucesso!" : "Caminhão cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar caminhão:", erro);
      let texto = erro.message || "Ocorreu um erro ao salvar o caminhão.";
      if (texto.toLowerCase().includes("duplicate") || texto.toLowerCase().includes("unique")) {
        texto = "Já existe um caminhão com essa placa na sua conta.";
      } else if (texto.toLowerCase().includes("row-level security") || texto.toLowerCase().includes("rls")) {
        texto = "O Supabase bloqueou a gravação. Confira se as políticas RLS foram executadas no SQL Editor.";
      }
      mostrarMensagem(texto, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCaminhao(id) {
    if (!supabaseConfigurado) {
      mostrarMensagem("Supabase não configurado. Confira o arquivo .env.", "erro");
      return;
    }

    try {
      const { data: usuarioData, error: usuarioErro } = await supabase.auth.getUser();
      if (usuarioErro) throw usuarioErro;
      if (!usuarioData.user) {
        mostrarMensagem("Faça login novamente para excluir o caminhão.", "erro");
        return;
      }

      const { error } = await supabase
        .from("caminhoes")
        .delete()
        .eq("id", id)
        .eq("user_id", usuarioData.user.id);

      if (error) throw error;
      if (caminhaoEditando === id) limparFormulario();
      setConfirmarExclusaoId(null);
      await carregarCaminhoes();
      mostrarMensagem("Caminhão excluído com sucesso.", "sucesso");
    } catch (erro) {
      console.error("Erro ao excluir caminhão:", erro);
      mostrarMensagem(
        `Não foi possível excluir o caminhão. ${erro.message || "Verifique as permissões da tabela caminhoes."}`,
        "erro"
      );
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        telaGrande && styles.containerGrande,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.conteudo, telaGrande && styles.conteudoGrande]}>
        {/* CABEÇALHO */}
        <View style={styles.cabecalho}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image
              source={require("../../assets/voltar.png")}
              style={styles.imageVoltar}
            />
          </TouchableOpacity>

          <View style={styles.tituloArea}>
            <Text style={[styles.titulo, telaGrande && styles.tituloGrande]}>
              Gerenciar Caminhões
            </Text>
            <Text style={styles.subtitulo}>
              Cadastre, edite e exclua veículos
            </Text>
          </View>
        </View>

        {/* FORMULÁRIO */}
        <View style={[styles.formCard, telaGrande && styles.formCardGrande]}>
          <Text style={styles.tituloFormulario}>
            {caminhaoEditando ? "Editar caminhão" : "Novo caminhão"}
          </Text>

          <Text style={styles.label}>Placa do Veículo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: ABC-1234 ou ABC1D23"
            placeholderTextColor="#8A8A8A"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Text style={styles.label}>Tipo de Veículo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Truck, Carreta, VUC"
            placeholderTextColor="#8A8A8A"
            value={modelo}
            onChangeText={setModelo}
          />

          <Text style={styles.label}>Capacidade de Carga (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 15000"
            placeholderTextColor="#8A8A8A"
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType="decimal-pad"
          />

          {mensagem ? (
            <View
              style={[
                styles.caixaMensagem,
                tipoMensagem === "erro" && styles.caixaErro,
                tipoMensagem === "sucesso" && styles.caixaSucesso,
                tipoMensagem === "info" && styles.caixaInfo,
              ]}
            >
              <Text
                style={[
                  styles.textoMensagem,
                  tipoMensagem === "erro" && styles.textoErro,
                  tipoMensagem === "sucesso" && styles.textoSucesso,
                  tipoMensagem === "info" && styles.textoInfo,
                ]}
              >
                {mensagem}
              </Text>
            </View>
          ) : null}

          {/* BOTÃO CADASTRAR / SALVAR ALTERAÇÕES */}
          <TouchableOpacity
            style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
            onPress={handleSalvar}
            activeOpacity={0.8}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotao}>
                {caminhaoEditando ? "Salvar alterações" : "Cadastrar Veículo"}
              </Text>
            )}
          </TouchableOpacity>

          {caminhaoEditando ? (
            <TouchableOpacity
              style={styles.botaoCancelarEdicao}
              onPress={() => {
                limparFormulario();
                mostrarMensagem("Edição cancelada.", "info");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.textoCancelar}>Cancelar edição</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.textoCancelar}>Voltar ao menu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTA DE CAMINHÕES GRAVADOS NO SUPABASE */}
        <View style={styles.areaLista}>
          <View style={styles.tituloListaLinha}>
            <Text style={styles.tituloLista}>Caminhões cadastrados</Text>
            <View style={styles.contador}>
              <Text style={styles.textoContador}>{caminhoes.length}</Text>
            </View>
          </View>

          {carregandoLista ? (
            <View style={styles.estadoLista}>
              <ActivityIndicator color="#C96A22" size="large" />
              <Text style={styles.textoVazio}>Carregando caminhões...</Text>
            </View>
          ) : caminhoes.length === 0 ? (
            <View style={styles.estadoLista}>
              <Text style={styles.textoVazioTitulo}>Nenhum caminhão cadastrado</Text>
              <Text style={styles.textoVazio}>
                Preencha o formulário acima para cadastrar o primeiro veículo.
              </Text>
            </View>
          ) : (
            caminhoes.map((caminhao) => (
              <View key={String(caminhao.id)} style={styles.cardCaminhao}>
                <View style={styles.dadosCaminhao}>
                  <Text style={styles.placaCaminhao}>{caminhao.placa}</Text>
                  <Text style={styles.modeloCaminhao}>{caminhao.modelo}</Text>
                  <Text style={styles.capacidadeCaminhao}>
                    Capacidade: {Number(caminhao.capacidade).toLocaleString("pt-BR")} kg
                  </Text>
                </View>

                <View style={styles.acoesCaminhao}>
                  <TouchableOpacity
                    style={styles.botaoEditar}
                    onPress={() => iniciarEdicao(caminhao)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.textoBotaoAcao}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botaoExcluir}
                    onPress={() => setConfirmarExclusaoId(caminhao.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.textoBotaoAcao}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                {confirmarExclusaoId === caminhao.id ? (
                  <View style={styles.confirmacaoExclusao}>
                    <Text style={styles.textoConfirmacao}>
                      Deseja realmente excluir este caminhão?
                    </Text>
                    <View style={styles.botoesConfirmacao}>
                      <TouchableOpacity
                        style={styles.botaoConfirmarExclusao}
                        onPress={() => excluirCaminhao(caminhao.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.textoBotaoAcao}>Sim, excluir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.botaoCancelarExclusao}
                        onPress={() => setConfirmarExclusaoId(null)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.textoCancelarExclusao}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* RODAPÉ */}
        <Text style={styles.rodape}>LoadFit • Organizador de Cargas</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E4B89E",
  },
  // Configuração para telas normais.
  conteudo: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 25,
  },
  // Em telas grandes, o conteúdo fica centralizado.
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
    resizeMode: "contain",
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
  /* CARD DO FORMULÁRIO */
  formCard: {
    width: "100%",
    backgroundColor: "#FFF9F5",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formCardGrande: {
    padding: 28,
    borderRadius: 20,
  },
  tituloFormulario: {
    fontSize: 18,
    fontWeight: "800",
    color: "#252B33",
    marginBottom: 18,
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
  /* MENSAGENS */
  caixaMensagem: {
    borderRadius: 9,
    padding: 11,
    marginBottom: 14,
  },
  caixaErro: { backgroundColor: "#FEE2E2" },
  caixaSucesso: { backgroundColor: "#DCFCE7" },
  caixaInfo: { backgroundColor: "#DBEAFE" },
  textoMensagem: { fontSize: 13, textAlign: "center", fontWeight: "600" },
  textoErro: { color: "#B91C1C" },
  textoSucesso: { color: "#166534" },
  textoInfo: { color: "#1D4ED8" },
  /* BOTÕES */
  botaoSalvar: {
    width: "100%",
    height: 52,
    backgroundColor: "#C96A22",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  botaoDesabilitado: { opacity: 0.65 },
  textoBotao: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  botaoCancelar: {
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  botaoCancelarEdicao: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  textoCancelar: { color: "#6D5B52", fontSize: 14, fontWeight: "600" },
  /* LISTA */
  areaLista: { marginTop: 27 },
  tituloListaLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 9,
  },
  tituloLista: { fontSize: 19, fontWeight: "800", color: "#252B33" },
  contador: {
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    paddingHorizontal: 7,
    backgroundColor: "#F5D0B8",
    alignItems: "center",
    justifyContent: "center",
  },
  textoContador: { color: "#9A4A13", fontSize: 12, fontWeight: "800" },
  estadoLista: {
    backgroundColor: "#FFF9F5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0C8B9",
    padding: 24,
    alignItems: "center",
  },
  textoVazioTitulo: {
    color: "#252B33",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 7,
  },
  textoVazio: {
    color: "#806C61",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  cardCaminhao: {
    backgroundColor: "#FFF9F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0C8B9",
    padding: 16,
    marginBottom: 12,
  },
  dadosCaminhao: { marginBottom: 12 },
  placaCaminhao: {
    fontSize: 17,
    fontWeight: "800",
    color: "#252B33",
    marginBottom: 3,
  },
  modeloCaminhao: { fontSize: 14, color: "#5F514A", marginBottom: 4 },
  capacidadeCaminhao: { fontSize: 13, color: "#806C61" },
  acoesCaminhao: { flexDirection: "row", gap: 10 },
  botaoEditar: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 9,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoExcluir: {
    flex: 1,
    backgroundColor: "#B91C1C",
    borderRadius: 9,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotaoAcao: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  confirmacaoExclusao: {
    marginTop: 13,
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
  },
  textoConfirmacao: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  botoesConfirmacao: { flexDirection: "row", gap: 10 },
  botaoConfirmarExclusao: {
    flex: 1,
    backgroundColor: "#B91C1C",
    minHeight: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoCancelarExclusao: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    minHeight: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  textoCancelarExclusao: { color: "#991B1B", fontSize: 13, fontWeight: "700" },
  /* RODAPÉ */
  rodape: {
    textAlign: "center",
    color: "#806C61",
    fontSize: 12,
    marginTop: 22,
  },
});

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

export default function TelaCadastroMateriais({ navigation }) {
  const [nome, setNome] = useState("");
  const [pesoUnitario, setPesoUnitario] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");

  const { width } = useWindowDimensions();
  // Define se a tela é grande.
  const telaGrande = width >= 768;

  function mostrarMensagem(texto, tipo = "info") {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  const carregarMateriais = useCallback(async () => {
    if (!supabaseConfigurado) {
      setCarregandoLista(false);
      mostrarMensagem("Configure o arquivo .env para conectar ao Supabase.", "erro");
      return;
    }

    setCarregandoLista(true);
    try {
      const { data: usuarioData, error: usuarioErro } = await supabase.auth.getUser();
      if (usuarioErro) throw usuarioErro;
      if (!usuarioData.user) {
        setMateriais([]);
        mostrarMensagem("Faça login para consultar seus materiais.", "erro");
        return;
      }

      const { data, error } = await supabase
        .from("materiais")
        .select("id, user_id, nome, peso, peso_unitario, quantidade, categoria, criado_em")
        .eq("user_id", usuarioData.user.id)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setMateriais(data || []);
    } catch (erro) {
      console.error("Erro ao carregar materiais:", erro);
      mostrarMensagem(
        `Não foi possível carregar os materiais. ${erro.message || "Confira a tabela materiais e as políticas RLS no Supabase."}`,
        "erro"
      );
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  // Atualiza a lista quando a tela é aberta.
  useFocusEffect(
    useCallback(() => {
      carregarMateriais();
    }, [carregarMateriais])
  );

  function limparFormulario() {
    setNome("");
    setPesoUnitario("");
    setMaterialEditando(null);
    setConfirmarExclusaoId(null);
  }

  function iniciarEdicao(material) {
    setMaterialEditando(material.id);
    setNome(material.nome || "");
    setPesoUnitario(String(material.peso ?? material.peso_unitario ?? ""));
    setConfirmarExclusaoId(null);
    mostrarMensagem("Edite os campos e clique em Salvar alterações.", "info");
  }

  async function handleSalvar() {
    const nomeNormalizado = nome.trim();
    const peso = Number(pesoUnitario.trim().replace(/\s/g, "").replace(",", "."));

    if (!nomeNormalizado || !pesoUnitario.trim()) {
      mostrarMensagem("Preencha o nome e o peso unitário do material.", "erro");
      return;
    }
    if (!Number.isFinite(peso) || peso <= 0) {
      mostrarMensagem("Informe um peso válido, maior que zero.", "erro");
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

      const dadosMaterial = {
        user_id: usuarioData.user.id,
        nome: nomeNormalizado,
        categoria: "Geral",
        peso,
        peso_unitario: peso,
        quantidade: 1,
      };

      let error;
      if (materialEditando !== null) {
        const { data, error: erroAtualizacao } = await supabase
          .from("materiais")
          .update({
            nome: dadosMaterial.nome,
            categoria: dadosMaterial.categoria,
            peso: dadosMaterial.peso,
            peso_unitario: dadosMaterial.peso_unitario,
          })
          .eq("id", materialEditando)
          .eq("user_id", usuarioData.user.id)
          .select("id")
          .maybeSingle();
        error = erroAtualizacao;
        if (!error && !data) throw new Error("Material não encontrado ou sem permissão para editar.");
      } else {
        ({ error } = await supabase.from("materiais").insert(dadosMaterial));
      }

      if (error) throw error;

      const estavaEditando = materialEditando !== null;
      limparFormulario();
      await carregarMateriais();
      mostrarMensagem(
        estavaEditando ? "Material atualizado com sucesso!" : "Material cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar material:", erro);
      let texto = erro.message || "Ocorreu um erro ao salvar o material.";
      if (texto.toLowerCase().includes("row-level security") || texto.toLowerCase().includes("rls")) {
        texto = "O Supabase bloqueou a gravação. Confira as políticas RLS no arquivo supabase/setup.sql.";
      }
      mostrarMensagem(texto, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirMaterial(id) {
    if (!supabaseConfigurado) {
      mostrarMensagem("Supabase não configurado. Confira o arquivo .env.", "erro");
      return;
    }

    try {
      const { data: usuarioData, error: usuarioErro } = await supabase.auth.getUser();
      if (usuarioErro) throw usuarioErro;
      if (!usuarioData.user) {
        mostrarMensagem("Faça login novamente para excluir o material.", "erro");
        return;
      }

      const { data, error } = await supabase
        .from("materiais")
        .delete()
        .eq("id", id)
        .eq("user_id", usuarioData.user.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Material não encontrado ou sem permissão para excluir.");
      if (materialEditando === id) limparFormulario();
      setConfirmarExclusaoId(null);
      await carregarMateriais();
      mostrarMensagem("Material excluído com sucesso.", "sucesso");
    } catch (erro) {
      console.error("Erro ao excluir material:", erro);
      mostrarMensagem(`Não foi possível excluir o material. ${erro.message || "Verifique as permissões da tabela materiais."}`, "erro");
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, telaGrande && styles.containerGrande]}
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
            <Image source={require("../../assets/voltar.png")} style={styles.imageVoltar} />
          </TouchableOpacity>
          <View style={styles.tituloArea}>
            <Text style={[styles.titulo, telaGrande && styles.tituloGrande]}>
              Gerenciar Materiais
            </Text>
            <Text style={styles.subtitulo}>Cadastre, edite e exclua materiais</Text>
          </View>
        </View>

        {/* FORMULÁRIO */}
        <View style={[styles.formCard, telaGrande && styles.formCardGrande]}>
          <Text style={styles.tituloFormulario}>
            {materialEditando !== null ? "Editar material" : "Novo material"}
          </Text>

          {/* NOME */}
          <Text style={styles.label}>Nome do Material</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Vergalhão"
            placeholderTextColor="#8A8A8A"
            value={nome}
            onChangeText={setNome}
          />

          {/* PESO UNITÁRIO */}
          <Text style={styles.label}>Peso Unitário (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 25,5"
            placeholderTextColor="#8A8A8A"
            value={pesoUnitario}
            onChangeText={setPesoUnitario}
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
                {materialEditando !== null ? "Salvar alterações" : "Cadastrar Material"}
              </Text>
            )}
          </TouchableOpacity>

          {materialEditando !== null ? (
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

        {/* LISTA DOS MATERIAIS GRAVADOS NO SUPABASE */}
        <View style={styles.areaLista}>
          <View style={styles.tituloListaLinha}>
            <Text style={styles.tituloLista}>Materiais cadastrados</Text>
            <View style={styles.contador}>
              <Text style={styles.textoContador}>{materiais.length}</Text>
            </View>
          </View>

          {carregandoLista ? (
            <View style={styles.estadoLista}>
              <ActivityIndicator color="#C96A22" size="large" />
              <Text style={styles.textoVazio}>Carregando materiais...</Text>
            </View>
          ) : materiais.length === 0 ? (
            <View style={styles.estadoLista}>
              <Text style={styles.textoVazioTitulo}>Nenhum material cadastrado</Text>
              <Text style={styles.textoVazio}>
                Preencha o formulário acima para cadastrar o primeiro material.
              </Text>
            </View>
          ) : (
            materiais.map((material) => (
              <View key={String(material.id)} style={styles.cardMaterial}>
                <View style={styles.dadosMaterial}>
                  <Text style={styles.nomeMaterial}>{material.nome}</Text>
                  <Text style={styles.pesoMaterial}>
                    Peso unitário: {Number(material.peso ?? material.peso_unitario).toLocaleString("pt-BR")} kg
                  </Text>
                  <Text style={styles.categoriaMaterial}>
                    Categoria: {material.categoria || "Geral"}
                  </Text>
                </View>

                <View style={styles.acoesMaterial}>
                  <TouchableOpacity
                    style={styles.botaoEditar}
                    onPress={() => iniciarEdicao(material)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.textoBotaoAcao}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botaoExcluir}
                    onPress={() => setConfirmarExclusaoId(material.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.textoBotaoAcao}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                {confirmarExclusaoId === material.id ? (
                  <View style={styles.confirmacaoExclusao}>
                    <Text style={styles.textoConfirmacao}>Deseja realmente excluir este material?</Text>
                    <View style={styles.botoesConfirmacao}>
                      <TouchableOpacity
                        style={styles.botaoConfirmarExclusao}
                        onPress={() => excluirMaterial(material.id)}
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
  /* CONTAINER */
  container: { flexGrow: 1, backgroundColor: "#E4B89E" },
  conteudo: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 25,
  },
  containerGrande: { justifyContent: "center" },
  conteudoGrande: {
    maxWidth: 650,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 30,
  },
  /* CABEÇALHO */
  cabecalho: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  imageVoltar: { width: 24, height: 24, resizeMode: "contain" },
  tituloArea: { flex: 1 },
  titulo: { fontSize: 25, fontWeight: "800", color: "#252B33" },
  tituloGrande: { fontSize: 28 },
  subtitulo: { fontSize: 14, color: "#5F514A", marginTop: 4 },
  /* CARD */
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
  formCardGrande: { padding: 28, borderRadius: 20 },
  tituloFormulario: { fontSize: 18, fontWeight: "800", color: "#252B33", marginBottom: 18 },
  /* CAMPOS */
  label: { fontSize: 14, fontWeight: "700", color: "#252B33", marginBottom: 7 },
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
  caixaMensagem: { borderRadius: 9, padding: 11, marginBottom: 14 },
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
  botaoCancelar: { height: 45, alignItems: "center", justifyContent: "center", marginTop: 5 },
  botaoCancelarEdicao: { height: 42, alignItems: "center", justifyContent: "center", marginTop: 4 },
  textoCancelar: { color: "#6D5B52", fontSize: 14, fontWeight: "600" },
  /* LISTA */
  areaLista: { marginTop: 27 },
  tituloListaLinha: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 9 },
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
  textoVazioTitulo: { color: "#252B33", fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 7 },
  textoVazio: { color: "#806C61", fontSize: 13, textAlign: "center", marginTop: 8 },
  cardMaterial: {
    backgroundColor: "#FFF9F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0C8B9",
    padding: 16,
    marginBottom: 12,
  },
  dadosMaterial: { marginBottom: 12 },
  nomeMaterial: { fontSize: 16, fontWeight: "800", color: "#252B33", marginBottom: 4 },
  pesoMaterial: { fontSize: 13, color: "#5F514A", marginBottom: 3 },
  categoriaMaterial: { fontSize: 12, color: "#806C61" },
  acoesMaterial: { flexDirection: "row", gap: 10 },
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
  confirmacaoExclusao: { marginTop: 13, padding: 12, borderRadius: 9, backgroundColor: "#FEE2E2" },
  textoConfirmacao: { color: "#991B1B", fontSize: 13, fontWeight: "700", marginBottom: 10 },
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
  rodape: { textAlign: "center", color: "#806C61", fontSize: 12, marginTop: 22 },
});

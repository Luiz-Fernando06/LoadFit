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

export default function TelaCadastroCliente({ navigation }) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");

  const { width } = useWindowDimensions();
  const telaGrande = width >= 768;

  function mostrarMensagem(texto, tipo = "info") {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  const carregarClientes = useCallback(async () => {
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
        setClientes([]);
        mostrarMensagem("Faça login para consultar seus clientes.", "erro");
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .select("id, user_id, nome, endereco, cidade, estado, criado_em")
        .eq("user_id", usuarioData.user.id)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (erro) {
      console.error("Erro ao carregar clientes:", erro);
      const detalhe = String(erro.message || "");
      mostrarMensagem(
        detalhe.includes("clientes") && (detalhe.includes("schema cache") || detalhe.includes("does not exist"))
          ? "A tabela clientes ainda não existe no Supabase. Execute o arquivo supabase/atualizacao_clientes_motoristas.sql no SQL Editor."
          : `Não foi possível carregar os clientes. ${detalhe || "Confira a tabela clientes e as políticas RLS no Supabase."}`,
        "erro"
      );
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  // Atualiza a lista toda vez que esta tela recebe foco.
  useFocusEffect(
    useCallback(() => {
      carregarClientes();
    }, [carregarClientes])
  );

  function limparFormulario() {
    setNome("");
    setEndereco("");
    setCidade("");
    setEstado("");
    setClienteEditando(null);
    setConfirmarExclusaoId(null);
  }

  function iniciarEdicao(cliente) {
    setClienteEditando(cliente.id);
    setNome(cliente.nome || "");
    setEndereco(cliente.endereco || "");
    setCidade(cliente.cidade || "");
    setEstado(cliente.estado || "");
    setConfirmarExclusaoId(null);
    mostrarMensagem("Edite os campos e clique em Salvar alterações.", "info");
  }

  async function handleSalvar() {
    const dadosCliente = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
    };

    if (!dadosCliente.nome || !dadosCliente.endereco || !dadosCliente.cidade || !dadosCliente.estado) {
      mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
      return;
    }
    if (dadosCliente.estado.length !== 2) {
      mostrarMensagem("Informe a sigla do estado com duas letras, por exemplo RJ.", "erro");
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

      let error;
      if (clienteEditando !== null) {
        const { data, error: erroAtualizacao } = await supabase
          .from("clientes")
          .update(dadosCliente)
          .eq("id", clienteEditando)
          .eq("user_id", usuarioData.user.id)
          .select("id")
          .maybeSingle();
        error = erroAtualizacao;
        if (!error && !data) throw new Error("Cliente não encontrado ou sem permissão para editar.");
      } else {
        ({ error } = await supabase.from("clientes").insert({
          ...dadosCliente,
          user_id: usuarioData.user.id,
        }));
      }

      if (error) throw error;
      const estavaEditando = clienteEditando !== null;
      limparFormulario();
      await carregarClientes();
      mostrarMensagem(
        estavaEditando ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!",
        "sucesso"
      );
    } catch (erro) {
      console.error("Erro ao salvar cliente:", erro);
      let texto = erro.message || "Ocorreu um erro ao salvar o cliente.";
      if (texto.toLowerCase().includes("row-level security") || texto.toLowerCase().includes("rls")) {
        texto = "O Supabase bloqueou a gravação. Execute as políticas RLS do arquivo SQL atualizado.";
      }
      mostrarMensagem(texto, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente(id) {
    try {
      const { data: usuarioData, error: usuarioErro } = await supabase.auth.getUser();
      if (usuarioErro) throw usuarioErro;
      if (!usuarioData.user) {
        mostrarMensagem("Faça login novamente para excluir o cliente.", "erro");
        return;
      }

      const { data, error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id)
        .eq("user_id", usuarioData.user.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Cliente não encontrado ou sem permissão para excluir.");
      if (clienteEditando === id) limparFormulario();
      setConfirmarExclusaoId(null);
      await carregarClientes();
      mostrarMensagem("Cliente excluído com sucesso.", "sucesso");
    } catch (erro) {
      console.error("Erro ao excluir cliente:", erro);
      mostrarMensagem(`Não foi possível excluir o cliente. ${erro.message || "Verifique as permissões da tabela clientes."}`, "erro");
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
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Image source={require("../../assets/voltar.png")} style={styles.imageVoltar} />
          </TouchableOpacity>
          <View style={styles.tituloArea}>
            <Text style={[styles.titulo, telaGrande && styles.tituloGrande]}>
              Gerenciar Clientes
            </Text>
            <Text style={styles.subtitulo}>Cadastre, edite e exclua clientes</Text>
          </View>
        </View>

        {/* FORMULÁRIO */}
        <View style={[styles.formCard, telaGrande && styles.formCardGrande]}>
          <Text style={styles.tituloFormulario}>
            {clienteEditando !== null ? "Editar cliente" : "Novo cliente"}
          </Text>

          {/* NOME */}
          <Text style={styles.label}>Nome do Cliente</Text>
          <TextInput style={styles.input} placeholder="Ex: João da Silva" placeholderTextColor="#8A8A8A" value={nome} onChangeText={setNome} />

          {/* ENDEREÇO */}
          <Text style={styles.label}>Endereço</Text>
          <TextInput style={styles.input} placeholder="Ex: Rua das Flores, 100" placeholderTextColor="#8A8A8A" value={endereco} onChangeText={setEndereco} />

          {/* CIDADE */}
          <Text style={styles.label}>Cidade</Text>
          <TextInput style={styles.input} placeholder="Ex: São Gonçalo" placeholderTextColor="#8A8A8A" value={cidade} onChangeText={setCidade} />

          {/* ESTADO */}
          <Text style={styles.label}>Estado</Text>
          <TextInput style={styles.input} placeholder="Ex: RJ" placeholderTextColor="#8A8A8A" value={estado} onChangeText={setEstado} autoCapitalize="characters" maxLength={2} />

          {mensagem ? (
            <View style={[styles.caixaMensagem, tipoMensagem === "erro" && styles.caixaErro, tipoMensagem === "sucesso" && styles.caixaSucesso, tipoMensagem === "info" && styles.caixaInfo]}>
              <Text style={[styles.textoMensagem, tipoMensagem === "erro" && styles.textoErro, tipoMensagem === "sucesso" && styles.textoSucesso, tipoMensagem === "info" && styles.textoInfo]}>{mensagem}</Text>
            </View>
          ) : null}

          {/* BOTÃO CADASTRAR / SALVAR ALTERAÇÕES */}
          <TouchableOpacity style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]} onPress={handleSalvar} activeOpacity={0.8} disabled={salvando}>
            {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.textoBotao}>{clienteEditando !== null ? "Salvar alterações" : "Cadastrar Cliente"}</Text>}
          </TouchableOpacity>

          {clienteEditando !== null ? (
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => { limparFormulario(); mostrarMensagem("Edição cancelada.", "info"); }} activeOpacity={0.7}>
              <Text style={styles.textoCancelar}>Cancelar edição</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.textoCancelar}>Voltar ao menu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTA DE CLIENTES GRAVADOS NO SUPABASE */}
        <View style={styles.areaLista}>
          <View style={styles.tituloListaLinha}>
            <Text style={styles.tituloLista}>Clientes cadastrados</Text>
            <View style={styles.contador}><Text style={styles.textoContador}>{clientes.length}</Text></View>
          </View>

          {carregandoLista ? (
            <View style={styles.estadoLista}><ActivityIndicator color="#C96A22" size="large" /><Text style={styles.textoVazio}>Carregando clientes...</Text></View>
          ) : clientes.length === 0 ? (
            <View style={styles.estadoLista}><Text style={styles.textoVazioTitulo}>Nenhum cliente cadastrado</Text><Text style={styles.textoVazio}>Preencha o formulário acima para cadastrar o primeiro cliente.</Text></View>
          ) : (
            clientes.map((cliente) => (
              <View key={String(cliente.id)} style={styles.cardRegistro}>
                <View style={styles.dadosRegistro}>
                  <Text style={styles.nomeRegistro}>{cliente.nome}</Text>
                  <Text style={styles.detalheRegistro}>{cliente.endereco}</Text>
                  <Text style={styles.detalheRegistro}>{cliente.cidade}, {cliente.estado}</Text>
                </View>
                <View style={styles.acoesRegistro}>
                  <TouchableOpacity style={styles.botaoEditar} onPress={() => iniciarEdicao(cliente)} activeOpacity={0.8}><Text style={styles.textoBotaoAcao}>Editar</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.botaoExcluir} onPress={() => setConfirmarExclusaoId(cliente.id)} activeOpacity={0.8}><Text style={styles.textoBotaoAcao}>Excluir</Text></TouchableOpacity>
                </View>
                {confirmarExclusaoId === cliente.id ? (
                  <View style={styles.confirmacaoExclusao}>
                    <Text style={styles.textoConfirmacao}>Deseja realmente excluir este cliente?</Text>
                    <View style={styles.botoesConfirmacao}>
                      <TouchableOpacity style={styles.botaoConfirmarExclusao} onPress={() => excluirCliente(cliente.id)} activeOpacity={0.8}><Text style={styles.textoBotaoAcao}>Sim, excluir</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.botaoCancelarExclusao} onPress={() => setConfirmarExclusaoId(null)} activeOpacity={0.8}><Text style={styles.textoCancelarExclusao}>Cancelar</Text></TouchableOpacity>
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
  container: { flexGrow: 1, backgroundColor: "#E4B89E" },
  conteudo: { flex: 1, width: "100%", paddingHorizontal: 22, paddingTop: 35, paddingBottom: 25 },
  containerGrande: { justifyContent: "center" },
  conteudoGrande: { maxWidth: 650, width: "100%", alignSelf: "center", paddingHorizontal: 30, paddingTop: 30, paddingBottom: 30 },
  cabecalho: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  botaoVoltar: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  imageVoltar: { width: 24, height: 24, resizeMode: "contain" },
  tituloArea: { flex: 1 },
  titulo: { fontSize: 25, fontWeight: "800", color: "#252B33" },
  tituloGrande: { fontSize: 28 },
  subtitulo: { fontSize: 14, color: "#5F514A", marginTop: 4 },
  formCard: { width: "100%", backgroundColor: "#FFF9F5", borderRadius: 18, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  formCardGrande: { padding: 28, borderRadius: 20 },
  tituloFormulario: { fontSize: 18, fontWeight: "800", color: "#252B33", marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#252B33", marginBottom: 7 },
  input: { height: 50, width: "100%", backgroundColor: "#F3E5DD", borderWidth: 1, borderColor: "#E0C8B9", borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: "#252B33", marginBottom: 18 },
  caixaMensagem: { borderRadius: 9, padding: 11, marginBottom: 14 },
  caixaErro: { backgroundColor: "#FEE2E2" },
  caixaSucesso: { backgroundColor: "#DCFCE7" },
  caixaInfo: { backgroundColor: "#DBEAFE" },
  textoMensagem: { fontSize: 13, textAlign: "center", fontWeight: "600" },
  textoErro: { color: "#B91C1C" },
  textoSucesso: { color: "#166534" },
  textoInfo: { color: "#1D4ED8" },
  botaoSalvar: { width: "100%", height: 52, backgroundColor: "#C96A22", borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 5 },
  botaoDesabilitado: { opacity: 0.65 },
  textoBotao: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  botaoCancelar: { height: 45, alignItems: "center", justifyContent: "center", marginTop: 5 },
  textoCancelar: { color: "#6D5B52", fontSize: 14, fontWeight: "600" },
  areaLista: { marginTop: 27 },
  tituloListaLinha: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 9 },
  tituloLista: { fontSize: 19, fontWeight: "800", color: "#252B33" },
  contador: { minWidth: 25, height: 25, borderRadius: 13, paddingHorizontal: 7, backgroundColor: "#F5D0B8", alignItems: "center", justifyContent: "center" },
  textoContador: { color: "#9A4A13", fontSize: 12, fontWeight: "800" },
  estadoLista: { backgroundColor: "#FFF9F5", borderRadius: 16, borderWidth: 1, borderColor: "#E0C8B9", padding: 24, alignItems: "center" },
  textoVazioTitulo: { color: "#252B33", fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 7 },
  textoVazio: { color: "#806C61", fontSize: 13, textAlign: "center", marginTop: 8 },
  cardRegistro: { backgroundColor: "#FFF9F5", borderRadius: 14, borderWidth: 1, borderColor: "#E0C8B9", padding: 16, marginBottom: 12 },
  dadosRegistro: { marginBottom: 12 },
  nomeRegistro: { fontSize: 16, fontWeight: "800", color: "#252B33", marginBottom: 5 },
  detalheRegistro: { fontSize: 13, color: "#5F514A", marginBottom: 3 },
  acoesRegistro: { flexDirection: "row", gap: 10 },
  botaoEditar: { flex: 1, backgroundColor: "#2563EB", borderRadius: 9, minHeight: 40, justifyContent: "center", alignItems: "center" },
  botaoExcluir: { flex: 1, backgroundColor: "#B91C1C", borderRadius: 9, minHeight: 40, justifyContent: "center", alignItems: "center" },
  textoBotaoAcao: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  confirmacaoExclusao: { marginTop: 13, padding: 12, borderRadius: 9, backgroundColor: "#FEE2E2" },
  textoConfirmacao: { color: "#991B1B", fontSize: 13, fontWeight: "700", marginBottom: 10 },
  botoesConfirmacao: { flexDirection: "row", gap: 10 },
  botaoConfirmarExclusao: { flex: 1, backgroundColor: "#B91C1C", minHeight: 38, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  botaoCancelarExclusao: { flex: 1, backgroundColor: "#FFFFFF", minHeight: 38, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FCA5A5" },
  textoCancelarExclusao: { color: "#991B1B", fontSize: 13, fontWeight: "700" },
  rodape: { textAlign: "center", color: "#806C61", fontSize: 12, marginTop: 22 },
});

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase, supabaseConfigurado } from "./servicos/supabase";
import ModalSelecao from "./componentes/ModalSelecao";
import ModalData from "./componentes/ModalData";

function hojeBR() {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
}

function dataParaISO(valor) {
  const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor || "");
  if (!correspondencia) return null;
  const dia = Number(correspondencia[1]);
  const mes = Number(correspondencia[2]);
  const ano = Number(correspondencia[3]);
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function pesoMaterial(material) {
  return Number(material?.peso_unitario ?? material?.peso ?? 0);
}

export default function TelaCadastroPedido({ navigation }) {
  const [cliente, setCliente] = useState(null);
  const [dataPrevista, setDataPrevista] = useState(hojeBR());
  const [observacao, setObservacao] = useState("");
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState("");
  const [itens, setItens] = useState([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState([]);
  const [modalSelecao, setModalSelecao] = useState(null);
  const [modalDataVisivel, setModalDataVisivel] = useState(false);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");

  const { width } = useWindowDimensions();
  const telaGrande = width >= 768;

  function mostrarMensagem(texto, tipo = "info") {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  const carregarOpcoes = useCallback(async () => {
    setCarregandoOpcoes(true);
    if (!supabaseConfigurado) {
      mostrarMensagem("Configure a URL e a chave do Supabase no arquivo .env e reinicie o Expo.", "erro");
      setCarregandoOpcoes(false);
      return;
    }

    try {
      const { data: sessao, error: erroUsuario } = await supabase.auth.getUser();
      if (erroUsuario) throw erroUsuario;
      if (!sessao.user) {
        setClientesDisponiveis([]);
        setMateriaisDisponiveis([]);
        mostrarMensagem("Entre no sistema para carregar clientes e materiais.", "erro");
        return;
      }

      const [clientesResposta, materiaisResposta] = await Promise.all([
        supabase
          .from("clientes")
          .select("id, nome, endereco, cidade, estado")
          .eq("user_id", sessao.user.id)
          .order("nome", { ascending: true }),
        supabase
          .from("materiais")
          .select("id, nome, categoria, peso, peso_unitario, quantidade")
          .eq("user_id", sessao.user.id)
          .order("nome", { ascending: true }),
      ]);

      if (clientesResposta.error) throw clientesResposta.error;
      if (materiaisResposta.error) throw materiaisResposta.error;
      setClientesDisponiveis(clientesResposta.data || []);
      setMateriaisDisponiveis(materiaisResposta.data || []);
      mostrarMensagem("Clientes e materiais carregados do Supabase.", "sucesso");
    } catch (erro) {
      console.error("Erro ao carregar opções do pedido:", erro);
      mostrarMensagem(`Não foi possível buscar clientes e materiais: ${erro.message || "verifique a conexão e as políticas RLS."}`, "erro");
    } finally {
      setCarregandoOpcoes(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarOpcoes();
    }, [carregarOpcoes])
  );

  function selecionarCliente(clienteEscolhido) {
    setCliente(clienteEscolhido);
    setModalSelecao(null);
  }

  function selecionarMaterial(materialEscolhido) {
    setMaterialSelecionado(materialEscolhido);
    setModalSelecao(null);
  }

  function adicionarItem() {
    if (!materialSelecionado) {
      mostrarMensagem("Selecione um material cadastrado.", "erro");
      return;
    }

    const quantidadeNumerica = Number(String(quantidade).trim().replace(",", "."));
    const unitario = pesoMaterial(materialSelecionado);
    if (!Number.isFinite(quantidadeNumerica) || quantidadeNumerica <= 0) {
      mostrarMensagem("Informe uma quantidade maior que zero.", "erro");
      return;
    }
    if (!Number.isFinite(unitario) || unitario <= 0) {
      mostrarMensagem("O material selecionado não possui peso unitário válido. Corrija o cadastro do material.", "erro");
      return;
    }

    const novoItem = {
      id: `${Date.now()}-${Math.random()}`,
      material_id: materialSelecionado.id,
      material: materialSelecionado,
      quantidade: quantidadeNumerica,
      peso_unitario: unitario,
      peso_total: Number((quantidadeNumerica * unitario).toFixed(2)),
    };
    setItens((atuais) => [...atuais, novoItem]);
    setMaterialSelecionado(null);
    setQuantidade("");
    mostrarMensagem("Material adicionado ao pedido.", "sucesso");
  }

  function removerItem(id) {
    setItens((atuais) => atuais.filter((item) => item.id !== id));
  }

  const pesoTotalPedido = Number(itens.reduce((total, item) => total + item.peso_total, 0).toFixed(2));

  async function criarPedido() {
    if (!cliente) {
      mostrarMensagem("Selecione um cliente cadastrado.", "erro");
      return;
    }

    const dataISO = dataParaISO(dataPrevista);
    if (!dataISO) {
      mostrarMensagem("Informe uma data válida no formato DD/MM/AAAA.", "erro");
      return;
    }

    if (itens.length === 0) {
      mostrarMensagem("Adicione pelo menos um material ao pedido.", "erro");
      return;
    }

    if (!supabaseConfigurado) {
      mostrarMensagem("Supabase não configurado. Confira o arquivo .env.", "erro");
      return;
    }

    setSalvando(true);
    mostrarMensagem("");
    let pedidoCriadoId = null;
    try {
      const { data: sessao, error: erroUsuario } = await supabase.auth.getUser();
      if (erroUsuario) throw erroUsuario;
      if (!sessao.user) throw new Error("Sua sessão expirou. Entre novamente no LoadFit.");

      const { data: pedidoCriado, error: erroPedido } = await supabase
        .from("pedidos")
        .insert({
          user_id: sessao.user.id,
          cliente_id: cliente.id,
          data_prevista: dataISO,
          observacao: observacao.trim(),
          peso_total: pesoTotalPedido,
          status: "PENDENTE",
        })
        .select("id")
        .single();

      if (erroPedido) throw erroPedido;
      pedidoCriadoId = pedidoCriado.id;

      const itensParaSalvar = itens.map((item) => ({
        user_id: sessao.user.id,
        pedido_id: pedidoCriadoId,
        material_id: item.material_id,
        quantidade: item.quantidade,
        peso_unitario: item.peso_unitario,
        peso_total: item.peso_total,
      }));

      const { error: erroItens } = await supabase.from("pedido_itens").insert(itensParaSalvar);
      if (erroItens) {
        await supabase.from("pedidos").delete().eq("id", pedidoCriadoId).eq("user_id", sessao.user.id);
        throw erroItens;
      }

      mostrarMensagem(`Pedido #${pedidoCriadoId} salvo no Supabase com sucesso!`, "sucesso");
      setCliente(null);
      setDataPrevista(hojeBR());
      setObservacao("");
      setMaterialSelecionado(null);
      setQuantidade("");
      setItens([]);
    } catch (erro) {
      console.error("Erro ao salvar pedido:", erro);
      let texto = erro.message || "Não foi possível salvar o pedido.";
      if (String(texto).toLowerCase().includes("relation") || String(texto).toLowerCase().includes("schema cache")) {
        texto = "As tabelas pedidos e pedido_itens não foram encontradas. Execute supabase/atualizacao_pedidos_cargas.sql no SQL Editor.";
      } else if (String(texto).toLowerCase().includes("row-level security") || String(texto).toLowerCase().includes("rls")) {
        texto = "O Supabase bloqueou a gravação. Confira as políticas RLS das tabelas pedidos e pedido_itens.";
      }
      mostrarMensagem(texto, "erro");
    } finally {
      setSalvando(false);
    }
  }

  const modalItens = modalSelecao === "cliente" ? clientesDisponiveis : materiaisDisponiveis;

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, telaGrande && styles.containerGrande]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.conteudo, telaGrande && styles.conteudoGrande]}>
          {/* CABEÇALHO */}
          <View style={styles.cabecalho}>
            <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.textoVoltar}>‹</Text>
            </TouchableOpacity>
            <View style={styles.tituloArea}>
              <Text style={[styles.titulo, telaGrande && styles.tituloGrande]}>Novo Pedido</Text>
              <Text style={styles.subtitulo}>Cadastre um novo pedido</Text>
            </View>
          </View>

          {carregandoOpcoes && (
            <View style={styles.avisoCarregando}>
              <ActivityIndicator color="#C96A22" />
              <Text style={styles.textoCarregando}>Buscando clientes e materiais cadastrados...</Text>
            </View>
          )}

          {!!mensagem && (
            <View style={[styles.mensagem, tipoMensagem === "erro" ? styles.mensagemErro : tipoMensagem === "sucesso" ? styles.mensagemSucesso : styles.mensagemInfo]}>
              <Text style={styles.textoMensagem}>{mensagem}</Text>
            </View>
          )}

          {/* DADOS DO PEDIDO */}
          <View style={[styles.card, telaGrande && styles.cardGrande]}>
            <Text style={styles.tituloCard}>Dados do Pedido</Text>

            <Text style={styles.label}>Cliente</Text>
            <TouchableOpacity style={styles.seletor} onPress={() => setModalSelecao("cliente")} activeOpacity={0.8}>
              <Text style={cliente ? styles.textoSeletor : styles.placeholder}>{cliente ? cliente.nome : "Selecionar cliente"}</Text>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Data prevista</Text>
            <TouchableOpacity style={styles.seletor} onPress={() => setModalDataVisivel(true)} activeOpacity={0.8}>
              <Text style={dataPrevista ? styles.textoSeletor : styles.placeholder}>{dataPrevista || "Selecionar data"}</Text>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={styles.inputObservacao}
              placeholder="Digite uma observação sobre o pedido"
              placeholderTextColor="#8A8A8A"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ITENS DO PEDIDO */}
          <View style={[styles.card, telaGrande && styles.cardGrande]}>
            <Text style={styles.tituloCard}>Itens do Pedido</Text>
            <Text style={styles.descricaoCard}>Adicione os materiais e suas quantidades</Text>

            <Text style={styles.label}>Material</Text>
            <TouchableOpacity style={styles.seletor} onPress={() => setModalSelecao("material")} activeOpacity={0.8}>
              <Text style={materialSelecionado ? styles.textoSeletor : styles.placeholder}>
                {materialSelecionado ? materialSelecionado.nome : "Selecionar material"}
              </Text>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>

            {materialSelecionado && (
              <Text style={styles.detalheMaterial}>
                Peso unitário: {pesoMaterial(materialSelecionado)} kg
                {materialSelecionado.categoria ? ` • ${materialSelecionado.categoria}` : ""}
              </Text>
            )}

            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              placeholderTextColor="#8A8A8A"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarItem} activeOpacity={0.8}>
              <Text style={styles.textoAdicionar}>+ Adicionar Material</Text>
            </TouchableOpacity>

            {itens.length > 0 && (
              <View style={styles.listaItens}>
                <Text style={styles.tituloLista}>Materiais adicionados</Text>
                {itens.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemInformacoes}>
                      <Text style={styles.itemNome}>{item.material.nome}</Text>
                      <Text style={styles.itemDetalhes}>{item.quantidade} un. • {item.peso_unitario} kg/un</Text>
                    </View>
                    <View style={styles.itemDireita}>
                      <Text style={styles.itemPeso}>{item.peso_total} kg</Text>
                      <TouchableOpacity onPress={() => removerItem(item.id)}>
                        <Text style={styles.remover}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* RESUMO */}
          <View style={[styles.card, telaGrande && styles.cardGrande]}>
            <Text style={styles.tituloCard}>Resumo do Pedido</Text>
            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>Tipos de materiais</Text>
              <Text style={styles.valorResumo}>{itens.length}</Text>
            </View>
            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>Peso total</Text>
              <Text style={styles.valorPeso}>{pesoTotalPedido} kg</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.botaoCriar, salvando && styles.botaoDesabilitado]} onPress={criarPedido} disabled={salvando} activeOpacity={0.8}>
            {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.textoBotaoCriar}>Salvar Pedido</Text>}
          </TouchableOpacity>

          <Text style={styles.rodape}>LoadFit • Organizador de Cargas</Text>
        </View>
      </ScrollView>

      <ModalSelecao
        visible={modalSelecao !== null}
        titulo={modalSelecao === "cliente" ? "Selecionar Cliente" : "Selecionar Material"}
        itens={modalItens}
        onFechar={() => setModalSelecao(null)}
        onSelecionar={modalSelecao === "cliente" ? selecionarCliente : selecionarMaterial}
        rotuloItem={(item) => item.nome}
        detalheItem={(item) => modalSelecao === "cliente"
          ? [item.cidade, item.estado].filter(Boolean).join(" / ")
          : `${pesoMaterial(item)} kg por unidade${item.categoria ? ` • ${item.categoria}` : ""}`}
        mensagemVazia={modalSelecao === "cliente"
          ? "Nenhum cliente cadastrado. Acesse Gerenciar Clientes para cadastrar um cliente primeiro."
          : "Nenhum material cadastrado. Acesse Gerenciar Materiais para cadastrar materiais primeiro."}
      />

      <ModalData
        visible={modalDataVisivel}
        valorInicial={dataPrevista}
        onFechar={() => setModalDataVisivel(false)}
        onSalvar={(valor) => {
          if (!dataParaISO(valor)) {
            mostrarMensagem("Informe uma data válida no formato DD/MM/AAAA.", "erro");
            return;
          }
          setDataPrevista(valor);
          setModalDataVisivel(false);
          mostrarMensagem("");
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#E4B89E" },
  conteudo: { flex: 1, width: "100%", paddingHorizontal: 22, paddingTop: 35, paddingBottom: 25 },
  containerGrande: { justifyContent: "center" },
  conteudoGrande: { maxWidth: 700, width: "100%", alignSelf: "center", paddingHorizontal: 30, paddingTop: 30, paddingBottom: 30 },
  cabecalho: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  botaoVoltar: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#252B33", alignItems: "center", justifyContent: "center", marginRight: 14 },
  textoVoltar: { color: "#FFFFFF", fontSize: 32, fontWeight: "300", lineHeight: 34, marginTop: -4 },
  tituloArea: { flex: 1 },
  titulo: { fontSize: 25, fontWeight: "800", color: "#252B33" },
  tituloGrande: { fontSize: 28 },
  subtitulo: { fontSize: 14, color: "#5F514A", marginTop: 4 },
  card: { width: "100%", backgroundColor: "#FFF9F5", borderRadius: 18, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardGrande: { padding: 28, borderRadius: 20 },
  tituloCard: { fontSize: 17, fontWeight: "800", color: "#252B33", marginBottom: 16 },
  descricaoCard: { fontSize: 12, color: "#806C61", marginTop: -10, marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#252B33", marginBottom: 7 },
  seletor: { minHeight: 50, width: "100%", backgroundColor: "#F3E5DD", borderWidth: 1, borderColor: "#E0C8B9", borderRadius: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  placeholder: { color: "#8A8A8A", fontSize: 15, flex: 1 },
  textoSeletor: { color: "#252B33", fontSize: 15, fontWeight: "600", flex: 1 },
  seta: { color: "#C96A22", fontSize: 25, fontWeight: "600", marginLeft: 10 },
  input: { height: 50, width: "100%", backgroundColor: "#F3E5DD", borderWidth: 1, borderColor: "#E0C8B9", borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: "#252B33", marginBottom: 18 },
  inputObservacao: { width: "100%", minHeight: 100, backgroundColor: "#F3E5DD", borderWidth: 1, borderColor: "#E0C8B9", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#252B33", marginBottom: 5 },
  detalheMaterial: { fontSize: 12, color: "#806C61", marginTop: -12, marginBottom: 14 },
  botaoAdicionar: { width: "100%", minHeight: 48, backgroundColor: "#C96A22", borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: -2 },
  textoAdicionar: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  listaItens: { marginTop: 18, borderTopWidth: 1, borderTopColor: "#E0C8B9", paddingTop: 14 },
  tituloLista: { fontSize: 14, fontWeight: "800", color: "#252B33", marginBottom: 8 },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0DED3" },
  itemInformacoes: { flex: 1, paddingRight: 10 },
  itemNome: { fontSize: 14, fontWeight: "700", color: "#252B33" },
  itemDetalhes: { fontSize: 12, color: "#806C61", marginTop: 3 },
  itemDireita: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemPeso: { fontSize: 13, fontWeight: "800", color: "#252B33" },
  remover: { color: "#B42318", fontSize: 25, fontWeight: "800", paddingHorizontal: 5 },
  linhaResumo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  textoResumo: { color: "#806C61", fontSize: 13 },
  valorResumo: { color: "#252B33", fontSize: 14, fontWeight: "800" },
  valorPeso: { color: "#C96A22", fontSize: 15, fontWeight: "800" },
  botaoCriar: { width: "100%", minHeight: 48, borderRadius: 10, backgroundColor: "#252B33", alignItems: "center", justifyContent: "center", marginTop: -2 },
  botaoDesabilitado: { opacity: 0.65 },
  textoBotaoCriar: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  rodape: { textAlign: "center", fontSize: 11, color: "#806C61", marginTop: 20 },
  avisoCarregando: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 },
  textoCarregando: { color: "#5F514A", fontSize: 12 },
  mensagem: { borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, marginBottom: 14 },
  mensagemErro: { backgroundColor: "#FDE2E2" },
  mensagemSucesso: { backgroundColor: "#E1F4E8" },
  mensagemInfo: { backgroundColor: "#F5E6D9" },
  textoMensagem: { color: "#252B33", fontSize: 12, lineHeight: 17 },
});

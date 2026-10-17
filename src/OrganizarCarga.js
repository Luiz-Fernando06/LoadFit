import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
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

function dataParaBR(valor) {
  if (!valor) return "Data não informada";
  const partes = String(valor).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
}

export default function OrganizarCarga({ navigation }) {
  const [dataPrevista, setDataPrevista] = useState(hojeBR());
  const [caminhao, setCaminhao] = useState(null);
  const [motorista, setMotorista] = useState(null);
  const [pedidosCarga, setPedidosCarga] = useState([]);
  const [caminhoesDisponiveis, setCaminhoesDisponiveis] = useState([]);
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState([]);
  const [pedidosDisponiveis, setPedidosDisponiveis] = useState([]);
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
        setCaminhoesDisponiveis([]);
        setMotoristasDisponiveis([]);
        setPedidosDisponiveis([]);
        mostrarMensagem("Entre no sistema para selecionar caminhões, motoristas e pedidos.", "erro");
        return;
      }

      const [caminhoesResposta, motoristasResposta, pedidosResposta, clientesResposta, vinculadosResposta] = await Promise.all([
        supabase
          .from("caminhoes")
          .select("id, placa, marca, modelo, capacidade")
          .eq("user_id", sessao.user.id)
          .order("placa", { ascending: true }),
        supabase
          .from("motoristas")
          .select("id, nome, telefone, cnh, categoria_cnh")
          .eq("user_id", sessao.user.id)
          .order("nome", { ascending: true }),
        supabase
          .from("pedidos")
          .select("id, cliente_id, data_prevista, peso_total, status")
          .eq("user_id", sessao.user.id)
          .order("criado_em", { ascending: false }),
        supabase
          .from("clientes")
          .select("id, nome")
          .eq("user_id", sessao.user.id),
        supabase
          .from("carga_pedidos")
          .select("pedido_id")
          .eq("user_id", sessao.user.id),
      ]);

      if (caminhoesResposta.error) throw caminhoesResposta.error;
      if (motoristasResposta.error) throw motoristasResposta.error;
      if (pedidosResposta.error) throw pedidosResposta.error;
      if (clientesResposta.error) throw clientesResposta.error;
      if (vinculadosResposta.error) throw vinculadosResposta.error;

      const nomesClientes = new Map((clientesResposta.data || []).map((item) => [String(item.id), item.nome]));
      const idsJaVinculados = new Set((vinculadosResposta.data || []).map((item) => String(item.pedido_id)));
      const pedidosPendentes = (pedidosResposta.data || [])
        .filter((pedido) => String(pedido.status || "PENDENTE").toUpperCase() === "PENDENTE" && !idsJaVinculados.has(String(pedido.id)))
        .map((pedido) => ({ ...pedido, cliente_nome: nomesClientes.get(String(pedido.cliente_id)) || "Cliente não identificado" }));

      setCaminhoesDisponiveis(caminhoesResposta.data || []);
      setMotoristasDisponiveis(motoristasResposta.data || []);
      setPedidosDisponiveis(pedidosPendentes);
      mostrarMensagem("Caminhões, motoristas e pedidos carregados do Supabase.", "sucesso");
    } catch (erro) {
      console.error("Erro ao carregar dados para a carga:", erro);
      let detalhe = erro.message || "Confira a conexão com o Supabase.";
      if (String(detalhe).toLowerCase().includes("pedidos") || String(detalhe).toLowerCase().includes("carga_pedidos")) {
        detalhe = "As tabelas de pedidos e cargas ainda não existem. Execute supabase/atualizacao_pedidos_cargas.sql no SQL Editor.";
      }
      mostrarMensagem(`Não foi possível carregar as opções: ${detalhe}`, "erro");
    } finally {
      setCarregandoOpcoes(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarOpcoes();
    }, [carregarOpcoes])
  );

  const pesoTotal = useMemo(
    () => Number(pedidosCarga.reduce((total, pedido) => total + Number(pedido.peso_total || 0), 0).toFixed(2)),
    [pedidosCarga]
  );
  const capacidade = Number(caminhao?.capacidade || 0);
  const capacidadeRestante = Number((capacidade - pesoTotal).toFixed(2));
  const ocupacao = capacidade > 0 ? Math.round((pesoTotal / capacidade) * 100) : 0;
  const pedidosParaSelecionar = pedidosDisponiveis.filter(
    (pedido) => !pedidosCarga.some((selecionado) => String(selecionado.id) === String(pedido.id))
  );

  function escolherCaminhao(item) {
    setCaminhao(item);
    setModalSelecao(null);
    mostrarMensagem("");
  }

  function escolherMotorista(item) {
    setMotorista(item);
    setModalSelecao(null);
    mostrarMensagem("");
  }

  function adicionarPedido(item) {
    setPedidosCarga((atuais) => (
      atuais.some((pedido) => String(pedido.id) === String(item.id)) ? atuais : [...atuais, item]
    ));
    setModalSelecao(null);
    mostrarMensagem("");
  }

  function removerPedido(id) {
    setPedidosCarga((atuais) => atuais.filter((pedido) => String(pedido.id) !== String(id)));
  }

  async function criarCarga() {
    const dataISO = dataParaISO(dataPrevista);
    if (!dataISO) {
      mostrarMensagem("Informe uma data válida no formato DD/MM/AAAA.", "erro");
      return;
    }
    if (!caminhao) {
      mostrarMensagem("Selecione um caminhão cadastrado.", "erro");
      return;
    }
    if (!motorista) {
      mostrarMensagem("Selecione um motorista cadastrado.", "erro");
      return;
    }
    if (pedidosCarga.length === 0) {
      mostrarMensagem("Adicione pelo menos um pedido à carga.", "erro");
      return;
    }
    if (capacidade <= 0) {
      mostrarMensagem("O caminhão selecionado não tem capacidade válida cadastrada.", "erro");
      return;
    }
    if (pesoTotal > capacidade) {
      mostrarMensagem(`A carga pesa ${pesoTotal} kg e excede a capacidade do caminhão (${capacidade} kg).`, "erro");
      return;
    }
    if (!supabaseConfigurado) {
      mostrarMensagem("Supabase não configurado. Confira o arquivo .env.", "erro");
      return;
    }

    setSalvando(true);
    mostrarMensagem("");
    let cargaCriadaId = null;
    try {
      const { data: sessao, error: erroUsuario } = await supabase.auth.getUser();
      if (erroUsuario) throw erroUsuario;
      if (!sessao.user) throw new Error("Sua sessão expirou. Entre novamente no LoadFit.");

      const { data: cargaCriada, error: erroCarga } = await supabase
        .from("cargas")
        .insert({
          user_id: sessao.user.id,
          data_prevista: dataISO,
          caminhao_id: caminhao.id,
          motorista_id: motorista.id,
          peso_total: pesoTotal,
          status: "PLANEJADA",
        })
        .select("id")
        .single();
      if (erroCarga) throw erroCarga;
      cargaCriadaId = cargaCriada.id;

      const vinculos = pedidosCarga.map((pedido) => ({
        user_id: sessao.user.id,
        carga_id: cargaCriadaId,
        pedido_id: pedido.id,
      }));
      const { error: erroVinculos } = await supabase.from("carga_pedidos").insert(vinculos);
      if (erroVinculos) {
        await supabase.from("cargas").delete().eq("id", cargaCriadaId).eq("user_id", sessao.user.id);
        throw erroVinculos;
      }

      const idsPedidos = pedidosCarga.map((pedido) => pedido.id);
      const { error: erroStatus } = await supabase
        .from("pedidos")
        .update({ status: "ALOCADO" })
        .in("id", idsPedidos)
        .eq("user_id", sessao.user.id);
      if (erroStatus) {
        await supabase.from("carga_pedidos").delete().eq("carga_id", cargaCriadaId).eq("user_id", sessao.user.id);
        await supabase.from("cargas").delete().eq("id", cargaCriadaId).eq("user_id", sessao.user.id);
        throw erroStatus;
      }

      await carregarOpcoes();
      setDataPrevista(hojeBR());
      setCaminhao(null);
      setMotorista(null);
      setPedidosCarga([]);
      mostrarMensagem(`Carga #${cargaCriadaId} criada e salva no Supabase com sucesso!`, "sucesso");
    } catch (erro) {
      console.error("Erro ao criar carga:", erro);
      let detalhe = erro.message || "Não foi possível criar a carga.";
      if (String(detalhe).toLowerCase().includes("relation") || String(detalhe).toLowerCase().includes("schema cache")) {
        detalhe = "As tabelas de cargas não foram encontradas. Execute supabase/atualizacao_pedidos_cargas.sql no SQL Editor.";
      } else if (String(detalhe).toLowerCase().includes("row-level security") || String(detalhe).toLowerCase().includes("rls")) {
        detalhe = "O Supabase bloqueou a gravação. Confira as políticas RLS de cargas e carga_pedidos.";
      }
      mostrarMensagem(`Não foi possível salvar a carga: ${detalhe}`, "erro");
    } finally {
      setSalvando(false);
    }
  }

  const itensModal = modalSelecao === "caminhao"
    ? caminhoesDisponiveis
    : modalSelecao === "motorista"
      ? motoristasDisponiveis
      : pedidosParaSelecionar;

  return (
    <>
      <ScrollView contentContainerStyle={[styles.container, telaGrande && styles.containerGrande]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.conteudo, telaGrande && styles.conteudoGrande]}>
          {/* CABEÇALHO */}
          <View style={styles.cabecalho}>
            <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.textoVoltar}>‹</Text>
            </TouchableOpacity>
            <View style={styles.tituloArea}>
              <Text style={[styles.titulo, telaGrande && styles.tituloGrande]}>Organizar Carga</Text>
              <Text style={styles.subtitulo}>Monte uma nova carga para transporte</Text>
            </View>
          </View>

          {carregandoOpcoes && (
            <View style={styles.avisoCarregando}>
              <ActivityIndicator color="#C96A22" />
              <Text style={styles.textoCarregando}>Buscando caminhões, motoristas e pedidos...</Text>
            </View>
          )}
          {!!mensagem && (
            <View style={[styles.mensagem, tipoMensagem === "erro" ? styles.mensagemErro : tipoMensagem === "sucesso" ? styles.mensagemSucesso : styles.mensagemInfo]}>
              <Text style={styles.textoMensagem}>{mensagem}</Text>
            </View>
          )}

          {/* DADOS DA CARGA */}
          <View style={[styles.card, telaGrande && styles.cardGrande]}>
            <Text style={styles.tituloCard}>Dados da Carga</Text>
            <Text style={styles.label}>Data prevista</Text>
            <TouchableOpacity style={styles.seletor} activeOpacity={0.8} onPress={() => setModalDataVisivel(true)}>
              <Text style={dataPrevista ? styles.textoSeletor : styles.placeholder}>{dataPrevista || "Selecionar data"}</Text>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Caminhão</Text>
            <TouchableOpacity style={styles.seletor} activeOpacity={0.8} onPress={() => setModalSelecao("caminhao")}>
              <Text style={caminhao ? styles.textoSeletor : styles.placeholder}>
                {caminhao ? `${caminhao.placa} • ${caminhao.modelo}` : "Selecionar caminhão"}
              </Text>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>
            {caminhao && <Text style={styles.detalheSeletor}>Capacidade: {capacidade} kg</Text>}

            <Text style={styles.label}>Motorista</Text>
            <TouchableOpacity style={styles.seletor} activeOpacity={0.8} onPress={() => setModalSelecao("motorista")}>
              <Text style={motorista ? styles.textoSeletor : styles.placeholder}>
                {motorista ? motorista.nome : "Selecionar motorista"}
              </Text>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>
            {motorista?.telefone ? <Text style={styles.detalheSeletor}>Telefone: {motorista.telefone}</Text> : null}
          </View>

          {/* PEDIDOS */}
          <View style={[styles.card, telaGrande && styles.cardGrande]}>
            <View style={styles.cabecalhoCard}>
              <View style={styles.tituloPedidosArea}>
                <Text style={styles.tituloCard}>Pedidos</Text>
                <Text style={styles.descricaoCard}>Adicione os pedidos que farão parte da carga</Text>
              </View>
              <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalSelecao("pedido")} activeOpacity={0.8}>
                <Text style={styles.textoAdicionar}>+</Text>
              </TouchableOpacity>
            </View>

            {pedidosCarga.length === 0 ? (
              <View style={styles.pedidosVazio}>
                <Text style={styles.iconeVazio}>+</Text>
                <Text style={styles.textoVazio}>Nenhum pedido adicionado</Text>
                <Text style={styles.subtextoVazio}>Adicione pedidos pendentes para montar a carga</Text>
              </View>
            ) : (
              pedidosCarga.map((pedido) => (
                <View key={String(pedido.id)} style={styles.pedido}>
                  <View style={styles.pedidoInformacoes}>
                    <Text style={styles.pedidoTitulo}>Pedido #{pedido.id} • {pedido.cliente_nome}</Text>
                    <Text style={styles.pedidoDetalhe}>{dataParaBR(pedido.data_prevista)}</Text>
                  </View>
                  <View style={styles.pedidoDireita}>
                    <Text style={styles.pedidoPeso}>{Number(pedido.peso_total || 0)} kg</Text>
                    <TouchableOpacity onPress={() => removerPedido(pedido.id)} accessibilityRole="button">
                      <Text style={styles.removerPedido}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* RESUMO */}
          <View style={[styles.card, telaGrande && styles.cardGrande]}>
            <Text style={styles.tituloCard}>Resumo da Carga</Text>
            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>Peso total</Text>
              <Text style={styles.valorResumo}>{pesoTotal} kg</Text>
            </View>
            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>Capacidade</Text>
              <Text style={styles.valorResumo}>{capacidade} kg</Text>
            </View>
            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>Capacidade restante</Text>
              <Text style={styles.valorResumo}>{Math.max(capacidadeRestante, 0)} kg</Text>
            </View>
            <View style={styles.linhaOcupacao}>
              <Text style={styles.textoResumo}>Ocupação</Text>
              <Text style={[styles.valorOcupacao, ocupacao > 100 && styles.valorExcedido]}>{ocupacao}%</Text>
            </View>
            <View style={styles.barraFundo}>
              <View style={[styles.barraProgresso, { width: `${Math.min(ocupacao, 100)}%` }]} />
            </View>
            {ocupacao > 100 && <Text style={styles.avisoExcedido}>A carga ultrapassa a capacidade do caminhão.</Text>}
          </View>

          <TouchableOpacity style={[styles.botaoCriar, salvando && styles.botaoDesabilitado]} onPress={criarCarga} disabled={salvando} activeOpacity={0.8}>
            {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.textoBotaoCriar}>Criar Carga</Text>}
          </TouchableOpacity>
          <Text style={styles.rodape}>LoadFit • Organizador de Cargas</Text>
        </View>
      </ScrollView>

      <ModalSelecao
        visible={modalSelecao !== null}
        titulo={modalSelecao === "caminhao" ? "Selecionar Caminhão" : modalSelecao === "motorista" ? "Selecionar Motorista" : "Adicionar Pedido à Carga"}
        itens={itensModal}
        onFechar={() => setModalSelecao(null)}
        onSelecionar={modalSelecao === "caminhao" ? escolherCaminhao : modalSelecao === "motorista" ? escolherMotorista : adicionarPedido}
        rotuloItem={(item) => modalSelecao === "caminhao"
          ? `${item.placa} • ${item.modelo}`
          : modalSelecao === "motorista"
            ? item.nome
            : `Pedido #${item.id} • ${item.cliente_nome}`}
        detalheItem={(item) => modalSelecao === "caminhao"
          ? `Capacidade: ${Number(item.capacidade || 0)} kg`
          : modalSelecao === "motorista"
            ? `CNH ${item.cnh || "não informada"} • ${item.telefone || "sem telefone"}`
            : `${dataParaBR(item.data_prevista)} • Peso total: ${Number(item.peso_total || 0)} kg`}
        mensagemVazia={modalSelecao === "caminhao"
          ? "Nenhum caminhão cadastrado. Acesse Gerenciar Caminhões para cadastrar um veículo."
          : modalSelecao === "motorista"
            ? "Nenhum motorista cadastrado. Acesse Gerenciar Motoristas para cadastrar um motorista."
            : pedidosDisponiveis.length === 0
              ? "Não há pedidos pendentes disponíveis. Cadastre um pedido primeiro ou verifique se ele já foi incluído em outra carga."
              : "Todos os pedidos disponíveis já foram adicionados a esta carga."}
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
  descricaoCard: { fontSize: 12, color: "#806C61", marginTop: -10 },
  label: { fontSize: 14, fontWeight: "700", color: "#252B33", marginBottom: 7 },
  seletor: { minHeight: 50, width: "100%", backgroundColor: "#F3E5DD", borderWidth: 1, borderColor: "#E0C8B9", borderRadius: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  placeholder: { color: "#8A8A8A", fontSize: 15, flex: 1 },
  textoSeletor: { color: "#252B33", fontSize: 15, fontWeight: "600", flex: 1 },
  seta: { color: "#C96A22", fontSize: 25, fontWeight: "600", marginLeft: 10 },
  detalheSeletor: { fontSize: 12, color: "#806C61", marginTop: -12, marginBottom: 14 },
  cabecalhoCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  tituloPedidosArea: { flex: 1 },
  botaoAdicionar: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#C96A22", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  textoAdicionar: { color: "#FFFFFF", fontSize: 27, fontWeight: "500", marginTop: -2 },
  pedidosVazio: { alignItems: "center", justifyContent: "center", paddingVertical: 25, borderWidth: 1, borderColor: "#E0C8B9", borderStyle: "dashed", borderRadius: 12, backgroundColor: "#FDF6F1" },
  iconeVazio: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F3E5DD", color: "#C96A22", textAlign: "center", lineHeight: 37, fontSize: 24, fontWeight: "500", marginBottom: 8 },
  textoVazio: { color: "#252B33", fontSize: 14, fontWeight: "700", textAlign: "center" },
  subtextoVazio: { color: "#806C61", fontSize: 12, marginTop: 4, textAlign: "center", paddingHorizontal: 8 },
  pedido: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0DED3" },
  pedidoInformacoes: { flex: 1, paddingRight: 8 },
  pedidoTitulo: { color: "#252B33", fontSize: 13, fontWeight: "800" },
  pedidoDetalhe: { color: "#806C61", fontSize: 12, marginTop: 4 },
  pedidoDireita: { flexDirection: "row", alignItems: "center", gap: 8 },
  pedidoPeso: { color: "#252B33", fontSize: 13, fontWeight: "800" },
  removerPedido: { color: "#B42318", fontSize: 25, fontWeight: "800", paddingHorizontal: 4 },
  linhaResumo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  textoResumo: { color: "#806C61", fontSize: 13 },
  valorResumo: { color: "#252B33", fontSize: 14, fontWeight: "800" },
  linhaOcupacao: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  valorOcupacao: { color: "#C96A22", fontSize: 14, fontWeight: "800" },
  valorExcedido: { color: "#B42318" },
  barraFundo: { height: 7, borderRadius: 5, backgroundColor: "#E7D1C4", overflow: "hidden" },
  barraProgresso: { height: "100%", borderRadius: 5, backgroundColor: "#C96A22" },
  avisoExcedido: { color: "#B42318", fontSize: 12, marginTop: 8 },
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

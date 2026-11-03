import { useCallback, useState } from "react";
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase, supabaseConfigurado } from "./servicos/supabase";

export default function CargasFeitas({ navigation }) {
  const [cargas, setCargas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarCargas = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      if (!supabaseConfigurado) {
        throw new Error("Supabase não configurado. Confira o arquivo .env.");
      }

      const { data: sessao, error: erroSessao } = await supabase.auth.getUser();
      if (erroSessao) throw erroSessao;
      if (!sessao.user) throw new Error("Sua sessão expirou. Entre novamente.");

      const userId = sessao.user.id;
      const [cargasResp, caminhoesResp, motoristasResp, vinculosResp, pedidosResp, clientesResp] =
        await Promise.all([
          supabase.from("cargas").select("*").eq("user_id", userId).order("criado_em", { ascending: false }),
          supabase.from("caminhoes").select("id, placa, modelo").eq("user_id", userId),
          supabase.from("motoristas").select("id, nome").eq("user_id", userId),
          supabase.from("carga_pedidos").select("carga_id, pedido_id").eq("user_id", userId),
          supabase.from("pedidos").select("id, cliente_id, data_prevista, peso_total, status").eq("user_id", userId),
          supabase.from("clientes").select("id, nome").eq("user_id", userId),
        ]);

      for (const resposta of [cargasResp, caminhoesResp, motoristasResp, vinculosResp, pedidosResp, clientesResp]) {
        if (resposta.error) throw resposta.error;
      }

      const porId = (lista) => new Map((lista || []).map((item) => [String(item.id), item]));
      const caminhoes = porId(caminhoesResp.data);
      const motoristas = porId(motoristasResp.data);
      const pedidos = porId(pedidosResp.data);
      const clientes = porId(clientesResp.data);
      const vinculosPorCarga = new Map();

      (vinculosResp.data || []).forEach((vinculo) => {
        const chave = String(vinculo.carga_id);
        if (!vinculosPorCarga.has(chave)) vinculosPorCarga.set(chave, []);
        const pedido = pedidos.get(String(vinculo.pedido_id));
        if (pedido) {
          vinculosPorCarga.get(chave).push({
            ...pedido,
            cliente_nome: clientes.get(String(pedido.cliente_id))?.nome || "Cliente não identificado",
          });
        }
      });

      setCargas((cargasResp.data || []).map((carga) => ({
        ...carga,
        caminhao_info: caminhoes.get(String(carga.caminhao_id)),
        motorista_info: motoristas.get(String(carga.motorista_id)),
        pedidos_info: vinculosPorCarga.get(String(carga.id)) || [],
      })));
    } catch (e) {
      console.error("Erro ao carregar cargas:", e);
      setErro(e.message || "Não foi possível carregar as cargas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregarCargas();
  }, [carregarCargas]));

  function formatarData(data) {
    if (!data) return "Data não informada";
    const partes = String(data).slice(0, 10).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Pressable onPress={() => navigation.goBack()} style={styles.voltar}>
            <Text style={styles.voltarTexto}>‹ Voltar</Text>
          </Pressable>
          <Text style={styles.titulo}>Cargas feitas</Text>
          <Text style={styles.subtitulo}>Histórico das cargas salvas no LoadFit</Text>
        </View>

        <Pressable style={styles.atualizar} onPress={carregarCargas}>
          <Text style={styles.atualizarTexto}>Atualizar lista</Text>
        </Pressable>

        {carregando ? (
          <View style={styles.estado}><ActivityIndicator size="large" color="#C96A22" /><Text style={styles.mensagem}>Carregando cargas...</Text></View>
        ) : erro ? (
          <View style={styles.aviso}><Text style={styles.erro}>{erro}</Text></View>
        ) : cargas.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Nenhuma carga encontrada</Text>
            <Text style={styles.mensagem}>As cargas criadas em “Organizar carga” aparecerão aqui.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.contagem}>{cargas.length} {cargas.length === 1 ? "carga encontrada" : "cargas encontradas"}</Text>
            {cargas.map((carga) => (
              <View key={String(carga.id)} style={styles.card}>
                <View style={styles.cardTopo}>
                  <Text style={styles.cardTitulo}>Carga #{carga.id}</Text>
                  <Text style={styles.status}>{String(carga.status || "SEM STATUS").replaceAll("_", " ")}</Text>
                </View>
                <Text style={styles.dado}><Text style={styles.rotulo}>Data prevista: </Text>{formatarData(carga.data_prevista)}</Text>
                <Text style={styles.dado}><Text style={styles.rotulo}>Caminhão: </Text>{carga.caminhao_info ? `${carga.caminhao_info.placa} — ${carga.caminhao_info.modelo}` : "Não identificado"}</Text>
                <Text style={styles.dado}><Text style={styles.rotulo}>Motorista: </Text>{carga.motorista_info?.nome || "Não identificado"}</Text>
                <Text style={styles.dado}><Text style={styles.rotulo}>Peso total: </Text>{Number(carga.peso_total || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg</Text>
                <View style={styles.linha} />
                <Text style={styles.rotulo}>Pedidos incluídos ({carga.pedidos_info.length})</Text>
                {carga.pedidos_info.length ? carga.pedidos_info.map((pedido) => (
                  <View key={String(pedido.id)} style={styles.pedido}>
                    <Text style={styles.pedidoTitulo}>Pedido #{pedido.id} — {pedido.cliente_nome}</Text>
                    <Text style={styles.pedidoDetalhe}>Entrega: {formatarData(pedido.data_prevista)} · {Number(pedido.peso_total || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg</Text>
                  </View>
                )) : <Text style={styles.mensagem}>Nenhum pedido vinculado foi encontrado.</Text>}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e4b89e" },
  conteudo: { width: "100%", maxWidth: 900, alignSelf: "center", padding: 20, paddingBottom: 40 },
  cabecalho: { marginBottom: 20 },
  voltar: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 12 },
  voltarTexto: { color: "#C96A22", fontSize: 16, fontWeight: "600" },
  titulo: { color: "#252B33", fontSize: 28, fontWeight: "700" },
  subtitulo: { color: "#69717A", fontSize: 15, marginTop: 5 },
  atualizar: { alignSelf: "flex-start", backgroundColor: "#252B33", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 18 },
  atualizarTexto: { color: "#FFFFFF", fontWeight: "600" },
  estado: { padding: 28, alignItems: "center", gap: 10 },
  mensagem: { color: "#69717A", fontSize: 14, lineHeight: 20, marginTop: 5 },
  aviso: { backgroundColor: "#FCE8E6", borderRadius: 10, padding: 16 },
  erro: { color: "#A12622", lineHeight: 21 },
  vazio: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, alignItems: "center" },
  vazioTitulo: { fontSize: 18, fontWeight: "700", color: "#252B33" },
  contagem: { color: "#69717A", marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  cardTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  cardTitulo: { color: "#252B33", fontSize: 19, fontWeight: "700" },
  status: { color: "#8A4A1C", backgroundColor: "#FCE8D8", overflow: "hidden", borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10, fontSize: 12, fontWeight: "700" },
  dado: { color: "#414851", marginBottom: 7, lineHeight: 20 },
  rotulo: { color: "#252B33", fontWeight: "700" },
  linha: { height: 1, backgroundColor: "#E9EAEC", marginVertical: 12 },
  pedido: { borderLeftWidth: 3, borderLeftColor: "#E4B89E", paddingLeft: 10, paddingVertical: 7, marginTop: 6 },
  pedidoTitulo: { color: "#252B33", fontWeight: "600" },
  pedidoDetalhe: { color: "#69717A", fontSize: 13, marginTop: 4 },
});

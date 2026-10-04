import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";

export default function TelaOrganizarCarga({ navigation }) {

  const [dataPrevista, setDataPrevista] = useState("");
  const [caminhao, setCaminhao] = useState(null);
  const [motorista, setMotorista] = useState(null);
  const [pedidos, setPedidos] = useState([]);

  const { width } = useWindowDimensions();

  const telaGrande = width >= 768;

  const pesoTotal = 0;
  const capacidade = caminhao ? caminhao.capacidade : 0;
  const capacidadeRestante = capacidade - pesoTotal;

  const ocupacao =
    capacidade > 0
      ? Math.round((pesoTotal / capacidade) * 100)
      : 0;

  const selecionarCaminhao = () => {
    Alert.alert(
      "Caminhão",
      "A seleção de caminhões será integrada ao cadastro posteriormente."
    );
  };

  const selecionarMotorista = () => {
    Alert.alert(
      "Motorista",
      "A seleção de motoristas será integrada ao cadastro posteriormente."
    );
  };

  const adicionarPedido = () => {
    Alert.alert(
      "Pedidos",
      "A seleção de pedidos será implementada nesta etapa."
    );
  };

  const criarCarga = () => {

    if (!dataPrevista || !caminhao || !motorista) {
      Alert.alert(
        "Atenção",
        "Informe a data, o caminhão e o motorista."
      );

      return;
    }

    Alert.alert(
      "Sucesso",
      "Carga criada com sucesso!"
    );
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
            <Text style={styles.textoVoltar}>‹</Text>
          </TouchableOpacity>

          <View style={styles.tituloArea}>

            <Text
              style={[
                styles.titulo,
                telaGrande && styles.tituloGrande,
              ]}
            >
              Organizar Carga
            </Text>

            <Text style={styles.subtitulo}>
              Monte uma nova carga para transporte
            </Text>

          </View>

        </View>

        {/* DADOS DA CARGA */}

        <View
          style={[
            styles.card,
            telaGrande && styles.cardGrande,
          ]}
        >

          <Text style={styles.tituloCard}>
            Dados da Carga
          </Text>

          <Text style={styles.label}>
            Data prevista
          </Text>

          <TouchableOpacity
            style={styles.seletor}
            activeOpacity={0.8}
            onPress={() => {
              setDataPrevista("04/10/2026");
            }}
          >
            <Text
              style={
                dataPrevista
                  ? styles.textoSeletor
                  : styles.placeholder
              }
            >
              {dataPrevista || "Selecionar data"}
            </Text>

            <Text style={styles.seta}>
              ›
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Caminhão
          </Text>

          <TouchableOpacity
            style={styles.seletor}
            activeOpacity={0.8}
            onPress={selecionarCaminhao}
          >
            <Text
              style={
                caminhao
                  ? styles.textoSeletor
                  : styles.placeholder
              }
            >
              {caminhao
                ? caminhao.placa
                : "Selecionar caminhão"}
            </Text>

            <Text style={styles.seta}>
              ›
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Motorista
          </Text>

          <TouchableOpacity
            style={styles.seletor}
            activeOpacity={0.8}
            onPress={selecionarMotorista}
          >
            <Text
              style={
                motorista
                  ? styles.textoSeletor
                  : styles.placeholder
              }
            >
              {motorista
                ? motorista.nome
                : "Selecionar motorista"}
            </Text>

            <Text style={styles.seta}>
              ›
            </Text>
          </TouchableOpacity>

        </View>

        {/* PEDIDOS */}

        <View
          style={[
            styles.card,
            telaGrande && styles.cardGrande,
          ]}
        >

          <View style={styles.cabecalhoCard}>

            <View>
              <Text style={styles.tituloCard}>
                Pedidos
              </Text>

              <Text style={styles.descricaoCard}>
                Adicione os pedidos que farão parte da carga
              </Text>
            </View>

            <TouchableOpacity
              style={styles.botaoAdicionar}
              onPress={adicionarPedido}
              activeOpacity={0.8}
            >
              <Text style={styles.textoAdicionar}>
                +
              </Text>
            </TouchableOpacity>

          </View>

          {pedidos.length === 0 ? (

            <View style={styles.pedidosVazio}>

              <Text style={styles.iconeVazio}>
                +
              </Text>

              <Text style={styles.textoVazio}>
                Nenhum pedido adicionado
              </Text>

              <Text style={styles.subtextoVazio}>
                Adicione pedidos para montar a carga
              </Text>

            </View>

          ) : (

            pedidos.map((pedido, index) => (
              <View
                key={index}
                style={styles.pedido}
              >
                <Text style={styles.pedidoTitulo}>
                  Pedido #{pedido.id}
                </Text>

                <Text style={styles.pedidoPeso}>
                  {pedido.peso} kg
                </Text>
              </View>
            ))

          )}

        </View>

        {/* RESUMO */}

        <View
          style={[
            styles.card,
            telaGrande && styles.cardGrande,
          ]}
        >

          <Text style={styles.tituloCard}>
            Resumo da Carga
          </Text>

          <View style={styles.linhaResumo}>

            <Text style={styles.textoResumo}>
              Peso total
            </Text>

            <Text style={styles.valorResumo}>
              {pesoTotal} kg
            </Text>

          </View>

          <View style={styles.linhaResumo}>

            <Text style={styles.textoResumo}>
              Capacidade
            </Text>

            <Text style={styles.valorResumo}>
              {capacidade} kg
            </Text>

          </View>

          <View style={styles.linhaResumo}>

            <Text style={styles.textoResumo}>
              Capacidade restante
            </Text>

            <Text style={styles.valorResumo}>
              {capacidadeRestante > 0
                ? capacidadeRestante
                : 0} kg
            </Text>

          </View>

          <View style={styles.linhaOcupacao}>

            <Text style={styles.textoResumo}>
              Ocupação
            </Text>

            <Text style={styles.valorOcupacao}>
              {ocupacao}%
            </Text>

          </View>

          {/* BARRA DE OCUPAÇÃO */}

          <View style={styles.barraFundo}>

            <View
              style={[
                styles.barraProgresso,
                {
                  width: `${Math.min(ocupacao, 100)}%`,
                },
              ]}
            />

          </View>

        </View>

        {/* BOTÃO CRIAR CARGA */}

        <TouchableOpacity
          style={styles.botaoCriar}
          onPress={criarCarga}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotaoCriar}>
            Criar Carga
          </Text>
        </TouchableOpacity>

        {/* RODAPÉ */}

        <Text style={styles.rodape}>
          LoadFit • Organizador de Cargas
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  /* CONTAINER */

  container: {
    flexGrow: 1,
    backgroundColor: "#E4B89E",
  },

  conteudo: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 25,
  },

  containerGrande: {
    justifyContent: "center",
  },

  conteudoGrande: {
    maxWidth: 700,
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
    backgroundColor: "#252B33",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  textoVoltar: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -4,
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

  /* CARDS */

  card: {
    width: "100%",
    backgroundColor: "#FFF9F5",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 3,
  },

  cardGrande: {
    padding: 28,
    borderRadius: 20,
  },

  tituloCard: {
    fontSize: 17,
    fontWeight: "800",
    color: "#252B33",
    marginBottom: 16,
  },

  descricaoCard: {
    fontSize: 12,
    color: "#806C61",
    marginTop: -10,
  },

  /* CAMPOS */

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#252B33",
    marginBottom: 7,
  },

  seletor: {
    height: 50,
    width: "100%",

    backgroundColor: "#F3E5DD",

    borderWidth: 1,
    borderColor: "#E0C8B9",
    borderRadius: 10,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  placeholder: {
    color: "#8A8A8A",
    fontSize: 15,
  },

  textoSeletor: {
    color: "#252B33",
    fontSize: 15,
    fontWeight: "600",
  },

  seta: {
    color: "#C96A22",
    fontSize: 25,
    fontWeight: "600",
  },

  /* PEDIDOS */

  cabecalhoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  botaoAdicionar: {
    width: 40,
    height: 40,

    borderRadius: 10,

    backgroundColor: "#C96A22",

    alignItems: "center",
    justifyContent: "center",
  },

  textoAdicionar: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "500",
    marginTop: -2,
  },

  pedidosVazio: {
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 25,

    borderWidth: 1,
    borderColor: "#E0C8B9",
    borderStyle: "dashed",
    borderRadius: 12,

    backgroundColor: "#FDF6F1",
  },

  iconeVazio: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: "#F3E5DD",

    color: "#C96A22",

    textAlign: "center",
    lineHeight: 37,

    fontSize: 24,
    fontWeight: "500",

    marginBottom: 8,
  },

  textoVazio: {
    color: "#252B33",
    fontSize: 14,
    fontWeight: "700",
  },

  subtextoVazio: {
    color: "#806C61",
    fontSize: 12,
    marginTop: 4,
  },

  pedido: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "#F3E5DD",

    borderRadius: 10,

    paddingHorizontal: 14,
    paddingVertical: 13,

    marginBottom: 8,
  },

  pedidoTitulo: {
    color: "#252B33",
    fontSize: 14,
    fontWeight: "700",
  },

  pedidoPeso: {
    color: "#C96A22",
    fontSize: 14,
    fontWeight: "800",
  },

  /* RESUMO */

  linhaResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 7,
  },

  linhaOcupacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 5,
    marginBottom: 8,
  },

  textoResumo: {
    color: "#6D5B52",
    fontSize: 14,
  },

  valorResumo: {
    color: "#252B33",
    fontSize: 14,
    fontWeight: "700",
  },

  valorOcupacao: {
    color: "#C96A22",
    fontSize: 15,
    fontWeight: "800",
  },

  barraFundo: {
    width: "100%",
    height: 9,

    backgroundColor: "#E7D3C7",

    borderRadius: 10,

    overflow: "hidden",
  },

  barraProgresso: {
    height: "100%",

    backgroundColor: "#C96A22",

    borderRadius: 10,
  },

  /* BOTÃO */

  botaoCriar: {
    width: "100%",
    height: 54,

    backgroundColor: "#252B33",

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 2,
  },

  textoBotaoCriar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  /* RODAPÉ */

  rodape: {
    textAlign: "center",
    color: "#806C61",
    fontSize: 12,
    marginTop: 22,
  },
});
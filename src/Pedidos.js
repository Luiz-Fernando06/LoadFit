import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  useWindowDimensions,
} from "react-native";

export default function TelaCadastroPedido({ navigation }) {

  const [cliente, setCliente] = useState(null);
  const [dataPrevista, setDataPrevista] = useState("");
  const [observacao, setObservacao] = useState("");

  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState("");

  const [itens, setItens] = useState([]);

  const { width } = useWindowDimensions();

  const telaGrande = width >= 768;


  /*
   * DADOS TEMPORÁRIOS
   *
   * Posteriormente esses dados virão do banco/API.
   */

  const clientesDisponiveis = [
    {
      id: 1,
      nome: "Cliente 1",
    },
    {
      id: 2,
      nome: "Cliente 2",
    },
  ];

  const materiaisDisponiveis = [
    {
      id: 1,
      nome: "Vergalhão",
      unidade_medida: "un",
      peso_unitario: 20,
    },
    {
      id: 2,
      nome: "Tubo",
      unidade_medida: "un",
      peso_unitario: 30,
    },
    {
      id: 3,
      nome: "Chapa",
      unidade_medida: "un",
      peso_unitario: 25,
    },
  ];


  /*
   * SELECIONAR CLIENTE
   */

  const selecionarCliente = () => {

    Alert.alert(
      "Selecionar Cliente",
      "Escolha o cliente:",
      clientesDisponiveis.map((item) => ({
        text: item.nome,
        onPress: () => setCliente(item),
      }))
    );
  };


  /*
   * SELECIONAR MATERIAL
   */

  const selecionarMaterial = () => {

    Alert.alert(
      "Selecionar Material",
      "Escolha o material:",
      materiaisDisponiveis.map((item) => ({
        text: `${item.nome} - ${item.peso_unitario} kg/${item.unidade_medida}`,
        onPress: () => setMaterialSelecionado(item),
      }))
    );
  };


  /*
   * ADICIONAR ITEM AO PEDIDO
   */

  const adicionarItem = () => {

    if (!materialSelecionado) {
      Alert.alert(
        "Atenção",
        "Selecione um material."
      );

      return;
    }

    if (!quantidade || Number(quantidade) <= 0) {
      Alert.alert(
        "Atenção",
        "Informe uma quantidade válida."
      );

      return;
    }

    const quantidadeNumerica = parseFloat(quantidade);

    const pesoTotal =
      quantidadeNumerica *
      materialSelecionado.peso_unitario;

    const novoItem = {
      id: Date.now(),

      material_id: materialSelecionado.id,

      material: materialSelecionado,

      quantidade: quantidadeNumerica,

      peso_unitario:
        materialSelecionado.peso_unitario,

      peso_total: pesoTotal,
    };

    setItens([...itens, novoItem]);

    setMaterialSelecionado(null);
    setQuantidade("");
  };


  /*
   * REMOVER ITEM
   */

  const removerItem = (id) => {

    setItens(
      itens.filter((item) => item.id !== id)
    );
  };


  /*
   * CALCULAR PESO TOTAL DO PEDIDO
   */

  const pesoTotalPedido = itens.reduce(
    (total, item) => total + item.peso_total,
    0
  );


  /*
   * CRIAR PEDIDO
   */

  const criarPedido = () => {

    if (!cliente) {
      Alert.alert(
        "Atenção",
        "Selecione um cliente."
      );

      return;
    }

    if (!dataPrevista) {
      Alert.alert(
        "Atenção",
        "Informe a data prevista."
      );

      return;
    }

    if (itens.length === 0) {
      Alert.alert(
        "Atenção",
        "Adicione pelo menos um material ao pedido."
      );

      return;
    }


    /*
     * Estrutura do pedido
     */

    const dadosPedido = {

      cliente_id: cliente.id,

      observacao: observacao,

      dt_prevista: dataPrevista,

      peso_total: pesoTotalPedido,

      status: "PENDENTE",

      itens: itens.map((item) => ({
        material_id: item.material_id,

        quantidade: item.quantidade,

        peso_unitario: item.peso_unitario,

        peso_total: item.peso_total,
      })),
    };


    console.log(
      "Pedido criado:",
      dadosPedido
    );


    Alert.alert(
      "Sucesso",
      "Pedido cadastrado com sucesso!"
    );

    navigation.navigate("Menu");
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
            <Text style={styles.textoVoltar}>
              ‹
            </Text>
          </TouchableOpacity>


          <View style={styles.tituloArea}>

            <Text
              style={[
                styles.titulo,
                telaGrande && styles.tituloGrande,
              ]}
            >
              Novo Pedido
            </Text>

            <Text style={styles.subtitulo}>
              Cadastre um novo pedido
            </Text>

          </View>

        </View>


        {/* DADOS DO PEDIDO */}

        <View
          style={[
            styles.card,
            telaGrande && styles.cardGrande,
          ]}
        >

          <Text style={styles.tituloCard}>
            Dados do Pedido
          </Text>


          {/* CLIENTE */}

          <Text style={styles.label}>
            Cliente
          </Text>

          <TouchableOpacity
            style={styles.seletor}
            onPress={selecionarCliente}
            activeOpacity={0.8}
          >

            <Text
              style={
                cliente
                  ? styles.textoSeletor
                  : styles.placeholder
              }
            >
              {cliente
                ? cliente.nome
                : "Selecionar cliente"}
            </Text>

            <Text style={styles.seta}>
              ›
            </Text>

          </TouchableOpacity>


          {/* DATA */}

          <Text style={styles.label}>
            Data prevista
          </Text>

          <TouchableOpacity
            style={styles.seletor}
            onPress={() => {
              setDataPrevista("05/10/2026");
            }}
            activeOpacity={0.8}
          >

            <Text
              style={
                dataPrevista
                  ? styles.textoSeletor
                  : styles.placeholder
              }
            >
              {dataPrevista ||
                "Selecionar data"}
            </Text>

            <Text style={styles.seta}>
              ›
            </Text>

          </TouchableOpacity>


          {/* OBSERVAÇÃO */}

          <Text style={styles.label}>
            Observação
          </Text>

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

        <View
          style={[
            styles.card,
            telaGrande && styles.cardGrande,
          ]}
        >

          <Text style={styles.tituloCard}>
            Itens do Pedido
          </Text>

          <Text style={styles.descricaoCard}>
            Adicione os materiais e suas quantidades
          </Text>


          {/* MATERIAL */}

          <Text style={styles.label}>
            Material
          </Text>

          <TouchableOpacity
            style={styles.seletor}
            onPress={selecionarMaterial}
            activeOpacity={0.8}
          >

            <Text
              style={
                materialSelecionado
                  ? styles.textoSeletor
                  : styles.placeholder
              }
            >
              {materialSelecionado
                ? materialSelecionado.nome
                : "Selecionar material"}
            </Text>

            <Text style={styles.seta}>
              ›
            </Text>

          </TouchableOpacity>


          {/* QUANTIDADE */}

          <Text style={styles.label}>
            Quantidade
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 100"
            placeholderTextColor="#8A8A8A"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />


          {/* BOTÃO ADICIONAR */}

          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={adicionarItem}
            activeOpacity={0.8}
          >

            <Text style={styles.textoAdicionar}>
              + Adicionar Material
            </Text>

          </TouchableOpacity>


          {/* LISTA DE ITENS */}

          {itens.length > 0 && (

            <View style={styles.listaItens}>

              <Text style={styles.tituloLista}>
                Materiais adicionados
              </Text>


              {itens.map((item) => (

                <View
                  key={item.id}
                  style={styles.item}
                >

                  <View style={styles.itemInformacoes}>

                    <Text style={styles.itemNome}>
                      {item.material.nome}
                    </Text>

                    <Text style={styles.itemDetalhes}>
                      {item.quantidade}{" "}
                      {item.material.unidade_medida}
                      {"  •  "}
                      {item.peso_unitario} kg/un
                    </Text>

                  </View>


                  <View style={styles.itemDireita}>

                    <Text style={styles.itemPeso}>
                      {item.peso_total} kg
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        removerItem(item.id)
                      }
                    >

                      <Text
                        style={styles.remover}
                      >
                        ×
                      </Text>

                    </TouchableOpacity>

                  </View>

                </View>

              ))}

            </View>

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
            Resumo do Pedido
          </Text>


          <View style={styles.linhaResumo}>

            <Text style={styles.textoResumo}>
              Quantidade de materiais
            </Text>

            <Text style={styles.valorResumo}>
              {itens.length}
            </Text>

          </View>


          <View style={styles.linhaResumo}>

            <Text style={styles.textoResumo}>
              Peso total
            </Text>

            <Text style={styles.valorPeso}>
              {pesoTotalPedido} kg
            </Text>

          </View>

        </View>


        {/* BOTÃO CRIAR */}

        <TouchableOpacity
          style={styles.botaoCriar}
          onPress={criarPedido}
          activeOpacity={0.8}
        >

          <Text style={styles.textoBotaoCriar}>
            Criar Pedido
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

    marginBottom: 18,
  },


  /* LABELS */

  label: {
    fontSize: 14,

    fontWeight: "700",

    color: "#252B33",

    marginBottom: 7,
  },


  /* SELETORES */

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


  /* INPUT */

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

  inputObservacao: {
    width: "100%",

    minHeight: 100,

    backgroundColor: "#F3E5DD",

    borderWidth: 1,

    borderColor: "#E0C8B9",

    borderRadius: 10,

    paddingHorizontal: 14,

    paddingVertical: 12,

    fontSize: 15,

    color: "#252B33",

    marginBottom: 5,
  },


  /* ADICIONAR MATERIAL */

  botaoAdicionar: {
    width: "100%",

    height: 48,

    backgroundColor: "#C96A22",

    borderRadius: 10,

    alignItems: "center",

    justifyContent: "center",

    marginTop: -2,
  },

  textoAdicionar: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "800",
  },


  /* LISTA */

  listaItens: {
    marginTop: 22,
  },

  tituloLista: {
    fontSize: 14,

    fontWeight: "800",

    color: "#252B33",

    marginBottom: 10,
  },

  item: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#F3E5DD",

    borderRadius: 10,

    paddingHorizontal: 14,

    paddingVertical: 12,

    marginBottom: 8,
  },

  itemInformacoes: {
    flex: 1,

    marginRight: 10,
  },

  itemNome: {
    color: "#252B33",

    fontSize: 14,

    fontWeight: "800",
  },

  itemDetalhes: {
    color: "#806C61",

    fontSize: 12,

    marginTop: 4,
  },

  itemDireita: {
    flexDirection: "row",

    alignItems: "center",
  },

  itemPeso: {
    color: "#C96A22",

    fontSize: 14,

    fontWeight: "800",

    marginRight: 12,
  },

  remover: {
    color: "#252B33",

    fontSize: 24,

    fontWeight: "500",
  },


  /* RESUMO */

  linhaResumo: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 7,
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

  valorPeso: {
    color: "#C96A22",

    fontSize: 16,

    fontWeight: "800",
  },


  /* BOTÃO CRIAR */

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
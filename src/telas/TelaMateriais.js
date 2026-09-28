import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

//Importa a conexão com o Supabase
import { supabase } from "../servicos/supabase";


export default function TelaMateriais({ navigation }) {

  //Dados do formulário
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [peso, setPeso] = useState("");
  const [quantidade, setQuantidade] = useState("");

  //Lista de materiais retornada pelo Supabase
  const [materiais, setMateriais] = useState([]);

  //Controla o botão de cadastro
  const [carregando, setCarregando] = useState(false);

  //Controla o carregamento inicial da lista
  const [carregandoLista, setCarregandoLista] = useState(true);


  //Assim que a tela abre, carrega os materiais salvos no Supabase
  useEffect(() => {
    carregarMateriais();
  }, []);


  //Busca os materiais do usuário logado
  async function carregarMateriais() {

    try {

      setCarregandoLista(true);


      //O RLS do Supabase garante que o usuário enxergue apenas os próprios materiais
      const { data, error } = await supabase
        .from("materiais")
        .select("*")
        .order("criado_em", { ascending: false });


      if (error) {
        throw error;
      }


      setMateriais(data || []);


    } catch (erro) {

      Alert.alert(
        "Erro",
        `Não foi possível carregar os materiais. ${erro.message}`
      );


    } finally {

      setCarregandoLista(false);

    }

  }


  //Limpa o formulário depois de cadastrar
  function limparCampos() {
    setNome("");
    setCategoria("");
    setPeso("");
    setQuantidade("");
  }


  //Cadastra um novo material no Supabase
  async function cadastrarMaterial() {

    //Verifica se todos os campos foram preenchidos
    if (!nome.trim() || !categoria.trim() || !peso.trim() || !quantidade.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha todos os dados do material.");
      return;
    }


    //Converte o peso para número e permite vírgula ou ponto
    const pesoNumero = Number(peso.replace(",", "."));

    //Converte a quantidade para número
    const quantidadeNumero = Number(quantidade);


    if (Number.isNaN(pesoNumero) || pesoNumero <= 0) {
      Alert.alert("Peso inválido", "Informe um peso maior que zero.");
      return;
    }


    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      Alert.alert("Quantidade inválida", "Informe uma quantidade inteira maior que zero.");
      return;
    }


    try {

      setCarregando(true);


      //Insere o material no PostgreSQL do Supabase
      const { data, error } = await supabase
        .from("materiais")
        .insert({
          nome: nome.trim(),
          categoria: categoria.trim(),
          peso: pesoNumero,
          quantidade: quantidadeNumero,
        })
        .select()
        .single();


      if (error) {
        throw error;
      }


      //Adiciona imediatamente o material retornado pelo banco na tela
      setMateriais((listaAtual) => [data, ...listaAtual]);

      limparCampos();

      Alert.alert("Sucesso", "Material cadastrado com sucesso!");


    } catch (erro) {

      Alert.alert("Erro ao cadastrar", erro.message);


    } finally {

      setCarregando(false);

    }

  }


  //Exibe a confirmação antes de apagar o material
  function removerMaterial(id) {

    Alert.alert(
      "Remover material",
      "Deseja realmente remover este material?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => confirmarRemocao(id),
        },
      ]
    );

  }


  //Remove o material do Supabase
  async function confirmarRemocao(id) {

    try {

      const { error } = await supabase
        .from("materiais")
        .delete()
        .eq("id", id);


      if (error) {
        throw error;
      }


      //Remove o item da lista da tela sem precisar recarregar a página
      setMateriais((listaAtual) =>
        listaAtual.filter((item) => item.id !== id)
      );


    } catch (erro) {

      Alert.alert("Erro ao remover", erro.message);

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

            <View>
              <Text style={styles.titulo}>Materiais</Text>
              <Text style={styles.subtitulo}>Cadastre os itens que serão transportados</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.secaoTitulo}>Novo material</Text>

            <Text style={styles.label}>Nome do material</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Peças"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Categoria</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Alimentos, Roupas, Eletrônicos"
              value={categoria}
              onChangeText={setCategoria}
            />

            <View style={styles.linhaCampos}>
              <View style={styles.campoMetadeEsquerda}>
                <Text style={styles.label}>Peso unitário (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 12.5"
                  value={peso}
                  onChangeText={setPeso}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.campoMetadeDireita}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 10"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Pressable
              style={[styles.botaoAdicionar, carregando && styles.botaoDesabilitado]}
              onPress={cadastrarMaterial}
              disabled={carregando}
            >
              <Text style={styles.textoBotaoAdicionar}>
                {carregando ? "Salvando..." : "Cadastrar material"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.listaCabecalho}>
            <Text style={styles.secaoTitulo}>Materiais cadastrados</Text>
            <View style={styles.contador}>
              <Text style={styles.contadorTexto}>{materiais.length}</Text>
            </View>
          </View>

          {carregandoLista ? (
            <View style={styles.vazioCard}>
              <ActivityIndicator size="large" />
              <Text style={styles.vazioTexto}>Carregando materiais...</Text>
            </View>
          ) : materiais.length === 0 ? (
            <View style={styles.vazioCard}>
              <Text style={styles.vazioIcone}>📦</Text>
              <Text style={styles.vazioTitulo}>Nenhum material cadastrado</Text>
              <Text style={styles.vazioTexto}>
                Preencha o formulário acima para adicionar o primeiro item.
              </Text>
            </View>
          ) : (
            materiais.map((material) => (
              <View key={material.id} style={styles.materialCard}>
                <View style={styles.materialTopo}>
                  <View style={styles.iconeMaterial}>
                    <Text style={styles.iconeMaterialTexto}>📦</Text>
                  </View>

                  <View style={styles.materialInfo}>
                    <Text style={styles.materialNome}>{material.nome}</Text>
                    <Text style={styles.materialCategoria}>{material.categoria}</Text>
                  </View>

                  <Pressable
                    style={styles.botaoRemover}
                    onPress={() => removerMaterial(material.id)}
                  >
                    <Text style={styles.textoRemover}>×</Text>
                  </Pressable>
                </View>

                <View style={styles.materialDetalhes}>
                  <View style={styles.detalheItem}>
                    <Text style={styles.detalheLabel}>Peso unitário</Text>
                    <Text style={styles.detalheValor}>{Number(material.peso)} kg</Text>
                  </View>

                  <View style={styles.detalheItem}>
                    <Text style={styles.detalheLabel}>Quantidade</Text>
                    <Text style={styles.detalheValor}>{material.quantidade}</Text>
                  </View>

                  <View style={styles.detalheItem}>
                    <Text style={styles.detalheLabel}>Peso total</Text>
                    <Text style={styles.detalheValor}>
                      {(Number(material.peso) * Number(material.quantidade)).toFixed(2)} kg
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
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
    fontSize: 25,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitulo: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 16,
  },
  linhaCampos: {
    flexDirection: "row",
  },
  campoMetadeEsquerda: {
    flex: 1,
    marginRight: 6,
  },
  campoMetadeDireita: {
    flex: 1,
    marginLeft: 6,
  },
  botaoAdicionar: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  botaoDesabilitado: {
    opacity: 0.65,
  },
  textoBotaoAdicionar: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  listaCabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  contador: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  contadorTexto: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 12,
  },
  vazioCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
  },
  vazioIcone: {
    fontSize: 38,
    marginBottom: 10,
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 5,
  },
  vazioTexto: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 10,
  },
  materialCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  materialTopo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconeMaterial: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },
  iconeMaterialTexto: {
    fontSize: 21,
  },
  materialInfo: {
    flex: 1,
  },
  materialNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  materialCategoria: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  botaoRemover: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  textoRemover: {
    fontSize: 22,
    color: "#DC2626",
    lineHeight: 24,
  },
  materialDetalhes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  detalheItem: {
    flex: 1,
  },
  detalheLabel: {
    fontSize: 10,
    color: "#94A3B8",
    marginBottom: 3,
  },
  detalheValor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
});

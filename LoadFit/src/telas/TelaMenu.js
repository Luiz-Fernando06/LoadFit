import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function TelaMenu({ navigation }) {

  function funcionalidadeEmBreve(nome) {
    Alert.alert(
      nome,
      "Essa funcionalidade será implementada em breve."
    );
  }


  function sair() {
    navigation.replace("Login");
  }


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>

          <View>

            <Text style={styles.logo}>
              LoadFit
            </Text>

            <Text style={styles.subtitulo}>
              Organizador de Cargas
            </Text>

          </View>


          <Pressable
            style={styles.botaoSair}
            onPress={sair}
          >

            <Text style={styles.textoSair}>
              Sair
            </Text>

          </Pressable>

        </View>


        <View style={styles.boasVindas}>

          <Text style={styles.titulo}>
            Luiz Fernando,
            Thadeu,
            Guilherme,
            Gustavo
          </Text>

          <Text style={styles.descricao}>
            Gerencie os dados e a distribuição das suas cargas.
          </Text>

        </View>


        <View style={styles.grid}>


          <Pressable
            style={styles.card}
            onPress={() => funcionalidadeEmBreve("Caminhões")}
          >

            <Text style={styles.icone}>
              🚚
            </Text>

            <Text style={styles.cardTitulo}>
              Caminhões
            </Text>

            <Text style={styles.cardDescricao}>
              Gerenciar veículos
            </Text>

          </Pressable>


          <Pressable
            style={styles.card}
            onPress={() => funcionalidadeEmBreve("Materiais")}
          >

            <Text style={styles.icone}>
              📦
            </Text>

            <Text style={styles.cardTitulo}>
              Materiais
            </Text>

            <Text style={styles.cardDescricao}>
              Gerenciar materiais
            </Text>

          </Pressable>


          <Pressable
            style={styles.card}
            onPress={() => funcionalidadeEmBreve("Clientes")}
          >

            <Text style={styles.icone}>
              👤
            </Text>

            <Text style={styles.cardTitulo}>
              Clientes
            </Text>

            <Text style={styles.cardDescricao}>
              Gerenciar clientes
            </Text>

          </Pressable>


          <Pressable
            style={styles.card}
            onPress={() => funcionalidadeEmBreve("Motoristas")}
          >

            <Text style={styles.icone}>
              👤
            </Text>

            <Text style={styles.cardTitulo}>
              Motoristas
            </Text>

            <Text style={styles.cardDescricao}>
              Gerenciar motoristas
            </Text>

          </Pressable>


        </View>


        <Pressable
          style={styles.botaoOrganizar}
          onPress={() => funcionalidadeEmBreve("Organizar Carga")}
        >

          <Text style={styles.textoBotaoOrganizar}>
            Organizar Carga
          </Text>

        </Pressable>


      </ScrollView>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },


  content: {
    paddingHorizontal: 20,
    paddingBottom: 30
  },


  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 35
  },


  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB"
  },


  subtitulo: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2
  },


  botaoSair: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8
  },


  textoSair: {
    color: "#475569",
    fontWeight: "600"
  },


  boasVindas: {
    marginBottom: 30
  },


  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A"
  },


  descricao: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 7,
    lineHeight: 22
  },


  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },


  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },


  icone: {
    fontSize: 35,
    marginBottom: 15
  },


  cardTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 5
  },


  cardDescricao: {
    fontSize: 12,
    color: "#64748B"
  },


  botaoOrganizar: {
    height: 55,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15
  },


  textoBotaoOrganizar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold"
  }

});
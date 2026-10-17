import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

/** Modal reutilizável para escolher registros já cadastrados no Supabase. */
export default function ModalSelecao({
  visible,
  titulo,
  itens = [],
  onSelecionar,
  onFechar,
  rotuloItem = (item) => item?.nome || "Registro",
  detalheItem = () => "",
  mensagemVazia = "Nenhum registro cadastrado.",
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onFechar}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>{titulo}</Text>
            <TouchableOpacity onPress={onFechar} style={styles.fechar} accessibilityRole="button">
              <Text style={styles.textoFechar}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.lista} keyboardShouldPersistTaps="handled">
            {itens.length === 0 ? (
              <Text style={styles.vazio}>{mensagemVazia}</Text>
            ) : (
              itens.map((item) => {
                const detalhe = detalheItem(item);
                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    style={styles.opcao}
                    onPress={() => onSelecionar(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.textosOpcao}>
                      <Text style={styles.rotulo}>{rotuloItem(item)}</Text>
                      {Boolean(detalhe) && <Text style={styles.detalhe}>{detalhe}</Text>}
                    </View>
                    <Text style={styles.seta}>›</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity style={styles.botaoCancelar} onPress={onFechar} activeOpacity={0.8}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(37, 43, 51, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82%",
    backgroundColor: "#FFF9F5",
    borderRadius: 18,
    padding: 18,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titulo: { flex: 1, color: "#252B33", fontSize: 18, fontWeight: "800" },
  fechar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E5DD",
  },
  textoFechar: { color: "#252B33", fontSize: 25, lineHeight: 28 },
  lista: { flexGrow: 0 },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0C8B9",
    backgroundColor: "#FDF6F1",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 9,
  },
  textosOpcao: { flex: 1, paddingRight: 10 },
  rotulo: { color: "#252B33", fontSize: 15, fontWeight: "700" },
  detalhe: { color: "#806C61", fontSize: 12, marginTop: 4 },
  seta: { color: "#C96A22", fontSize: 24, fontWeight: "700" },
  vazio: { color: "#806C61", textAlign: "center", paddingVertical: 28, lineHeight: 21 },
  botaoCancelar: {
    marginTop: 12,
    backgroundColor: "#252B33",
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCancelar: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});

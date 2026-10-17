import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ModalData({ visible, valorInicial = "", onSalvar, onFechar }) {
  const [valor, setValor] = useState(valorInicial);

  useEffect(() => {
    if (visible) setValor(valorInicial || "");
  }, [visible, valorInicial]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>Data prevista</Text>
          <Text style={styles.descricao}>Informe a data no formato DD/MM/AAAA.</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#8A8A8A"
            keyboardType="numeric"
            maxLength={10}
            autoFocus
          />
          <View style={styles.acoes}>
            <TouchableOpacity style={styles.botaoSecundario} onPress={onFechar}>
              <Text style={styles.textoSecundario}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoPrimario} onPress={() => onSalvar(valor.trim())}>
              <Text style={styles.textoPrimario}>Confirmar</Text>
            </TouchableOpacity>
          </View>
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
  modal: { width: "100%", maxWidth: 430, backgroundColor: "#FFF9F5", borderRadius: 18, padding: 20 },
  titulo: { fontSize: 19, fontWeight: "800", color: "#252B33" },
  descricao: { fontSize: 13, color: "#806C61", marginTop: 6, marginBottom: 16 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E0C8B9",
    borderRadius: 10,
    backgroundColor: "#F3E5DD",
    paddingHorizontal: 13,
    fontSize: 16,
    color: "#252B33",
  },
  acoes: { flexDirection: "row", gap: 10, marginTop: 18 },
  botaoSecundario: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F3E5DD" },
  textoSecundario: { color: "#252B33", fontWeight: "800" },
  botaoPrimario: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#C96A22" },
  textoPrimario: { color: "#FFFFFF", fontWeight: "800" },
});

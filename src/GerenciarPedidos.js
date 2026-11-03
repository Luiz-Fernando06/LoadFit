
import React, { useCallback, useState } from "react";

import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "./servicos/supabase";

export default function GerenciarPedidos({ navigation }) {

    const [pedidos, setPedidos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [pedidoEditando, setPedidoEditando] = useState(null);

    const [data, setData] = useState("");
    const [observacao, setObservacao] = useState("");

    // Busca os pedidos e verifica se já pertencem a uma carga.
    const carregarPedidos = useCallback(async () => {

        try {

            setCarregando(true);

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            const [respostaPedidos, respostaClientes, respostaCargas] =
                await Promise.all([

                    supabase
                        .from("pedidos")
                        .select("*")
                        .eq("user_id", sessao.user.id)
                        .order("criado_em", { ascending: false }),

                    supabase
                        .from("clientes")
                        .select("id, nome")
                        .eq("user_id", sessao.user.id),

                    supabase
                        .from("carga_pedidos")
                        .select("pedido_id")
                        .eq("user_id", sessao.user.id)

                ]);

            if (respostaPedidos.error) throw respostaPedidos.error;
            if (respostaClientes.error) throw respostaClientes.error;
            if (respostaCargas.error) throw respostaCargas.error;

            const mapaClientes = new Map(
                respostaClientes.data.map(c => [
                    String(c.id),
                    c.nome
                ])
            );

            const pedidosEmCarga = new Set(
                respostaCargas.data.map(p => String(p.pedido_id))
            );

            const lista = respostaPedidos.data.map(pedido => ({
                ...pedido,
                cliente_nome: mapaClientes.get(
                    String(pedido.cliente_id)
                ) || "Cliente não encontrado",
                emCarga: pedidosEmCarga.has(String(pedido.id))
            }));

            setPedidos(lista);

        } catch (erro) {

            Alert.alert("Erro", erro.message);

        } finally {

            setCarregando(false);

        }

    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarPedidos();
        }, [carregarPedidos])
    );

    // Abre o formulário de edição.
    function abrirEdicao(pedido) {

        setPedidoEditando(pedido);

        setData(
            String(pedido.data_prevista).slice(0, 10)
        );

        setObservacao(pedido.observacao || "");

    }

    // Atualiza o pedido no Supabase.
    async function atualizarPedido() {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {

            Alert.alert(
                "Data inválida",
                "Utilize o formato AAAA-MM-DD."
            );

            return;
        }

        try {

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            const { error } = await supabase
                .from("pedidos")
                .update({
                    data_prevista: data,
                    observacao: observacao.trim()
                })
                .eq("id", pedidoEditando.id)
                .eq("user_id", sessao.user.id);

            if (error) throw error;

            setPedidoEditando(null);

            Alert.alert(
                "Pedido atualizado",
                "As alterações foram salvas."
            );

            carregarPedidos();

        } catch (erro) {

            Alert.alert("Erro ao atualizar", erro.message);

        }

    }

    // Exclui um pedido que não esteja em uma carga.
    function excluirPedido(pedido) {

        if (pedido.emCarga) {

            Alert.alert(
                "Pedido vinculado",
                "Remova esse pedido da carga antes de excluí-lo."
            );

            return;
        }

        Alert.alert(
            "Excluir pedido",
            `Deseja excluir o pedido #${pedido.id}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    style: "destructive",

                    onPress: async () => {

                        try {

                            const { data: sessao, error: erroUsuario } =
                                await supabase.auth.getUser();

                            if (erroUsuario) throw erroUsuario;

                            const { error } = await supabase
                                .from("pedidos")
                                .delete()
                                .eq("id", pedido.id)
                                .eq("user_id", sessao.user.id);

                            if (error) throw error;

                            carregarPedidos();

                            Alert.alert(
                                "Pedido excluído",
                                "O pedido foi removido."
                            );

                        } catch (erro) {

                            Alert.alert(
                                "Erro ao excluir",
                                erro.message
                            );

                        }

                    }
                }
            ]
        );

    }

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView contentContainerStyle={styles.conteudo}>

                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.voltar}>‹ Voltar</Text>
                </Pressable>

                <Text style={styles.titulo}>
                    Gerenciar pedidos
                </Text>

                <Text style={styles.subtitulo}>
                    Consulte, atualize e exclua os pedidos cadastrados.
                </Text>

                <Pressable
                    style={styles.botaoNovo}
                    onPress={() => navigation.navigate("CadastroPedido")}
                >
                    <Text style={styles.textoBotao}>
                        + Novo pedido
                    </Text>
                </Pressable>

                {carregando && (
                    <ActivityIndicator color="#C96A22" />
                )}

                {!carregando && pedidos.length === 0 && (
                    <Text style={styles.vazio}>
                        Nenhum pedido cadastrado.
                    </Text>
                )}

                {pedidos.map(pedido => (

                    <View
                        key={String(pedido.id)}
                        style={styles.card}
                    >

                        <Text style={styles.nome}>
                            Pedido #{pedido.id}
                        </Text>

                        <Text style={styles.info}>
                            Cliente: {pedido.cliente_nome}
                        </Text>

                        <Text style={styles.info}>
                            Data prevista: {
                                String(pedido.data_prevista)
                                    .slice(0, 10)
                                    .split("-")
                                    .reverse()
                                    .join("/")
                            }
                        </Text>

                        <Text style={styles.info}>
                            Peso: {pedido.peso_total} kg
                        </Text>

                        <Text style={styles.info}>
                            Status: {pedido.status}
                        </Text>

                        {pedido.emCarga && (
                            <Text style={styles.aviso}>
                                Pedido vinculado a uma carga.
                            </Text>
                        )}

                        <View style={styles.acoes}>

                            <Pressable
                                style={styles.atualizar}
                                onPress={() => abrirEdicao(pedido)}
                            >
                                <Text style={styles.textoBotao}>
                                    Atualizar
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.excluir}
                                onPress={() => excluirPedido(pedido)}
                            >
                                <Text style={styles.textoBotao}>
                                    Excluir
                                </Text>
                            </Pressable>

                        </View>

                    </View>

                ))}

            </ScrollView>

            <Modal
                visible={pedidoEditando !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setPedidoEditando(null)}
            >

                <View style={styles.fundoModal}>

                    <View style={styles.modal}>

                        <Text style={styles.nome}>
                            Atualizar pedido #{pedidoEditando?.id}
                        </Text>

                        <Text style={styles.label}>
                            Data prevista (AAAA-MM-DD)
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={data}
                            onChangeText={setData}
                            placeholder="2026-11-02"
                        />

                        <Text style={styles.label}>
                            Observação
                        </Text>

                        <TextInput
                            style={styles.inputObservacao}
                            value={observacao}
                            onChangeText={setObservacao}
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.acoes}>

                            <Pressable
                                style={styles.cancelar}
                                onPress={() => setPedidoEditando(null)}
                            >
                                <Text style={styles.textoCancelar}>
                                    Cancelar
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.atualizar}
                                onPress={atualizarPedido}
                            >
                                <Text style={styles.textoBotao}>
                                    Salvar
                                </Text>
                            </Pressable>

                        </View>

                    </View>

                </View>

            </Modal>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#E4B89E"
    },

    conteudo: {
        padding: 22,
        maxWidth: 850,
        width: "100%",
        alignSelf: "center"
    },

    voltar: {
        color: "#252B33",
        fontWeight: "700",
        marginBottom: 18
    },

    titulo: {
        fontSize: 27,
        fontWeight: "800",
        color: "#252B33"
    },

    subtitulo: {
        color: "#806C61",
        marginVertical: 10
    },

    card: {
        backgroundColor: "#FFF9F5",
        borderRadius: 13,
        padding: 18,
        marginBottom: 13
    },

    nome: {
        fontSize: 17,
        fontWeight: "800",
        color: "#252B33",
        marginBottom: 9
    },

    info: {
        color: "#806C61",
        marginTop: 5,
        fontSize: 13
    },

    aviso: {
        color: "#A15A18",
        fontWeight: "700",
        marginTop: 10
    },

    acoes: {
        flexDirection: "row",
        gap: 10,
        marginTop: 15
    },

    botaoNovo: {
        backgroundColor: "#252B33",
        padding: 14,
        borderRadius: 9,
        alignItems: "center",
        marginBottom: 18
    },

    atualizar: {
        flex: 1,
        backgroundColor: "#C96A22",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },

    excluir: {
        flex: 1,
        backgroundColor: "#A83232",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },

    textoBotao: {
        color: "#FFFFFF",
        fontWeight: "700"
    },

    vazio: {
        textAlign: "center",
        padding: 25,
        color: "#806C61"
    },

    fundoModal: {
        flex: 1,
        backgroundColor: "#0008",
        justifyContent: "center",
        padding: 20
    },

    modal: {
        backgroundColor: "#FFF9F5",
        padding: 20,
        borderRadius: 14
    },

    label: {
        color: "#252B33",
        fontWeight: "700",
        marginTop: 12,
        marginBottom: 6
    },

    input: {
        backgroundColor: "#F3E5DD",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0C8B9",
        padding: 12
    },

    inputObservacao: {
        backgroundColor: "#F3E5DD",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0C8B9",
        padding: 12,
        height: 100
    },

    cancelar: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#C96A22",
        borderRadius: 8,
        padding: 12,
        alignItems: "center"
    },

    textoCancelar: {
        color: "#A6531D",
        fontWeight: "700"
    }

});

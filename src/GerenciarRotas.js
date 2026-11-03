
import React, { useCallback, useState } from "react";

import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "./servicos/supabase";

export default function GerenciarRotas({ navigation }) {

    const [rotas, setRotas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [rotaAberta, setRotaAberta] = useState(null);

    const carregarRotas = useCallback(async () => {

        try {

            setCarregando(true);

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            const { data, error } = await supabase
                .from("rotas")
                .select("*")
                .eq("user_id", sessao.user.id)
                .order("criado_em", { ascending: false });

            if (error) throw error;

            setRotas(data || []);

        } catch (erro) {

            Alert.alert("Erro", erro.message);

        } finally {

            setCarregando(false);

        }

    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarRotas();
        }, [carregarRotas])
    );

    async function visualizarRota(rota) {

        try {

            setCarregando(true);

            const { data: sessao } = await supabase.auth.getUser();

            const { data: vinculos, error } = await supabase
                .from("rota_pedidos")
                .select("pedido_id, ordem_entrega")
                .eq("rota_id", rota.id)
                .eq("user_id", sessao.user.id)
                .order("ordem_entrega", { ascending: true });

            if (error) throw error;

            const ids = (vinculos || []).map(
                item => item.pedido_id
            );

            let pedidos = [];

            if (ids.length > 0) {

                const { data: dadosPedidos, error: erroPedidos } =
                    await supabase
                        .from("pedidos")
                        .select("*")
                        .in("id", ids)
                        .eq("user_id", sessao.user.id);

                if (erroPedidos) throw erroPedidos;

                const { data: clientes, error: erroClientes } =
                    await supabase
                        .from("clientes")
                        .select("*")
                        .eq("user_id", sessao.user.id);

                if (erroClientes) throw erroClientes;

                const mapa = new Map(
                    clientes.map(c => [String(c.id), c])
                );

                pedidos = vinculos.map(vinculo => {

                    const pedido = dadosPedidos.find(
                        p => String(p.id) === String(vinculo.pedido_id)
                    );

                    return {
                        ...pedido,
                        ordem_entrega: vinculo.ordem_entrega,
                        cliente: mapa.get(String(pedido.cliente_id))
                    };

                }).filter(Boolean);

            }

            setRotaAberta({
                ...rota,
                pedidos
            });

        } catch (erro) {

            Alert.alert("Erro", erro.message);

        } finally {

            setCarregando(false);

        }

    }

    function excluirRota(rota) {

        Alert.alert(
            "Excluir rota",
            `Deseja excluir a rota "${rota.nome}"?`,
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

                            const { data: sessao } =
                                await supabase.auth.getUser();

                            const { error } = await supabase
                                .from("rotas")
                                .delete()
                                .eq("id", rota.id)
                                .eq("user_id", sessao.user.id);

                            if (error) throw error;

                            setRotaAberta(null);

                            carregarRotas();

                            Alert.alert(
                                "Sucesso",
                                "Rota excluída."
                            );

                        } catch (erro) {

                            Alert.alert("Erro", erro.message);

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
                    Rotas criadas
                </Text>

                <Text style={styles.subtitulo}>
                    Consulte as rotas e a sequência das entregas.
                </Text>

                <Pressable
                    style={styles.botaoCriar}
                    onPress={() => navigation.navigate("CriarRota")}
                >
                    <Text style={styles.textoBotao}>
                        + Criar nova rota
                    </Text>
                </Pressable>

                {carregando && (
                    <ActivityIndicator color="#C96A22" />
                )}

                {!carregando && rotas.length === 0 && (
                    <Text style={styles.vazio}>
                        Nenhuma rota criada.
                    </Text>
                )}

                {rotas.map(rota => (

                    <View style={styles.card} key={String(rota.id)}>

                        <Text style={styles.nome}>
                            {rota.nome}
                        </Text>

                        <Text style={styles.detalhe}>
                            Rota #{rota.id}
                        </Text>

                        <Text style={styles.detalhe}>
                            Criada em: {new Date(
                                rota.criado_em
                            ).toLocaleDateString("pt-BR")}
                        </Text>

                        <View style={styles.acoes}>

                            <Pressable
                                style={styles.visualizar}
                                onPress={() => visualizarRota(rota)}
                            >
                                <Text style={styles.textoBotao}>
                                    Visualizar
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.excluir}
                                onPress={() => excluirRota(rota)}
                            >
                                <Text style={styles.textoBotao}>
                                    Excluir
                                </Text>
                            </Pressable>

                        </View>

                    </View>

                ))}

                {rotaAberta && (

                    <View style={styles.cardDetalhes}>

                        <Text style={styles.titulo}>
                            {rotaAberta.nome}
                        </Text>

                        <Text style={styles.subtitulo}>
                            Sequência de entregas
                        </Text>

                        {rotaAberta.pedidos.map(pedido => (

                            <View
                                key={String(pedido.id)}
                                style={styles.pedido}
                            >

                                <Text style={styles.nome}>
                                    {pedido.ordem_entrega}. Pedido #{pedido.id}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Cliente: {pedido.cliente?.nome || "Não informado"}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Endereço: {pedido.cliente?.endereco || "Não informado"}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Cidade: {pedido.cliente?.cidade || ""}
                                    {" / "}
                                    {pedido.cliente?.estado || ""}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Peso: {pedido.peso_total} kg
                                </Text>

                            </View>

                        ))}

                        <Pressable
                            style={styles.botaoFechar}
                            onPress={() => setRotaAberta(null)}
                        >
                            <Text style={styles.textoBotao}>
                                Fechar detalhes
                            </Text>
                        </Pressable>

                    </View>

                )}

            </ScrollView>

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
        marginBottom: 6
    },

    detalhe: {
        color: "#806C61",
        fontSize: 13,
        marginTop: 5
    },

    acoes: {
        flexDirection: "row",
        gap: 10,
        marginTop: 15
    },

    botaoCriar: {
        backgroundColor: "#252B33",
        padding: 14,
        borderRadius: 9,
        alignItems: "center",
        marginBottom: 18
    },

    visualizar: {
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
        color: "#806C61",
        padding: 25
    },

    cardDetalhes: {
        backgroundColor: "#FFFFFF",
        borderRadius: 13,
        padding: 18,
        marginTop: 20
    },

    pedido: {
        borderBottomWidth: 1,
        borderBottomColor: "#E8D8CE",
        paddingVertical: 14
    },

    botaoFechar: {
        backgroundColor: "#252B33",
        padding: 13,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15
    }

});

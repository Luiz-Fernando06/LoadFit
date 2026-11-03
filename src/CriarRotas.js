
import React, { useCallback, useState } from "react";

import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import {
    supabase,
    supabaseConfigurado
} from "./servicos/supabase";

export default function CriarRotas({ navigation }) {

    const [nomeRota, setNomeRota] = useState("");

    const [cargas, setCargas] = useState([]);

    const [cargaSelecionada, setCargaSelecionada] = useState(null);

    const [pedidos, setPedidos] = useState([]);

    const [carregando, setCarregando] = useState(false);

    const [salvando, setSalvando] = useState(false);

    // Busca as cargas cadastradas.
    const carregarCargas = useCallback(async () => {

        try {

            if (!supabaseConfigurado) {
                throw new Error("Supabase não configurado.");
            }

            setCarregando(true);

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            if (!sessao.user) {
                throw new Error("Faça login novamente.");
            }

            const { data, error } = await supabase
                .from("cargas")
                .select("*")
                .eq("user_id", sessao.user.id)
                .order("criado_em", { ascending: false });

            if (error) throw error;

            setCargas(data || []);

        } catch (erro) {

            Alert.alert("Erro", erro.message);

        } finally {

            setCarregando(false);

        }

    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarCargas();
        }, [carregarCargas])
    );

    // Seleciona uma carga e busca seus pedidos.
    async function selecionarCarga(carga) {

        try {

            setCarregando(true);

            setCargaSelecionada(carga);
            setPedidos([]);

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            const { data: vinculos, error } = await supabase
                .from("carga_pedidos")
                .select("pedido_id")
                .eq("carga_id", carga.id)
                .eq("user_id", sessao.user.id);

            if (error) throw error;

            const ids = (vinculos || []).map(
                item => item.pedido_id
            );

            if (ids.length === 0) {
                return;
            }

            const { data: pedidosBanco, error: erroPedidos } =
                await supabase
                    .from("pedidos")
                    .select("*")
                    .in("id", ids)
                    .eq("user_id", sessao.user.id);

            if (erroPedidos) throw erroPedidos;

            const { data: clientes, error: erroClientes } =
                await supabase
                    .from("clientes")
                    .select("id, nome, endereco, cidade, estado")
                    .eq("user_id", sessao.user.id);

            if (erroClientes) throw erroClientes;

            const mapaClientes = new Map(
                (clientes || []).map(cliente => [
                    String(cliente.id),
                    cliente
                ])
            );

            const pedidosComCliente = (pedidosBanco || []).map(pedido => ({
                ...pedido,
                cliente: mapaClientes.get(String(pedido.cliente_id))
            }));

            setPedidos(pedidosComCliente);

        } catch (erro) {

            Alert.alert("Erro", erro.message);

        } finally {

            setCarregando(false);

        }

    }

    // Reorganiza a ordem de entrega.
    function moverPedido(index, direcao) {

        const novaLista = [...pedidos];

        const novoIndex = index + direcao;

        if (novoIndex < 0 || novoIndex >= novaLista.length) {
            return;
        }

        const temporario = novaLista[index];

        novaLista[index] = novaLista[novoIndex];

        novaLista[novoIndex] = temporario;

        setPedidos(novaLista);

    }

    // Calcula o peso total dos pedidos.
    const pesoTotal = pedidos.reduce(
        (total, pedido) =>
            total + Number(pedido.peso_total || 0),
        0
    );

    // Salva a rota no Supabase.
    async function criarRota() {

        if (!nomeRota.trim()) {
            Alert.alert("Atenção", "Informe o nome da rota.");
            return;
        }

        if (!cargaSelecionada) {
            Alert.alert("Atenção", "Selecione uma carga.");
            return;
        }

        if (pedidos.length === 0) {
            Alert.alert("Atenção", "A carga não possui pedidos.");
            return;
        }

        try {

            setSalvando(true);

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            // Cria o registro principal da rota.
            const { data: rota, error } = await supabase
                .from("rotas")
                .insert({
                    user_id: sessao.user.id,
                    carga_id: cargaSelecionada.id,
                    nome: nomeRota.trim()
                })
                .select()
                .single();

            if (error) throw error;

            // Salva os pedidos na ordem escolhida.
            const pedidosRota = pedidos.map((pedido, index) => ({
                user_id: sessao.user.id,
                rota_id: rota.id,
                pedido_id: pedido.id,
                ordem_entrega: index + 1
            }));

            const { error: erroVinculo } = await supabase
                .from("rota_pedidos")
                .insert(pedidosRota);

            if (erroVinculo) {

                // Evita deixar uma rota incompleta.
                await supabase
                    .from("rotas")
                    .delete()
                    .eq("id", rota.id)
                    .eq("user_id", sessao.user.id);

                throw erroVinculo;
            }

            Alert.alert(
                "Rota criada",
                "A rota foi salva com sucesso.",
                [
                    {
                        text: "Visualizar rotas",
                        onPress: () =>
                            navigation.navigate("GerenciarRotas")
                    }
                ]
            );

        } catch (erro) {

            Alert.alert(
                "Erro ao criar rota",
                erro.message
            );

        } finally {

            setSalvando(false);

        }

    }

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView
                contentContainerStyle={styles.conteudo}
                showsVerticalScrollIndicator={false}
            >

                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.voltar}>‹ Voltar</Text>
                </Pressable>

                <Text style={styles.titulo}>
                    Criar rota
                </Text>

                <Text style={styles.subtitulo}>
                    Organize a sequência de entrega dos pedidos.
                </Text>

                {/* NOME DA ROTA */}

                <View style={styles.card}>

                    <Text style={styles.secao}>
                        Dados da rota
                    </Text>

                    <Text style={styles.label}>
                        Nome
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Ex.: Rota São Gonçalo"
                        value={nomeRota}
                        onChangeText={setNomeRota}
                    />

                </View>

                {/* SELEÇÃO DA CARGA */}

                <View style={styles.card}>

                    <Text style={styles.secao}>
                        Selecione uma carga
                    </Text>

                    {carregando && (
                        <ActivityIndicator color="#C96A22" />
                    )}

                    {cargas.map(carga => (

                        <Pressable
                            key={String(carga.id)}
                            style={[
                                styles.opcao,
                                cargaSelecionada?.id === carga.id &&
                                styles.opcaoSelecionada
                            ]}
                            onPress={() => selecionarCarga(carga)}
                        >

                            <Text style={styles.textoOpcao}>
                                Carga #{carga.id}
                            </Text>

                            <Text style={styles.detalhe}>
                                Data: {String(carga.data_prevista).split("-").reverse().join("/")}
                            </Text>

                            <Text style={styles.detalhe}>
                                Peso: {carga.peso_total} kg
                            </Text>

                        </Pressable>

                    ))}

                    {!carregando && cargas.length === 0 && (
                        <Text style={styles.detalhe}>
                            Nenhuma carga cadastrada.
                        </Text>
                    )}

                </View>

                {/* ORDEM DOS PEDIDOS */}

                <View style={styles.card}>

                    <Text style={styles.secao}>
                        Ordem das entregas
                    </Text>

                    {pedidos.map((pedido, index) => (

                        <View
                            key={String(pedido.id)}
                            style={styles.pedido}
                        >

                            <View style={styles.informacoes}>

                                <Text style={styles.textoPedido}>
                                    {index + 1}. Pedido #{pedido.id}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Cliente: {pedido.cliente?.nome || "Não informado"}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Endereço: {pedido.cliente?.endereco || "Não informado"}
                                </Text>

                                <Text style={styles.detalhe}>
                                    {pedido.cliente?.cidade || ""} / {pedido.cliente?.estado || ""}
                                </Text>

                                <Text style={styles.detalhe}>
                                    Peso: {pedido.peso_total} kg
                                </Text>

                            </View>

                            <View style={styles.setas}>

                                <Pressable
                                    style={styles.botaoSeta}
                                    onPress={() => moverPedido(index, -1)}
                                >
                                    <Text style={styles.textoSeta}>↑</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.botaoSeta}
                                    onPress={() => moverPedido(index, 1)}
                                >
                                    <Text style={styles.textoSeta}>↓</Text>
                                </Pressable>

                            </View>

                        </View>

                    ))}

                    {cargaSelecionada && pedidos.length === 0 && !carregando && (
                        <Text style={styles.detalhe}>
                            Essa carga não possui pedidos vinculados.
                        </Text>
                    )}

                    <View style={styles.resumo}>
                        <Text style={styles.label}>
                            Peso total da rota
                        </Text>

                        <Text style={styles.peso}>
                            {pesoTotal.toLocaleString("pt-BR")} kg
                        </Text>
                    </View>

                </View>

                <Pressable
                    style={styles.botao}
                    onPress={criarRota}
                    disabled={salvando}
                >

                    {salvando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.textoBotao}>
                            Salvar rota
                        </Text>
                    )}

                </Pressable>

                <Pressable
                    style={styles.botaoSecundario}
                    onPress={() => navigation.navigate("GerenciarRotas")}
                >
                    <Text style={styles.textoSecundario}>
                        Visualizar rotas criadas
                    </Text>
                </Pressable>

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
        width: "100%",
        maxWidth: 850,
        alignSelf: "center",
        paddingBottom: 40
    },

    voltar: {
        color: "#252B33",
        fontWeight: "700",
        marginBottom: 20
    },

    titulo: {
        fontSize: 28,
        fontWeight: "800",
        color: "#252B33"
    },

    subtitulo: {
        color: "#6B5A50",
        marginTop: 5,
        marginBottom: 20
    },

    card: {
        backgroundColor: "#FFF9F5",
        borderRadius: 14,
        padding: 20,
        marginBottom: 16
    },

    secao: {
        fontSize: 18,
        fontWeight: "800",
        color: "#252B33",
        marginBottom: 15
    },

    label: {
        fontWeight: "700",
        color: "#252B33",
        marginBottom: 7
    },

    input: {
        backgroundColor: "#F3E5DD",
        borderWidth: 1,
        borderColor: "#E0C8B9",
        borderRadius: 9,
        padding: 12
    },

    opcao: {
        borderWidth: 1,
        borderColor: "#E0C8B9",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10
    },

    opcaoSelecionada: {
        borderColor: "#C96A22",
        backgroundColor: "#FCEBDD"
    },

    textoOpcao: {
        fontWeight: "800",
        color: "#252B33"
    },

    detalhe: {
        fontSize: 12,
        color: "#806C61",
        marginTop: 4
    },

    pedido: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E8D8CE"
    },

    informacoes: {
        flex: 1
    },

    textoPedido: {
        fontWeight: "800",
        color: "#252B33"
    },

    setas: {
        gap: 8,
        marginLeft: 10
    },

    botaoSeta: {
        backgroundColor: "#F3E5DD",
        borderRadius: 7,
        padding: 9
    },

    textoSeta: {
        fontSize: 18,
        color: "#C96A22",
        fontWeight: "800"
    },

    resumo: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#E8D8CE"
    },

    peso: {
        fontSize: 20,
        fontWeight: "800",
        color: "#C96A22"
    },

    botao: {
        backgroundColor: "#252B33",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 5
    },

    textoBotao: {
        color: "#FFFFFF",
        fontWeight: "800"
    },

    botaoSecundario: {
        borderWidth: 1,
        borderColor: "#252B33",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 12
    },

    textoSecundario: {
        color: "#252B33",
        fontWeight: "800"
    }

});

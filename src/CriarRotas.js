import React, { useState } from "react";

import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
    ScrollView,
    Modal,
    useWindowDimensions
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";


export default function TelaCriarRota({ navigation }) {

    const { width } = useWindowDimensions();

    const telaGrande = width >= 768;


    const [nomeRota, setNomeRota] = useState(
        "Rota 01 - Niterói"
    );

    const [dataRota, setDataRota] = useState(
        "05/10/2026"
    );


    const [caminhao, setCaminhao] = useState({
        id: 1,
        nome: "Caminhão ABC-1234"
    });


    const [motorista, setMotorista] = useState({
        id: 1,
        nome: "João da Silva"
    });


    /*
        Pedidos de teste.

        A ordem do array representa
        a ordem de entrega.
    */
    const [pedidos, setPedidos] = useState([

        {
            id: 1025,

            cliente: "Gerdau",

            local: "Niterói - RJ",

            dataPrevista: "05/10/2026",

            observacao:
                "Entregar no setor de recebimento.",

            pesoTotal: 2000,

            materiais: [
                {
                    nome: "Vergalhão",

                    quantidade: 100,

                    pesoUnitario: 20,

                    pesoTotal: 2000
                }
            ]
        },

        {
            id: 1026,

            cliente: "Metalúrgica ABC",

            local: "São Gonçalo - RJ",

            dataPrevista: "05/10/2026",

            observacao:
                "Entregar durante o horário comercial.",

            pesoTotal: 1500,

            materiais: [
                {
                    nome: "Tubo",

                    quantidade: 50,

                    pesoUnitario: 30,

                    pesoTotal: 1500
                }
            ]
        },

        {
            id: 1027,

            cliente: "Empresa XYZ",

            local: "Niterói - RJ",

            dataPrevista: "05/10/2026",

            observacao:
                "Conferir material antes da entrega.",

            pesoTotal: 800,

            materiais: [
                {
                    nome: "Chapa",

                    quantidade: 32,

                    pesoUnitario: 25,

                    pesoTotal: 800
                }
            ]
        }

    ]);


    const [pedidoSelecionado, setPedidoSelecionado] =
        useState(null);


    /*
        Soma o peso de todos os pedidos
        atualmente presentes na rota.
    */
    const pesoTotal = pedidos.reduce(
        (total, pedido) =>
            total + pedido.pesoTotal,
        0
    );


    /*
        Move o pedido para cima.
    */
    function moverParaCima(index) {

        if (index === 0) {
            return;
        }

        const novaLista = [...pedidos];

        const pedidoAtual = novaLista[index];

        novaLista[index] =
            novaLista[index - 1];

        novaLista[index - 1] =
            pedidoAtual;

        setPedidos(novaLista);
    }


    /*
        Move o pedido para baixo.
    */
    function moverParaBaixo(index) {

        if (index === pedidos.length - 1) {
            return;
        }

        const novaLista = [...pedidos];

        const pedidoAtual = novaLista[index];

        novaLista[index] =
            novaLista[index + 1];

        novaLista[index + 1] =
            pedidoAtual;

        setPedidos(novaLista);
    }


    /*
        Abre os detalhes do pedido.
    */
    function abrirDetalhes(pedido) {

        setPedidoSelecionado(pedido);

    }


    /*
        Fecha os detalhes.
    */
    function fecharDetalhes() {

        setPedidoSelecionado(null);

    }


    /*
        Criação da rota.
    */
    function criarRota() {

        if (!nomeRota.trim()) {

            Alert.alert(
                "Atenção",
                "Informe o nome da rota."
            );

            return;
        }


        if (pedidos.length === 0) {

            Alert.alert(
                "Atenção",
                "Adicione pelo menos um pedido à rota."
            );

            return;
        }


        /*
            Aqui futuramente enviaremos
            os dados para a API.
        */

        const rota = {

            nome: nomeRota,

            data: dataRota,

            caminhao_id: caminhao.id,

            motorista_id: motorista.id,

            peso_total: pesoTotal,

            pedidos: pedidos.map(
                (pedido, index) => ({

                    pedido_id: pedido.id,

                    ordem_entrega: index + 1

                })
            )

        };


        console.log(
            "ROTA:",
            rota
        );


        Alert.alert(
            "Rota criada",
            "A rota foi criada com sucesso.",
            [
                {
                    text: "OK",
                    onPress: () =>
                        navigation.goBack()
                }
            ]
        );

    }


    return (

        <SafeAreaView style={styles.container}>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View
                    style={[
                        styles.content,
                        telaGrande &&
                        styles.contentGrande
                    ]}
                >


                    {/* CABEÇALHO */}

                    <View style={styles.header}>

                        <View>

                            <Text style={styles.titulo}>
                                Criar rota
                            </Text>

                            <Text style={styles.subtitulo}>
                                Organize a sequência de entrega dos pedidos.
                            </Text>

                        </View>


                        <Pressable
                            style={({ pressed }) => [
                                styles.botaoVoltar,
                                pressed &&
                                styles.botaoPressionado
                            ]}
                            onPress={() =>
                                navigation.goBack()
                            }
                        >

                            <Text style={styles.textoVoltar}>
                                Voltar
                            </Text>

                        </Pressable>

                    </View>


                    {/* DADOS DA ROTA */}

                    <View style={styles.card}>

                        <Text style={styles.tituloSecao}>
                            Dados da rota
                        </Text>


                        <View
                            style={[
                                styles.linha,
                                telaGrande &&
                                styles.linhaGrande
                            ]}
                        >


                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Nome da rota
                                </Text>

                                <View style={styles.inputFake}>

                                    <Text style={styles.inputTexto}>
                                        {nomeRota}
                                    </Text>

                                </View>

                            </View>


                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Data
                                </Text>

                                <View style={styles.inputFake}>

                                    <Text style={styles.inputTexto}>
                                        {dataRota}
                                    </Text>

                                </View>

                            </View>

                        </View>


                        <View
                            style={[
                                styles.linha,
                                telaGrande &&
                                styles.linhaGrande
                            ]}
                        >


                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Caminhão
                                </Text>

                                <Pressable
                                    style={styles.seletor}
                                    onPress={() => {

                                        Alert.alert(
                                            "Caminhão",
                                            "Seleção de caminhão será conectada à API."
                                        );

                                    }}
                                >

                                    <Text style={styles.seletorTexto}>
                                        {caminhao.nome}
                                    </Text>

                                    <Text style={styles.seta}>
                                        ▼
                                    </Text>

                                </Pressable>

                            </View>


                            <View style={styles.campo}>

                                <Text style={styles.label}>
                                    Motorista
                                </Text>

                                <Pressable
                                    style={styles.seletor}
                                    onPress={() => {

                                        Alert.alert(
                                            "Motorista",
                                            "Seleção de motorista será conectada à API."
                                        );

                                    }}
                                >

                                    <Text style={styles.seletorTexto}>
                                        {motorista.nome}
                                    </Text>

                                    <Text style={styles.seta}>
                                        ▼
                                    </Text>

                                </Pressable>

                            </View>

                        </View>

                    </View>


                    {/* PEDIDOS */}

                    <View style={styles.pedidosArea}>

                        <View style={styles.tituloPedidosArea}>

                            <View>

                                <Text style={styles.tituloSecao}>
                                    Pedidos da rota
                                </Text>

                                <Text style={styles.descricaoSecao}>
                                    Organize os pedidos na ordem em que serão entregues.
                                </Text>

                            </View>


                            <Pressable
                                style={({ pressed }) => [
                                    styles.botaoAdicionar,
                                    pressed &&
                                    styles.botaoPressionado
                                ]}
                                onPress={() => {

                                    Alert.alert(
                                        "Adicionar pedido",
                                        "Aqui futuramente serão exibidos os pedidos disponíveis."
                                    );

                                }}
                            >

                                <Text style={styles.textoBotaoAdicionar}>
                                    + Adicionar pedido
                                </Text>

                            </Pressable>

                        </View>


                        {/* LISTA DE PEDIDOS */}

                        {pedidos.map(
                            (pedido, index) => (

                                <View
                                    key={pedido.id}
                                    style={styles.pedidoCard}
                                >


                                    <View style={styles.numeroOrdem}>

                                        <Text style={styles.numeroTexto}>
                                            {index + 1}º
                                        </Text>

                                    </View>


                                    <View style={styles.pedidoInformacoes}>

                                        <View style={styles.pedidoCabecalho}>

                                            <View>

                                                <Text style={styles.pedidoCliente}>
                                                    {pedido.cliente}
                                                </Text>

                                                <Text style={styles.pedidoNumero}>
                                                    Pedido #{pedido.id}
                                                </Text>

                                            </View>


                                            <Text style={styles.pedidoPeso}>
                                                {pedido.pesoTotal.toLocaleString(
                                                    "pt-BR"
                                                )} kg
                                            </Text>

                                        </View>


                                        <Text style={styles.pedidoLocal}>
                                            📍 {pedido.local}
                                        </Text>


                                        <View style={styles.acoesPedido}>


                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.botaoDetalhes,
                                                    pressed &&
                                                    styles.botaoPressionado
                                                ]}
                                                onPress={() =>
                                                    abrirDetalhes(pedido)
                                                }
                                            >

                                                <Text style={styles.textoDetalhes}>
                                                    Ver detalhes
                                                </Text>

                                            </Pressable>


                                            <Pressable
                                                style={[
                                                    styles.botaoOrdem,
                                                    index === 0 &&
                                                    styles.botaoDesabilitado
                                                ]}
                                                disabled={
                                                    index === 0
                                                }
                                                onPress={() =>
                                                    moverParaCima(index)
                                                }
                                            >

                                                <Text style={styles.textoOrdem}>
                                                    ↑
                                                </Text>

                                            </Pressable>


                                            <Pressable
                                                style={[
                                                    styles.botaoOrdem,
                                                    index === pedidos.length - 1 &&
                                                    styles.botaoDesabilitado
                                                ]}
                                                disabled={
                                                    index === pedidos.length - 1
                                                }
                                                onPress={() =>
                                                    moverParaBaixo(index)
                                                }
                                            >

                                                <Text style={styles.textoOrdem}>
                                                    ↓
                                                </Text>

                                            </Pressable>

                                        </View>

                                    </View>

                                </View>

                            )
                        )}

                    </View>


                    {/* RESUMO */}

                    <View style={styles.resumo}>

                        <View>

                            <Text style={styles.resumoTitulo}>
                                Resumo da rota
                            </Text>

                            <Text style={styles.resumoDescricao}>
                                {pedidos.length} pedidos selecionados
                            </Text>

                        </View>


                        <View style={styles.resumoPeso}>

                            <Text style={styles.resumoLabel}>
                                Peso total
                            </Text>

                            <Text style={styles.resumoValor}>
                                {pesoTotal.toLocaleString(
                                    "pt-BR"
                                )} kg
                            </Text>

                        </View>

                    </View>


                    {/* BOTÃO CRIAR */}

                    <Pressable
                        style={({ pressed }) => [
                            styles.botaoCriar,
                            pressed &&
                            styles.botaoPressionado
                        ]}
                        onPress={criarRota}
                    >

                        <Text style={styles.textoBotaoCriar}>
                            Criar rota
                        </Text>

                    </Pressable>


                </View>

            </ScrollView>


            {/* MODAL DE DETALHES */}

            <Modal
                visible={
                    pedidoSelecionado !== null
                }
                transparent
                animationType="fade"
                onRequestClose={
                    fecharDetalhes
                }
            >

                <View style={styles.modalFundo}>

                    {pedidoSelecionado && (

                        <View
                            style={[
                                styles.modal,
                                telaGrande &&
                                styles.modalGrande
                            ]}
                        >


                            <View style={styles.modalCabecalho}>

                                <View>

                                    <Text style={styles.modalTitulo}>
                                        Detalhes do pedido
                                    </Text>

                                    <Text style={styles.modalPedido}>
                                        Pedido #{pedidoSelecionado.id}
                                    </Text>

                                </View>


                                <Pressable
                                    onPress={
                                        fecharDetalhes
                                    }
                                >

                                    <Text style={styles.fechar}>
                                        ✕
                                    </Text>

                                </Pressable>

                            </View>


                            {/* CLIENTE */}

                            <View style={styles.detalheBloco}>

                                <Text style={styles.detalheLabel}>
                                    Cliente
                                </Text>

                                <Text style={styles.detalheValor}>
                                    {pedidoSelecionado.cliente}
                                </Text>

                            </View>


                            {/* LOCAL */}

                            <View style={styles.detalheBloco}>

                                <Text style={styles.detalheLabel}>
                                    Local de entrega
                                </Text>

                                <Text style={styles.detalheValor}>
                                    📍 {pedidoSelecionado.local}
                                </Text>

                            </View>


                            {/* DATA */}

                            <View style={styles.detalheBloco}>

                                <Text style={styles.detalheLabel}>
                                    Data prevista
                                </Text>

                                <Text style={styles.detalheValor}>
                                    {pedidoSelecionado.dataPrevista}
                                </Text>

                            </View>


                            {/* MATERIAIS */}

                            <View style={styles.materiaisArea}>

                                <Text style={styles.detalheLabel}>
                                    Materiais
                                </Text>


                                {pedidoSelecionado.materiais.map(
                                    (material, index) => (

                                        <View
                                            key={index}
                                            style={styles.material}
                                        >

                                            <Text style={styles.materialNome}>
                                                {material.nome}
                                            </Text>

                                            <Text style={styles.materialQuantidade}>
                                                Quantidade: {material.quantidade}
                                            </Text>

                                            <Text style={styles.materialPeso}>
                                                Peso unitário: {material.pesoUnitario} kg
                                            </Text>

                                            <Text style={styles.materialPeso}>
                                                Peso total: {material.pesoTotal.toLocaleString(
                                                    "pt-BR"
                                                )} kg
                                            </Text>

                                        </View>

                                    )
                                )}

                            </View>


                            {/* OBSERVAÇÃO */}

                            <View style={styles.detalheBloco}>

                                <Text style={styles.detalheLabel}>
                                    Observação
                                </Text>

                                <Text style={styles.detalheValor}>
                                    {pedidoSelecionado.observacao}
                                </Text>

                            </View>


                            <Pressable
                                style={({ pressed }) => [
                                    styles.botaoFechar,
                                    pressed &&
                                    styles.botaoPressionado
                                ]}
                                onPress={
                                    fecharDetalhes
                                }
                            >

                                <Text style={styles.textoBotaoFechar}>
                                    Fechar
                                </Text>

                            </Pressable>


                        </View>

                    )}

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


    scrollContent: {
        flexGrow: 1,

        paddingHorizontal: 20,

        paddingVertical: 30
    },


    content: {
        width: "100%",

        maxWidth: 900,

        alignSelf: "center"
    },


    contentGrande: {
        paddingHorizontal: 10
    },


    header: {
        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        flexWrap: "wrap",

        gap: 15,

        marginBottom: 30
    },


    titulo: {
        fontSize: 30,

        fontWeight: "700",

        color: "#20262E"
    },


    subtitulo: {
        marginTop: 7,

        fontSize: 14,

        color: "#6B7280"
    },


    botaoVoltar: {
        minHeight: 42,

        paddingHorizontal: 18,

        borderWidth: 1,

        borderColor: "#7a3f074d",

        borderRadius: 9,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",

        alignItems: "center"
    },


    textoVoltar: {
        color: "#303842",

        fontSize: 14,

        fontWeight: "600"
    },


    card: {
        backgroundColor: "#FFF9F5",

        borderRadius: 12,

        padding: 24,

        borderWidth: 1,

        borderColor: "#7a3f074d",

        marginBottom: 25
    },


    tituloSecao: {
        fontSize: 19,

        fontWeight: "700",

        color: "#252B33",

        marginBottom: 6
    },


    descricaoSecao: {
        fontSize: 13,

        color: "#6B7280",

        lineHeight: 20,

        marginBottom: 20
    },


    linha: {
        flexDirection: "column",

        gap: 15,

        marginBottom: 15
    },


    linhaGrande: {
        flexDirection: "row"
    },


    campo: {
        flex: 1
    },


    label: {
        fontSize: 13,

        fontWeight: "600",

        color: "#5F514A",

        marginBottom: 7
    },


    inputFake: {
        minHeight: 48,

        backgroundColor: "#F3E5DD",

        borderWidth: 1,

        borderColor: "#E0C8B9",

        borderRadius: 9,

        paddingHorizontal: 14,

        justifyContent: "center"
    },


    inputTexto: {
        color: "#252B33",

        fontSize: 14
    },


    seletor: {
        minHeight: 48,

        backgroundColor: "#F3E5DD",

        borderWidth: 1,

        borderColor: "#E0C8B9",

        borderRadius: 9,

        paddingHorizontal: 14,

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center"
    },


    seletorTexto: {
        color: "#252B33",

        fontSize: 14
    },


    seta: {
        color: "#806C61",

        fontSize: 12
    },


    pedidosArea: {
        marginBottom: 25
    },


    tituloPedidosArea: {
        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "flex-end",

        flexWrap: "wrap",

        gap: 15,

        marginBottom: 15
    },


    botaoAdicionar: {
        minHeight: 44,

        paddingHorizontal: 18,

        backgroundColor: "#C96A22",

        borderRadius: 9,

        justifyContent: "center",

        alignItems: "center"
    },


    textoBotaoAdicionar: {
        color: "#FFFFFF",

        fontSize: 13,

        fontWeight: "700"
    },


    pedidoCard: {
        backgroundColor: "#FFF9F5",

        borderWidth: 1,

        borderColor: "#7a3f074d",

        borderRadius: 12,

        padding: 18,

        marginBottom: 12,

        flexDirection: "row",

        gap: 15
    },


    numeroOrdem: {
        width: 45,

        height: 45,

        borderRadius: 10,

        backgroundColor: "#252B33",

        justifyContent: "center",

        alignItems: "center"
    },


    numeroTexto: {
        color: "#FFFFFF",

        fontSize: 15,

        fontWeight: "700"
    },


    pedidoInformacoes: {
        flex: 1,

        minWidth: 0
    },


    pedidoCabecalho: {
        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "flex-start",

        gap: 10
    },


    pedidoCliente: {
        color: "#252B33",

        fontSize: 16,

        fontWeight: "700"
    },


    pedidoNumero: {
        color: "#806C61",

        fontSize: 12,

        marginTop: 3
    },


    pedidoPeso: {
        color: "#C96A22",

        fontSize: 14,

        fontWeight: "700"
    },


    pedidoLocal: {
        color: "#5F514A",

        fontSize: 13,

        marginTop: 12
    },


    acoesPedido: {
        flexDirection: "row",

        justifyContent: "flex-end",

        alignItems: "center",

        gap: 8,

        marginTop: 15,

        flexWrap: "wrap"
    },


    botaoDetalhes: {
        minHeight: 40,

        paddingHorizontal: 15,

        borderWidth: 1,

        borderColor: "#C96A22",

        borderRadius: 8,

        justifyContent: "center",

        alignItems: "center"
    },


    textoDetalhes: {
        color: "#C96A22",

        fontSize: 12,

        fontWeight: "700"
    },


    botaoOrdem: {
        width: 40,

        height: 40,

        borderRadius: 8,

        backgroundColor: "#252B33",

        justifyContent: "center",

        alignItems: "center"
    },


    botaoDesabilitado: {
        opacity: 0.3
    },


    textoOrdem: {
        color: "#FFFFFF",

        fontSize: 18,

        fontWeight: "700"
    },


    resumo: {
        backgroundColor: "#252B33",

        borderRadius: 12,

        padding: 22,

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        flexWrap: "wrap",

        gap: 20,

        marginBottom: 20
    },


    resumoTitulo: {
        color: "#FFFFFF",

        fontSize: 17,

        fontWeight: "700"
    },


    resumoDescricao: {
        color: "#D1D5DB",

        fontSize: 13,

        marginTop: 4
    },


    resumoPeso: {
        alignItems: "flex-end"
    },


    resumoLabel: {
        color: "#D1D5DB",

        fontSize: 12
    },


    resumoValor: {
        color: "#FFFFFF",

        fontSize: 20,

        fontWeight: "700",

        marginTop: 3
    },


    botaoCriar: {
        minHeight: 52,

        backgroundColor: "#C96A22",

        borderRadius: 9,

        justifyContent: "center",

        alignItems: "center"
    },


    textoBotaoCriar: {
        color: "#FFFFFF",

        fontSize: 15,

        fontWeight: "700"
    },


    botaoPressionado: {
        opacity: 0.8
    },


    /* MODAL */

    modalFundo: {
        flex: 1,

        backgroundColor: "rgba(0,0,0,0.45)",

        justifyContent: "center",

        alignItems: "center",

        padding: 20
    },


    modal: {
        width: "100%",

        maxHeight: "90%",

        backgroundColor: "#FFF9F5",

        borderRadius: 14,

        padding: 24
    },


    modalGrande: {
        maxWidth: 600
    },


    modalCabecalho: {
        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "flex-start",

        marginBottom: 20
    },


    modalTitulo: {
        color: "#252B33",

        fontSize: 20,

        fontWeight: "700"
    },


    modalPedido: {
        color: "#806C61",

        fontSize: 12,

        marginTop: 4
    },


    fechar: {
        color: "#252B33",

        fontSize: 20,

        fontWeight: "700",

        paddingHorizontal: 5
    },


    detalheBloco: {
        marginBottom: 17
    },


    detalheLabel: {
        color: "#806C61",

        fontSize: 12,

        fontWeight: "600",

        marginBottom: 5
    },


    detalheValor: {
        color: "#252B33",

        fontSize: 14,

        lineHeight: 20
    },


    materiaisArea: {
        marginBottom: 17
    },


    material: {
        backgroundColor: "#F3E5DD",

        borderRadius: 9,

        padding: 13,

        marginTop: 8,

        borderWidth: 1,

        borderColor: "#E0C8B9"
    },


    materialNome: {
        color: "#252B33",

        fontSize: 14,

        fontWeight: "700",

        marginBottom: 5
    },


    materialQuantidade: {
        color: "#5F514A",

        fontSize: 12,

        marginBottom: 2
    },


    materialPeso: {
        color: "#5F514A",

        fontSize: 12,

        marginBottom: 2
    },


    botaoFechar: {
        minHeight: 46,

        backgroundColor: "#252B33",

        borderRadius: 9,

        justifyContent: "center",

        alignItems: "center",

        marginTop: 5
    },


    textoBotaoFechar: {
        color: "#FFFFFF",

        fontSize: 14,

        fontWeight: "700"
    }

});
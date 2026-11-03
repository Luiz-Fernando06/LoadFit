
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

export default function GerenciarCargas({ navigation }) {

    const [cargas, setCargas] = useState([]);

    const [caminhoes, setCaminhoes] = useState([]);
    const [motoristas, setMotoristas] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [cargaEditando, setCargaEditando] = useState(null);

    const [data, setData] = useState("");
    const [caminhaoId, setCaminhaoId] = useState(null);
    const [motoristaId, setMotoristaId] = useState(null);
    const [status, setStatus] = useState("PLANEJADA");

    const [modal, setModal] = useState(null);

    // Carrega cargas, caminhões e motoristas.
    const carregarDados = useCallback(async () => {

        try {

            setCarregando(true);

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            const [c, cam, mot] = await Promise.all([

                supabase
                    .from("cargas")
                    .select("*")
                    .eq("user_id", sessao.user.id)
                    .order("criado_em", { ascending: false }),

                supabase
                    .from("caminhoes")
                    .select("*")
                    .eq("user_id", sessao.user.id),

                supabase
                    .from("motoristas")
                    .select("*")
                    .eq("user_id", sessao.user.id)

            ]);

            if (c.error) throw c.error;
            if (cam.error) throw cam.error;
            if (mot.error) throw mot.error;

            const mapaCaminhoes = new Map(
                cam.data.map(x => [String(x.id), x])
            );

            const mapaMotoristas = new Map(
                mot.data.map(x => [String(x.id), x])
            );

            const lista = c.data.map(carga => ({

                ...carga,

                caminhao: mapaCaminhoes.get(
                    String(carga.caminhao_id)
                ),

                motorista: mapaMotoristas.get(
                    String(carga.motorista_id)
                )

            }));

            setCargas(lista);
            setCaminhoes(cam.data);
            setMotoristas(mot.data);

        } catch (erro) {

            Alert.alert("Erro", erro.message);

        } finally {

            setCarregando(false);

        }

    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [carregarDados])
    );

    // Abre a edição da carga.
    function abrirEdicao(carga) {

        setCargaEditando(carga);

        setData(
            String(carga.data_prevista).slice(0, 10)
        );

        setCaminhaoId(carga.caminhao_id);

        setMotoristaId(carga.motorista_id);

        setStatus(carga.status);

    }

    // Atualiza os dados da carga.
    async function atualizarCarga() {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {

            Alert.alert(
                "Data inválida",
                "Utilize AAAA-MM-DD."
            );

            return;
        }

        if (!caminhaoId || !motoristaId) {

            Alert.alert(
                "Atenção",
                "Selecione um caminhão e um motorista."
            );

            return;
        }

        try {

            const { data: sessao, error: erroUsuario } =
                await supabase.auth.getUser();

            if (erroUsuario) throw erroUsuario;

            // Verifica se o caminhão suporta o peso da carga.
            const caminhao = caminhoes.find(
                c => String(c.id) === String(caminhaoId)
            );

            if (!caminhao) {
                throw new Error("Caminhão não encontrado.");
            }

            if (
                Number(cargaEditando.peso_total) >
                Number(caminhao.capacidade)
            ) {

                Alert.alert(
                    "Capacidade excedida",
                    "O caminhão escolhido não suporta o peso desta carga."
                );

                return;
            }

            const { error } = await supabase
                .from("cargas")
                .update({

                    data_prevista: data,

                    caminhao_id: caminhaoId,

                    motorista_id: motoristaId,

                    status: status

                })
                .eq("id", cargaEditando.id)
                .eq("user_id", sessao.user.id);

            if (error) throw error;

            setCargaEditando(null);

            Alert.alert(
                "Carga atualizada",
                "As alterações foram salvas."
            );

            carregarDados();

        } catch (erro) {

            Alert.alert("Erro ao atualizar", erro.message);

        }

    }

    // Exclui a carga e libera os pedidos.
    function excluirCarga(carga) {

        Alert.alert(

            "Excluir carga",

            `Deseja excluir a carga #${carga.id}? Os pedidos voltarão para PENDENTE.`,

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

                            const { error } = await supabase
                                .rpc("excluir_carga", {
                                    p_carga_id: carga.id
                                });

                            if (error) throw error;

                            Alert.alert(
                                "Carga excluída",
                                "A carga foi removida e seus pedidos foram liberados."
                            );

                            carregarDados();

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
                    Gerenciar cargas
                </Text>

                <Text style={styles.subtitulo}>
                    Consulte e atualize as cargas criadas.
                </Text>

                {carregando && (
                    <ActivityIndicator color="#C96A22" />
                )}

                {!carregando && cargas.length === 0 && (
                    <Text style={styles.vazio}>
                        Nenhuma carga cadastrada.
                    </Text>
                )}

                {cargas.map(carga => (

                    <View
                        key={String(carga.id)}
                        style={styles.card}
                    >

                        <Text style={styles.nome}>
                            Carga #{carga.id}
                        </Text>

                        <Text style={styles.info}>
                            Data: {String(carga.data_prevista)
                                .slice(0, 10)
                                .split("-")
                                .reverse()
                                .join("/")
                            }
                        </Text>

                        <Text style={styles.info}>
                            Caminhão: {carga.caminhao?.placa || "Não informado"}
                        </Text>

                        <Text style={styles.info}>
                            Motorista: {carga.motorista?.nome || "Não informado"}
                        </Text>

                        <Text style={styles.info}>
                            Peso: {carga.peso_total} kg
                        </Text>

                        <Text style={styles.info}>
                            Status: {carga.status}
                        </Text>

                        <View style={styles.acoes}>

                            <Pressable
                                style={styles.atualizar}
                                onPress={() => abrirEdicao(carga)}
                            >
                                <Text style={styles.textoBotao}>
                                    Atualizar
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.excluir}
                                onPress={() => excluirCarga(carga)}
                            >
                                <Text style={styles.textoBotao}>
                                    Excluir
                                </Text>
                            </Pressable>

                        </View>

                    </View>

                ))}

            </ScrollView>

            {/* MODAL DE EDIÇÃO */}

            <Modal
                visible={cargaEditando !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setCargaEditando(null)}
            >

                <View style={styles.fundoModal}>

                    <View style={styles.modal}>

                        <ScrollView>

                            <Text style={styles.nome}>
                                Atualizar carga #{cargaEditando?.id}
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
                                Caminhão
                            </Text>

                            {caminhoes.map(item => (

                                <Pressable
                                    key={String(item.id)}
                                    style={[
                                        styles.opcao,
                                        String(caminhaoId) === String(item.id) &&
                                        styles.selecionado
                                    ]}
                                    onPress={() => setCaminhaoId(item.id)}
                                >

                                    <Text style={styles.info}>
                                        {item.placa} - {item.modelo}
                                    </Text>

                                    <Text style={styles.info}>
                                        Capacidade: {item.capacidade} kg
                                    </Text>

                                </Pressable>

                            ))}

                            <Text style={styles.label}>
                                Motorista
                            </Text>

                            {motoristas.map(item => (

                                <Pressable
                                    key={String(item.id)}
                                    style={[
                                        styles.opcao,
                                        String(motoristaId) === String(item.id) &&
                                        styles.selecionado
                                    ]}
                                    onPress={() => setMotoristaId(item.id)}
                                >

                                    <Text style={styles.info}>
                                        {item.nome}
                                    </Text>

                                </Pressable>

                            ))}

                            <Text style={styles.label}>
                                Status
                            </Text>

                            {["PLANEJADA", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"].map(item => (

                                <Pressable
                                    key={item}
                                    style={[
                                        styles.opcao,
                                        status === item && styles.selecionado
                                    ]}
                                    onPress={() => setStatus(item)}
                                >

                                    <Text style={styles.info}>
                                        {item}
                                    </Text>

                                </Pressable>

                            ))}

                            <View style={styles.acoes}>

                                <Pressable
                                    style={styles.cancelar}
                                    onPress={() => setCargaEditando(null)}
                                >
                                    <Text style={styles.textoCancelar}>
                                        Cancelar
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.atualizar}
                                    onPress={atualizarCarga}
                                >
                                    <Text style={styles.textoBotao}>
                                        Salvar
                                    </Text>
                                </Pressable>

                            </View>

                        </ScrollView>

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
        fontSize: 18,
        fontWeight: "800",
        color: "#252B33",
        marginBottom: 10
    },

    info: {
        color: "#806C61",
        fontSize: 13,
        marginTop: 5
    },

    acoes: {
        flexDirection: "row",
        gap: 10,
        marginTop: 15
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
        padding: 15
    },

    modal: {
        backgroundColor: "#FFF9F5",
        padding: 20,
        borderRadius: 14,
        maxHeight: "90%"
    },

    label: {
        fontWeight: "700",
        color: "#252B33",
        marginTop: 14,
        marginBottom: 7
    },

    input: {
        backgroundColor: "#F3E5DD",
        borderWidth: 1,
        borderColor: "#E0C8B9",
        borderRadius: 8,
        padding: 12
    },

    opcao: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#E0C8B9",
        borderRadius: 8,
        marginBottom: 7
    },

    selecionado: {
        borderColor: "#C96A22",
        backgroundColor: "#FCEBDD"
    },

    cancelar: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#C96A22",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },

    textoCancelar: {
        color: "#A6531D",
        fontWeight: "700"
    }

});

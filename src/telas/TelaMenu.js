import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
    ScrollView,
    useWindowDimensions,
    Image
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";


export default function TelaMenu({ navigation }) {

    const { width } = useWindowDimensions();

    // Breakpoints
    const isTablet = width >= 600;
    const isDesktop = width >= 900;


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
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.content}>

                    {/* Cabeçalho */}
                    <View style={styles.header}>

                        <View style={styles.areaLogo}>

                            <View style={styles.logoContainer}>

                                <Image
                                    source={require("../../assets/logo.png")}
                                    style={styles.logoImagem}
                                />

                            </View>

                            <View>

                                <Text style={styles.logoTexto}>
                                    LoadFit
                                </Text>

                                <Text style={styles.subtitulo}>
                                    Organização inteligente de cargas
                                </Text>

                            </View>

                        </View>


                        <Pressable
                            style={({ pressed }) => [
                                styles.botaoSair,
                                pressed && styles.botaoPressionado
                            ]}
                            onPress={sair}
                        >

                            <Text style={styles.textoSair}>
                                Sair
                            </Text>

                        </Pressable>

                    </View>


                    {/* Apresentação */}
                    <View style={styles.boasVindas}>

                        <Text style={styles.titulo}>
                            Seja Bem Vindo!
                        </Text>

                        <Text style={styles.descricao}>
                            Gerencie os dados necessários para organizar e distribuir suas cargas.
                        </Text>

                    </View>


                    {/* Área dos cards */}
                    <View style={styles.grid}>

                        {/* Caminhões */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,

                                isDesktop
                                    ? styles.cardDesktop
                                    : isTablet
                                        ? styles.cardTablet
                                        : styles.cardMobile,

                                pressed && styles.cardPressionado
                            ]}
                            onPress={() =>
                                navigation.navigate("CadastroCaminhao")
                            }
                        >

                            <View style={styles.iconeContainer}>
                                <Image source={require("../../assets/caminhao-icone.png")} 
                                style={styles.iconeImage}/>
                            </View>

                            <Text style={styles.cardTitulo}>
                                Caminhões
                            </Text>

                            <Text style={styles.cardDescricao}>
                                Cadastre e gerencie os veículos utilizados nas cargas.
                            </Text>

                            <Text style={styles.cardAcao}>
                                Acessar →
                            </Text>

                        </Pressable>


                        {/* Materiais */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,

                                isDesktop
                                    ? styles.cardDesktop
                                    : isTablet
                                        ? styles.cardTablet
                                        : styles.cardMobile,

                                pressed && styles.cardPressionado
                            ]}
                            onPress={() =>
                                funcionalidadeEmBreve("Materiais")
                            }
                        >

                            <View style={styles.iconeContainer}>
                               <Image source={require("../../assets/ferro-icone.png")} 
                                style={styles.iconeImage}/>
                            </View>

                            <Text style={styles.cardTitulo}>
                                Materiais
                            </Text>

                            <Text style={styles.cardDescricao}>
                                Cadastre materiais e informe seus respectivos pesos.
                            </Text>

                            <Text style={styles.cardAcao}>
                                Acessar →
                            </Text>

                        </Pressable>


                        {/* Clientes */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,

                                isDesktop
                                    ? styles.cardDesktop
                                    : isTablet
                                        ? styles.cardTablet
                                        : styles.cardMobile,

                                pressed && styles.cardPressionado
                            ]}
                            onPress={() =>
                                funcionalidadeEmBreve("Clientes")
                            }
                        >

                            <View style={styles.iconeContainer}>
                               <Image source={require("../../assets/cliente.png")} 
                                style={styles.iconeImage}/>
                            </View>

                            <Text style={styles.cardTitulo}>
                                Clientes
                            </Text>

                            <Text style={styles.cardDescricao}>
                                Gerencie os clientes vinculados aos pedidos e cargas.
                            </Text>

                            <Text style={styles.cardAcao}>
                                Acessar →
                            </Text>

                        </Pressable>


                        {/* Motoristas */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,

                                isDesktop
                                    ? styles.cardDesktop
                                    : isTablet
                                        ? styles.cardTablet
                                        : styles.cardMobile,

                                pressed && styles.cardPressionado
                            ]}
                            onPress={() =>
                                funcionalidadeEmBreve("Motoristas")
                            }
                        >

                            <View style={styles.iconeContainer}>
                                <Image source={require("../../assets/motorista-icone.png")} 
                                style={styles.iconeImage}/>
                            </View>

                            <Text style={styles.cardTitulo}>
                                Motoristas
                            </Text>

                            <Text style={styles.cardDescricao}>
                                Cadastre e gerencie os motoristas disponíveis.
                            </Text>

                            <Text style={styles.cardAcao}>
                                Acessar →
                            </Text>

                        </Pressable>

                    </View>


                    {/* Organizador de carga */}
                    <View style={styles.areaOrganizar}>

                        <View style={styles.organizarTextoArea}>

                            <Text style={styles.organizarTitulo}>
                                Distribuição de carga
                            </Text>

                            <Text style={styles.organizarDescricao}>
                                Utilize os dados cadastrados para organizar os materiais entre os caminhões disponíveis.
                            </Text>

                        </View>


                        <Pressable
                            style={({ pressed }) => [
                                styles.botaoOrganizar,
                                pressed && styles.botaoPressionado
                            ]}
                            onPress={() =>
                                funcionalidadeEmBreve("Organizar Carga")
                            }
                        >

                            <Text style={styles.textoBotaoOrganizar}>
                                Organizar carga
                            </Text>

                        </Pressable>

                    </View>

                </View>

            </ScrollView>

        </SafeAreaView>

    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,

        backgroundColor: "#e4b89e"
    },


    scrollContent: {
        flexGrow: 1,

        paddingHorizontal: 20,
        paddingVertical: 30
    },


    /*
        No celular ocupa praticamente a tela toda.

        Na web impede o conteúdo de ficar extremamente
        espalhado em monitores grandes.
    */
    content: {
        width: "100%",

        maxWidth: 1100,

        alignSelf: "center"
    },


    /*
        CABEÇALHO
    */
    header: {
        flexDirection: "row",

        justifyContent: "space-between",
        alignItems: "center",

        flexWrap: "wrap",

        marginBottom: 45,

        gap: 15
    },


    areaLogo: {
        flexDirection: "row",

        alignItems: "center",

        flexShrink: 1
    },


    logoContainer: {
        width: 55,
        height: 55,

        borderRadius: 13,

        backgroundColor: "#252B33",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 13
    },


    logoImagem: {
        width: 75,
        height: 55,

        resizeMode: "contain"
    },


    logoTexto: {
        fontSize: 23,

        fontWeight: "700",

        color: "#20262E",

        letterSpacing: -0.5
    },


    subtitulo: {
        fontSize: 12,

        color: "#6B7280",

        marginTop: 2
    },


    botaoSair: {
        minHeight: 40,

        paddingHorizontal: 18,

        borderWidth: 1,
        borderColor: "#7a3f074d",

        borderRadius: 9,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center"
    },


    textoSair: {
        color: "#303842",

        fontSize: 14,

        fontWeight: "600"
    },


    /*
        APRESENTAÇÃO
    */
    boasVindas: {
        marginBottom: 30
    },


    titulo: {
        fontSize: 30,

        fontWeight: "700",

        color: "#20262E",

        letterSpacing: -0.5
    },


    descricao: {
        maxWidth: 600,

        fontSize: 14,

        color: "#6B7280",

        lineHeight: 21,

        marginTop: 8
    },


    /*
        GRID
    */
    grid: {
        flexDirection: "row",

        flexWrap: "wrap",

        justifyContent: "space-between",

        gap: 15
    },


    card: {
        minHeight: 210,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#7a3f074d",

        borderRadius: 12,

        padding: 20,

        justifyContent: "flex-start"
    },


    /*
        Menos de 600px:
        um card por linha.
    */
    cardMobile: {
        width: "100%"
    },


    /*
        Entre 600px e 899px:
        dois cards.
    */
    cardTablet: {
        width: "48%"
    },


    /*
        900px ou mais:
        quatro cards.
    */
    cardDesktop: {
        width: "23.5%"
    },


    cardPressionado: {
        opacity: 0.8,

        transform: [
            {
                scale: 0.99
            }
        ]
    },


    iconeContainer: {
        width: 48,
        height: 48,

        borderRadius: 10,

        backgroundColor: "#fc730b",

        justifyContent: "center",
        alignItems: "center",

        marginBottom: 18
    },


    iconeImage: {
        width: 35,
        height: 35,
        resizeMode: "contain",

        letterSpacing: 0.5
    },


    cardTitulo: {
        fontSize: 17,

        fontWeight: "700",

        color: "#20262E",

        marginBottom: 7
    },


    cardDescricao: {
        fontSize: 13,

        color: "#6B7280",

        lineHeight: 19,

        flex: 1
    },


    cardAcao: {
        fontSize: 13,

        fontWeight: "700",

        color: "#C96A22",

        marginTop: 20
    },


    /*
        ÁREA DE ORGANIZAR CARGA
    */
    areaOrganizar: {
        marginTop: 30,

        backgroundColor: "#252B33",

        borderRadius: 12,

        padding: 24,

        flexDirection: "row",

        justifyContent: "space-between",
        alignItems: "center",

        flexWrap: "wrap",

        gap: 20
    },


    organizarTextoArea: {
        flex: 1,

        minWidth: 230
    },


    organizarTitulo: {
        color: "#FFFFFF",

        fontSize: 19,

        fontWeight: "700",

        marginBottom: 6
    },


    organizarDescricao: {
        maxWidth: 600,

        color: "#D1D5DB",

        fontSize: 13,

        lineHeight: 20
    },


    botaoOrganizar: {
        minHeight: 48,

        paddingHorizontal: 24,

        backgroundColor: "#C96A22",

        borderRadius: 9,

        justifyContent: "center",
        alignItems: "center"
    },


    textoBotaoOrganizar: {
        color: "#FFFFFF",

        fontSize: 14,

        fontWeight: "700"
    },


    botaoPressionado: {
        opacity: 0.8
    }

});
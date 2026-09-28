//Polyfill necessário para o Supabase funcionar corretamente no React Native
import "react-native-url-polyfill/auto";

//AsyncStorage mantém a sessão salva no Android/iOS
import AsyncStorage from "@react-native-async-storage/async-storage";

//Biblioteca oficial do Supabase
import { createClient } from "@supabase/supabase-js";

//Usado para identificar se o aplicativo está rodando na Web ou no celular
import { AppState, Platform } from "react-native";


//URL do projeto Supabase cadastrada no arquivo .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

//Chave pública do projeto Supabase cadastrada no arquivo .env
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;


//Verifica se o usuário já substituiu os valores de exemplo do arquivo .env
//Isso evita tentar fazer login em uma URL fictícia e facilita encontrar erros de configuração.
export const supabaseConfigurado = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes("SEU-PROJETO") &&
  !supabasePublishableKey.includes("SUBSTITUA")
);


//Cria a conexão do aplicativo com o Supabase
export const supabase = createClient(
  supabaseUrl || "https://SEU-PROJETO.supabase.co",
  supabasePublishableKey || "sb_publishable_SUBSTITUA_PELA_SUA_CHAVE",
  {
    auth: {

      //No Android/iOS usa o AsyncStorage para manter o usuário conectado.
      //Na Web, o Supabase utiliza o armazenamento do próprio navegador.
      storage: Platform.OS === "web" ? undefined : AsyncStorage,

      //Mantém a sessão do usuário salva
      persistSession: true,

      //Renova automaticamente o token de autenticação
      autoRefreshToken: true,

      //No React Native não precisamos buscar sessão pela URL
      detectSessionInUrl: false,
    },
  }
);


//No celular, pausa a renovação do token quando o app está em segundo plano
//e volta a renovar quando o usuário retorna ao aplicativo.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (estado) => {
    if (estado === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

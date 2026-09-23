import { Platform } from "react-native";

// No Android Emulator, 10.0.2.2 aponta para o localhost do computador.
// Em celular físico, crie um arquivo .env com o IP do computador, por exemplo:
// EXPO_PUBLIC_API_URL=http://192.168.0.15:3000
const enderecoPadrao = Platform.OS === "android"
  ? "http://10.0.2.2:3000"
  : "http://localhost:3000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || enderecoPadrao;

export async function api(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(opcoes.headers || {}),
    },
  });

  let dados = null;

  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const erro = new Error(dados?.erro || "Não foi possível concluir a operação.");
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}

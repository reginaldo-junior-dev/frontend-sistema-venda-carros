import axios from 'axios'
import { http } from '@/lib/http'

export async function listarEnderecos() {
  try {
    const { data } = await http.get('/endereco')
    return data
  } catch (erro) {
    // Sem cadastro de cliente ainda não há endereços
    if (erro.status === 404) return []
    throw erro
  }
}

export async function salvarEndereco({ id, ...endereco }) {
  const { data } = id ? await http.put(`/endereco/${id}`, endereco) : await http.post('/endereco', endereco)
  return data
}

export async function excluirEndereco(id) {
  await http.delete(`/endereco/${id}`)
}

// ViaCEP: serviço público; só o CEP sai do navegador. Sem resposta, a pessoa preenche à mão.
export async function buscarCep(cep) {
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 5000 })
    if (data.erro) return null
    return { logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }
  } catch {
    return null
  }
}

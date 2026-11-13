import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item?.msg).filter(Boolean)
    if (messages.length) return messages.join(', ')
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Permintaan ke server terlalu lama. Periksa koneksi lalu coba lagi.'
  }
  if (!error?.response) {
    return 'Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8000.'
  }
  return 'Terjadi kesalahan pada server. Coba lagi beberapa saat lagi.'
}

export const authService = {
  async login(phoneNumber) {
    const { data } = await api.post('/auth/login', { phone_number: phoneNumber })
    return data
  },
}

const PAGE_SIZE = 200
const MAX_PAGES = 25

export const transactionService = {
  async list(userId, params = {}) {
    const { data } = await api.get(`/transactions/${userId}`, { params })
    return data
  },

  async listAll(userId) {
    const collected = []
    let skip = 0
    let total = 0

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const data = await transactionService.list(userId, {
        skip,
        limit: PAGE_SIZE,
      })

      const items = data?.items ?? []
      total = data?.total ?? items.length
      collected.push(...items)

      skip += items.length
      if (items.length === 0 || collected.length >= total) break
    }

    return { items: collected, total }
  },

  async summary(userId) {
    const { data } = await api.get(`/transactions/${userId}/summary`)
    return data
  },

  async chart(userId, days = 30) {
    const { data } = await api.get(`/transactions/${userId}/chart`, {
      params: { days },
    })
    return data
  },

  async create(payload) {
    const { data } = await api.post('/transactions/', payload)
    return data
  },

  async update(transactionId, payload) {
    const { data } = await api.put(`/transactions/${transactionId}`, payload)
    return data
  },

  async remove(transactionId) {
    const { data } = await api.delete(`/transactions/${transactionId}`)
    return data
  },
}

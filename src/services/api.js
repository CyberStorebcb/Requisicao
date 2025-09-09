import axios from 'axios'

// Detectar ambiente e usar a URL apropriada
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // URL da sua API no Vercel (substitua pela sua URL real)
    return 'https://your-app-name.vercel.app/api'
  }
  // URL local para desenvolvimento
  return 'http://localhost:3000/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 404) {
      console.error('Endpoint not found - check if API is deployed correctly')
    }
    return Promise.reject(error)
  }
)

export default api

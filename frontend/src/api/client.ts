const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function fetchHealth() {
  const response = await fetch(`${BASE_URL}/health`)
  return response.json()
}

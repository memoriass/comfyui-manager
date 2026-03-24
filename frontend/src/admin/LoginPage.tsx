import { useState } from "react"
import axios from "axios"
import { useStore } from "../store"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const setToken = useStore((state) => state.setToken)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new URLSearchParams()
      formData.append("username", username)
      formData.append("password", password)
      
      const res = await axios.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      setToken(res.data.access_token)
    } catch (err: any) {
      setError("登录失败，请检查用户名和密码。")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">管理员登录</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            登录
          </button>
        </form>
      </div>
    </div>
  )
}


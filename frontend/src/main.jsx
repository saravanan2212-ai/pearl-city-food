import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminLogin from './AdminLogin.jsx'

function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem('adminLoggedIn') === 'true'
  )

  const handleLogin = () => {
    setLoggedIn(true)
  }

  if (!loggedIn) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard />
}

const isAdminPage = window.location.pathname === '/admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminPage ? <AdminPage /> : <App />}
  </StrictMode>,
)
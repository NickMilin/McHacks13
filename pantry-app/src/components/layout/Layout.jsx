import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ChatBot } from '../ChatBot'

export function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
      <ChatBot />
    </div>
  )
}

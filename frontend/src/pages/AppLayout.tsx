import { Outlet } from 'react-router-dom'

import { Navbar } from '../components/shared/Navbar'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Navbar />
      <Outlet />
    </div>
  )
}

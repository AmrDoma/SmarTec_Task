import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './pages/AppLayout'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { TaskListPage } from './pages/TaskListPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import SchoolAdminDashboard from './pages/SchoolAdmin/index.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/school-admin" element={<SchoolAdminDashboard />} />
        <Route path="/" element={<SchoolAdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

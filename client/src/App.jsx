import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Structures from './pages/Structures';
import Payslips from './pages/Payslips';
import Payslip from './pages/Payslip';

function Shell() {
  const { username, logout } = useAuth();
  if (!username) return <Navigate to="/login" replace />;
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Payroll</div>
        <nav>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/structures">Salary structures</NavLink>
          <NavLink to="/payslips">Payslips</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span>{username}</span>
          <button className="link" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Shell />}>
        <Route path="/employees" element={<Employees />} />
        <Route path="/structures" element={<Structures />} />
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/payslips/:code" element={<Payslip />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Route>
    </Routes>
  );
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './Auth.jsx';

export default function AuthLayout() {
    const { usuario, cargando } = useAuth();
    const location = useLocation();

    if (cargando) return <p className="cargando" role="status">Comprobando sesión…</p>;
    return usuario ? <Outlet /> : <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />;
}

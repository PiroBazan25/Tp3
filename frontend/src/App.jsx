import { Navigate, Outlet, Route, Routes, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Inicio from './pages/Inicio.jsx';
import Acceso from './pages/Acceso.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Viajes from './pages/Viajes.jsx';

function RutaProtegida() {
    const { usuario, cargando } = useAuth();
    const location = useLocation();
    if (cargando) return <p className="cargando" role="status">Comprobando sesión…</p>;
    return usuario ? <Outlet /> : <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />;
}

export default function App() {
    return <Routes>
        <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="login" element={<Acceso key="login" />} />
            <Route path="registro" element={<Acceso key="registro" registro />} />
            <Route element={<RutaProtegida />}>
                <Route path="vehiculos" element={<Catalogo key="vehiculos" tipo="vehiculos" />} />
                <Route path="conductores" element={<Catalogo key="conductores" tipo="conductores" />} />
                <Route path="viajes" element={<Viajes />} />
            </Route>
            <Route path="*" element={<section className="estado-vacio"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></section>} />
        </Route>
    </Routes>;
}

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();
    return <>
        <a className="saltar" href="#contenido">Ir al contenido</a>
        <header className="cabecera">
            <div className="barra contenedor">
                <Link className="marca" to="/"><span className="marca-icono" aria-hidden="true">T</span> Transporte<span className="marca-sub">/ gestión</span></Link>
                <nav aria-label="Navegación principal">
                    <NavLink to="/" end>Inicio</NavLink>
                    {usuario && <>
                        <NavLink to="/vehiculos">Vehículos</NavLink>
                        <NavLink to="/conductores">Conductores</NavLink>
                        <NavLink to="/viajes">Viajes</NavLink>
                    </>}
                </nav>
                <div className="cuenta">
                    {usuario ? <><span>{usuario.nombre}</span><button className="boton boton-claro pequeno" onClick={() => { cerrarSesion(); navigate('/'); }}>Salir</button></>
                        : <Link className="boton boton-claro pequeno" to="/login">Ingresar <span aria-hidden="true">↗</span></Link>}
                </div>
            </div>
        </header>
        <main id="contenido" className="contenedor"><Outlet /></main>
        <footer className="pie contenedor"><span>Gestión de transporte</span><span>Programación IV · TP3</span></footer>
    </>;
}

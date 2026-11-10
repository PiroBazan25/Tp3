import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Inicio() {
    const { usuario } = useAuth();
    return <>
        <section className="portada">
            <div className="portada-texto">
                <p className="etiqueta">VEHÍCULOS · CONDUCTORES · VIAJES</p>
                <h1>Cada viaje,<br /><span>en su lugar.</span></h1>
                <p className="introduccion">Organizá la flota, registrá los recorridos y consultá los kilómetros de tu empresa en un mismo lugar.</p>
                <div className="acciones-portada"><Link className="boton" to={usuario ? '/viajes' : '/login'}>{usuario ? 'Ver viajes' : 'Ingresar al sistema'} <span aria-hidden="true">→</span></Link>{!usuario && <Link className="enlace" to="/registro">Crear una cuenta</Link>}</div>
            </div>
            <div className="mapa" aria-hidden="true">
                <span className="mapa-leyenda">UN RECORRIDO MÁS CLARO</span>
                <svg viewBox="0 0 420 330" fill="none">
                    <path d="M-40 95L450 210M-20 230L430 110M75-20L150 360M285-20L245 360" stroke="#d0ddd5" strokeWidth="25" />
                    <path d="M-40 95L450 210M-20 230L430 110M75-20L150 360M285-20L245 360" stroke="#f5f5eb" strokeWidth="17" />
                    <path d="M95 128L140 229L268 196L253 100L327 80" stroke="#1b6351" strokeWidth="5" strokeDasharray="9 7" strokeLinejoin="round" />
                    <circle cx="95" cy="128" r="11" fill="#1b6351" stroke="white" strokeWidth="4" />
                    <circle cx="327" cy="80" r="11" fill="#c5eb76" stroke="#1b6351" strokeWidth="4" />
                    <rect x="194" y="176" width="60" height="38" rx="8" fill="#133b35" />
                    <path d="M207 187H232V201H207ZM232 191H240L245 198V201H232Z" fill="#e9f2dc" />
                    <circle cx="214" cy="202" r="4" fill="#c5eb76" /><circle cx="238" cy="202" r="4" fill="#c5eb76" />
                </svg>
                <div className="mapa-nota"><span className="punto" />La información acompaña el recorrido.</div>
            </div>
        </section>
        <section className="modulos" aria-label="Funciones del sistema">
            {[
                ['01', 'Vehículos', 'Marca, modelo, patente y capacidad de carga de cada unidad.', '/vehiculos'],
                ['02', 'Conductores', 'Datos personales y fechas de vigencia de las licencias.', '/conductores'],
                ['03', 'Viajes', 'Historial por vehículo o conductor y kilómetros acumulados.', '/viajes'],
            ].map(([n, titulo, texto, ruta]) => <article className="modulo" key={n}>
                <span className="numero-modulo">{n}</span><h2>{titulo}</h2><p>{texto}</p>
                <Link className="enlace" to={usuario ? ruta : '/login'}>Consultar <span aria-hidden="true">↗</span></Link>
            </article>)}
        </section>
    </>;
}

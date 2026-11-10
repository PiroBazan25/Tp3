import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth.jsx';
import { api } from './api.js';

export default function Login({ registro = false }) {
    const { usuario, iniciarSesion, error: errorSesion } = useAuth();
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    if (usuario) return <Navigate to="/vehiculos" replace />;

    async function enviar(event) {
        event.preventDefault();
        const datos = Object.fromEntries(new FormData(event.currentTarget));
        if (registro && superaLimiteContrasena(datos.contrasena)) {
            setError('La contraseña no puede superar los 72 bytes.'); return;
        }
        setEnviando(true); setError('');
        try {
            const sesion = await api(`/auth/${registro ? 'registro' : 'login'}`, { metodo: 'POST', datos });
            iniciarSesion(sesion);
            navigate(location.state?.desde || '/vehiculos', { replace: true });
        } catch (e) { setError(e.message); }
        finally { setEnviando(false); }
    }

    return <section className="acceso">
        <div><p className="etiqueta">GESTIÓN DE TRANSPORTE</p><h1>{registro ? 'Creá tu cuenta.' : 'Bienvenido de nuevo.'}</h1><p className="texto-suave">{registro ? 'Registrate para administrar vehículos, conductores y viajes.' : 'Ingresá para continuar con la gestión de tu flota.'}</p></div>
        <div className="panel acceso-form">
            <h2>{registro ? 'Registro de usuario' : 'Iniciar sesión'}</h2>
            {(error || errorSesion) && <p className="aviso error" role="alert">{error || errorSesion}</p>}
            <form onSubmit={enviar}>
                {registro && <label>Nombre<input name="nombre" required maxLength={100} autoComplete="name" /></label>}
                <label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
                <label>Contraseña<input name="contrasena" type="password" required minLength={registro ? 8 : 1} maxLength={200} autoComplete={registro ? 'new-password' : 'current-password'} /></label>
                {registro && <p className="ayuda">Usá al menos 8 caracteres.</p>}
                <button className="boton ancho" disabled={enviando}>{enviando ? 'Procesando…' : registro ? 'Crear cuenta' : 'Ingresar'}</button>
            </form>
            <p className="acceso-cambio">{registro ? '¿Ya tenés cuenta?' : '¿Todavía no tenés cuenta?'} <Link to={registro ? '/login' : '/registro'}>{registro ? 'Ingresar' : 'Registrarme'}</Link></p>
        </div>
    </section>;
}

function superaLimiteContrasena(texto) {
    // bcrypt admite hasta 72 bytes; una letra acentuada puede ocupar más de uno.
    return new TextEncoder().encode(texto).length > 72;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem('transporte-token') || '');
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(Boolean(token));
    const [error, setError] = useState('');

    function cerrarSesion() {
        sessionStorage.removeItem('transporte-token');
        setToken('');
        setUsuario(null);
        setCargando(false);
    }

    function iniciarSesion(sesion) {
        sessionStorage.setItem('transporte-token', sesion.token);
        setError('');
        setUsuario(sesion.usuario);
        setToken(sesion.token);
    }

    // Al recargar, comprobar el token con el servidor antes de mostrar las páginas privadas.
    useEffect(() => {
        if (!token) { setCargando(false); return; }
        const controller = new AbortController();
        setCargando(true);
        api('/auth/yo', { token, signal: controller.signal })
            .then(setUsuario)
            .catch(e => {
                if (e.name !== 'AbortError') { cerrarSesion(); setError(e.message); }
            })
            .finally(() => { if (!controller.signal.aborted) setCargando(false); });
        return () => controller.abort();
    }, [token]);

    useEffect(() => {
        function expirar() { cerrarSesion(); setError('Tu sesión terminó. Volvé a ingresar.'); }
        window.addEventListener('sesion-vencida', expirar);
        return () => window.removeEventListener('sesion-vencida', expirar);
    }, []);

    return <AuthContext.Provider value={{ token, usuario, cargando, error, iniciarSesion, cerrarSesion }}>
        {children}
    </AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }

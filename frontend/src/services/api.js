export async function api(ruta, { metodo = 'GET', datos, token, signal } = {}) {
    if (window.location.protocol !== 'https:') {
        throw new Error('Abrí la aplicación con HTTPS para proteger tus datos.');
    }
    let respuesta;
    try {
        respuesta = await fetch(`/api${ruta}`, {
            method: metodo,
            headers: {
                ...(datos ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(datos ? { body: JSON.stringify(datos) } : {}),
            signal,
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('No se pudo conectar con el servidor. Comprobá que el backend esté iniciado.');
    }
    if (respuesta.status === 204) return null;
    const contenido = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        if (token && (respuesta.status === 401 || respuesta.status === 403)) {
            window.dispatchEvent(new Event('sesion-vencida'));
        }
        const detalle = contenido.errores?.map(e => e.mensaje).join(' ');
        throw new Error(detalle || contenido.mensaje || 'No se pudo completar la solicitud.');
    }
    return contenido;
}

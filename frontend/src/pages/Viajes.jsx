import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Formulario from '../components/Formulario.jsx';

export default function Viajes() {
    const { token } = useAuth();
    const [params, setParams] = useSearchParams();
    const vehiculoFiltro = params.get('vehiculo_id') || '';
    const conductorFiltro = params.get('conductor_id') || '';
    const [vehiculos, setVehiculos] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [resultado, setResultado] = useState({ viajes: [], total_kilometros: 0 });
    const [cargando, setCargando] = useState(true);
    const [catalogosListos, setCatalogosListos] = useState(false);
    const [error, setError] = useState('');
    const [errorCatalogos, setErrorCatalogos] = useState('');
    const [aviso, setAviso] = useState('');
    const [edicion, setEdicion] = useState(null);
    const [errorForm, setErrorForm] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([api('/vehiculos', { token, signal: controller.signal }), api('/conductores', { token, signal: controller.signal })])
            .then(([v, c]) => { setVehiculos(v); setConductores(c); setCatalogosListos(true); })
            .catch(e => { if (e.name !== 'AbortError') setErrorCatalogos(e.message); });
        return () => controller.abort();
    }, [token]);

    useEffect(() => {
        const controller = new AbortController();
        const filtros = new URLSearchParams();
        if (vehiculoFiltro) filtros.set('vehiculo_id', vehiculoFiltro);
        if (conductorFiltro) filtros.set('conductor_id', conductorFiltro);
        setCargando(true); setError('');
        api(`/viajes?${filtros}`, { token, signal: controller.signal }).then(setResultado)
            .catch(e => { if (e.name !== 'AbortError') { setError(e.message); setResultado({ viajes: [], total_kilometros: 0 }); } })
            .finally(() => { if (!controller.signal.aborted) setCargando(false); });
        return () => controller.abort();
    }, [token, vehiculoFiltro, conductorFiltro, version]);

    function cambiarFiltro(campo, valor) {
        const nuevos = new URLSearchParams(params);
        if (valor) nuevos.set(campo, valor); else nuevos.delete(campo);
        setParams(nuevos);
    }

    function abrir(fila) {
        setErrorForm(''); setAviso('');
        setEdicion(fila ? { ...fila, fecha_salida: fila.fecha_salida.replace(' ', 'T').slice(0, 16), fecha_llegada: fila.fecha_llegada.replace(' ', 'T').slice(0, 16) }
            : { vehiculo_id: vehiculoFiltro, conductor_id: conductorFiltro, observaciones: '' });
    }

    async function guardar() {
        if (edicion.fecha_llegada < edicion.fecha_salida) { setErrorForm('La llegada no puede ser anterior a la salida.'); return; }
        const conductor = conductores.find(c => c.id === Number(edicion.conductor_id));
        if (conductor && (edicion.fecha_salida.slice(0, 10) < conductor.fecha_alta_licencia || edicion.fecha_llegada.slice(0, 10) > conductor.fecha_vencimiento_licencia)) {
            setErrorForm('La licencia del conductor debe estar vigente durante todo el viaje.'); return;
        }
        setGuardando(true); setErrorForm('');
        try {
            const datos = Object.fromEntries(campos.map(c => [c.nombre, typeof edicion[c.nombre] === 'string' ? edicion[c.nombre].trim() : edicion[c.nombre]]));
            await api(`/viajes${edicion.id ? `/${edicion.id}` : ''}`, { metodo: edicion.id ? 'PUT' : 'POST', datos, token });
            setEdicion(null); setAviso('Viaje guardado correctamente.'); setVersion(v => v + 1);
        } catch (e) { setErrorForm(e.message); }
        finally { setGuardando(false); }
    }

    async function eliminar(fila) {
        if (!window.confirm(`¿Eliminar el viaje de ${fila.origen} a ${fila.destino}?`)) return;
        setEliminando(fila.id); setError(''); setAviso('');
        try {
            await api(`/viajes/${fila.id}`, { metodo: 'DELETE', token });
            if (edicion?.id === fila.id) setEdicion(null);
            setAviso('Viaje eliminado.'); setVersion(v => v + 1);
        } catch (e) { setError(e.message); }
        finally { setEliminando(null); }
    }

    const campos = [
        { nombre: 'vehiculo_id', etiqueta: 'Vehículo', tipo: 'select', opciones: vehiculos.map(v => ({ valor: v.id, texto: `${v.patente} · ${v.marca} ${v.modelo}` })) },
        { nombre: 'conductor_id', etiqueta: 'Conductor', tipo: 'select', opciones: conductores.map(c => ({ valor: c.id, texto: `${c.apellido}, ${c.nombre}` })) },
        { nombre: 'fecha_salida', etiqueta: 'Fecha y hora de salida', tipo: 'datetime-local' },
        { nombre: 'fecha_llegada', etiqueta: 'Fecha y hora de llegada', tipo: 'datetime-local' },
        { nombre: 'origen', etiqueta: 'Origen', maxLength: 120 },
        { nombre: 'destino', etiqueta: 'Destino', maxLength: 120 },
        { nombre: 'kilometros', etiqueta: 'Kilómetros recorridos', tipo: 'number', min: 0.01, max: 9999999999.99, step: '0.01' },
        { nombre: 'observaciones', etiqueta: 'Observaciones', tipo: 'textarea', opcional: true },
    ];

    return <section className="pagina">
        <div className="encabezado-pagina"><div><p className="etiqueta">REGISTRO E HISTORIAL</p><h1>Viajes</h1><p className="texto-suave">Consultá cada recorrido y los kilómetros acumulados.</p></div><button className="boton" onClick={() => abrir()} disabled={!catalogosListos || !vehiculos.length || !conductores.length}>+ Registrar viaje</button></div>
        {errorCatalogos && <p className="aviso error" role="alert">{errorCatalogos}</p>}
        {catalogosListos && (!vehiculos.length || !conductores.length) && <p className="aviso">Para registrar un viaje necesitás al menos un <Link to="/vehiculos">vehículo</Link> y un <Link to="/conductores">conductor</Link>.</p>}
        {aviso && <p className="aviso exito" role="status">{aviso}</p>}
        {error && <p className="aviso error" role="alert">{error}</p>}
        {edicion && <Formulario titulo={edicion.id ? 'Editar viaje' : 'Registrar viaje'} campos={campos} valores={edicion}
            cambiar={(campo, valor) => setEdicion(actual => ({ ...actual, [campo]: valor }))} guardar={guardar} cancelar={() => setEdicion(null)} guardando={guardando} error={errorForm} />}
        <div className="resumen-viajes"><div><span className="texto-suave">Kilómetros del historial seleccionado</span><strong>{cargando ? '—' : resultado.total_kilometros.toLocaleString('es-AR', { maximumFractionDigits: 2 })} <small>km</small></strong></div><div><span className="texto-suave">Viajes registrados</span><strong>{cargando ? '—' : resultado.viajes.length}</strong></div></div>
        <section className="panel">
            <div className="filtros"><label>Vehículo<select value={vehiculoFiltro} onChange={e => cambiarFiltro('vehiculo_id', e.target.value)}><option value="">Todos los vehículos</option>{vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente} · {v.marca} {v.modelo}</option>)}</select></label><label>Conductor<select value={conductorFiltro} onChange={e => cambiarFiltro('conductor_id', e.target.value)}><option value="">Todos los conductores</option>{conductores.map(c => <option key={c.id} value={c.id}>{c.apellido}, {c.nombre}</option>)}</select></label>{(vehiculoFiltro || conductorFiltro) && <button className="boton-texto" onClick={() => setParams({})}>Limpiar filtros</button>}</div>
            {cargando ? <p className="estado-vacio" role="status">Cargando viajes…</p> : !resultado.viajes.length
                ? <div className="estado-vacio"><h3>No hay viajes para mostrar</h3><p>{vehiculoFiltro || conductorFiltro ? 'Cambiá los filtros o registrá un recorrido.' : 'Los viajes que registres aparecerán acá.'}</p></div>
                : <div className="tabla-contenedor"><table><caption className="solo-lector">Historial de viajes</caption><thead><tr><th>Recorrido</th><th>Vehículo</th><th>Conductor</th><th>Salida / llegada</th><th>Km</th><th>Acciones</th></tr></thead><tbody>{resultado.viajes.map(v => <tr key={v.id}>
                    <td><strong>{v.origen} → {v.destino}</strong>{v.observaciones && <small className="observacion">{v.observaciones}</small>}</td><td><span className="patente">{v.patente}</span></td><td>{v.conductor_apellido}, {v.conductor_nombre}</td><td className="fechas">{formatoFecha(v.fecha_salida)}<br /><span className="texto-suave">{formatoFecha(v.fecha_llegada)}</span></td><td>{Number(v.kilometros).toLocaleString('es-AR')}</td><td><div className="acciones-fila"><button onClick={() => abrir(v)}>Editar</button><button className="peligro" disabled={eliminando === v.id} onClick={() => eliminar(v)}>{eliminando === v.id ? 'Eliminando…' : 'Eliminar'}</button></div></td>
                </tr>)}</tbody></table></div>}
        </section>
    </section>;
}

function formatoFecha(valor) { const [fecha, hora] = valor.split(' '); return `${fecha.split('-').reverse().join('/')} ${hora.slice(0, 5)}`; }

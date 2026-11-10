import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './Auth.jsx';
import { api } from './api.js';
import Formulario from './Formulario.jsx';

const configuraciones = {
    vehiculos: {
        titulo: 'Vehículos', singular: 'vehículo', descripcion: 'Las unidades de tu empresa, en un solo lugar.',
        campos: [
            { nombre: 'marca', etiqueta: 'Marca', maxLength: 80 },
            { nombre: 'modelo', etiqueta: 'Modelo', maxLength: 80 },
            { nombre: 'patente', etiqueta: 'Patente', minLength: 3, maxLength: 15, pattern: '[A-Za-z0-9 -]{3,15}' },
            { nombre: 'anio', etiqueta: 'Año', tipo: 'number', min: 1900, max: new Date().getFullYear() + 1, step: 1 },
            { nombre: 'capacidad_carga', etiqueta: 'Capacidad de carga (kg)', tipo: 'number', min: 0.01, max: 9999999999.99, step: '0.01' },
        ],
    },
    conductores: {
        titulo: 'Conductores', singular: 'conductor', descripcion: 'Datos personales y licencias de quienes hacen el recorrido.',
        campos: [
            { nombre: 'nombre', etiqueta: 'Nombre', maxLength: 80 },
            { nombre: 'apellido', etiqueta: 'Apellido', maxLength: 80 },
            { nombre: 'documento', etiqueta: 'Número de documento', minLength: 6, maxLength: 20, pattern: '[0-9]{6,20}' },
            { nombre: 'numero_licencia', etiqueta: 'Número de licencia', maxLength: 30 },
            { nombre: 'fecha_alta_licencia', etiqueta: 'Alta de licencia', tipo: 'date' },
            { nombre: 'fecha_vencimiento_licencia', etiqueta: 'Vencimiento de licencia', tipo: 'date' },
        ],
    },
};

export default function Catalogo({ tipo }) {
    const config = configuraciones[tipo];
    const { token } = useAuth();
    const [filas, setFilas] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [edicion, setEdicion] = useState(null);
    const [errorForm, setErrorForm] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        api(`/${tipo}`, { token, signal: controller.signal }).then(setFilas)
            .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
            .finally(() => { if (!controller.signal.aborted) setCargando(false); });
        return () => controller.abort();
    }, [tipo, token]);

    function abrir(fila = {}) { setErrorForm(''); setEdicion({ ...fila }); setAviso(''); }

    async function guardar() {
        if (tipo === 'conductores' && edicion.fecha_vencimiento_licencia <= edicion.fecha_alta_licencia) {
            setErrorForm('El vencimiento de la licencia debe ser posterior al alta.'); return;
        }
        setGuardando(true); setErrorForm('');
        try {
            const datos = Object.fromEntries(config.campos.map(campo => [campo.nombre,
                typeof edicion[campo.nombre] === 'string' ? edicion[campo.nombre].trim() : edicion[campo.nombre]]));
            const guardado = await api(`/${tipo}${edicion.id ? `/${edicion.id}` : ''}`, {
                metodo: edicion.id ? 'PUT' : 'POST', datos, token,
            });
            setFilas(actuales => edicion.id ? actuales.map(f => f.id === guardado.id ? guardado : f) : [...actuales, guardado]);
            setEdicion(null); setError(''); setAviso('Los datos se guardaron correctamente.');
        } catch (e) { setErrorForm(e.message); }
        finally { setGuardando(false); }
    }

    async function eliminar(fila) {
        const nombre = tipo === 'vehiculos' ? fila.patente : `${fila.nombre} ${fila.apellido}`;
        if (!window.confirm(`¿Eliminar ${nombre}? Esta acción no se puede deshacer.`)) return;
        setEliminando(fila.id); setError(''); setAviso('');
        try {
            await api(`/${tipo}/${fila.id}`, { metodo: 'DELETE', token });
            setFilas(actuales => actuales.filter(f => f.id !== fila.id));
            if (edicion?.id === fila.id) setEdicion(null);
            setAviso('Registro eliminado.');
        } catch (e) { setError(e.message); }
        finally { setEliminando(null); }
    }

    const termino = buscar.trim().toLocaleLowerCase('es');
    const visibles = filas.filter(f => (tipo === 'vehiculos'
        ? `${f.marca} ${f.modelo} ${f.patente}` : `${f.nombre} ${f.apellido} ${f.documento}`).toLocaleLowerCase('es').includes(termino));

    return <section className="pagina">
        <div className="encabezado-pagina"><div><p className="etiqueta">GESTIÓN DE FLOTA</p><h1>{config.titulo}</h1><p className="texto-suave">{config.descripcion}</p></div><button className="boton" onClick={() => abrir()}>+ Agregar {config.singular}</button></div>
        {aviso && <p className="aviso exito" role="status">{aviso}</p>}
        {error && <p className="aviso error" role="alert">{error}</p>}
        {edicion && <Formulario titulo={`${edicion.id ? 'Editar' : 'Agregar'} ${config.singular}`} campos={config.campos}
            valores={edicion} cambiar={(campo, valor) => setEdicion(actual => ({ ...actual, [campo]: valor }))}
            guardar={guardar} cancelar={() => setEdicion(null)} guardando={guardando} error={errorForm} />}
        <section className="panel">
            <div className="herramientas"><h2>Listado <span className="contador">{filas.length}</span></h2><label className="busqueda"><span className="solo-lector">Buscar {config.titulo.toLowerCase()}</span><input type="search" placeholder={tipo === 'vehiculos' ? 'Buscar patente, marca o modelo' : 'Buscar nombre o documento'} value={buscar} onChange={e => setBuscar(e.target.value)} /></label></div>
            {cargando ? <p className="estado-vacio" role="status">Cargando…</p> : !visibles.length
                ? <div className="estado-vacio"><h3>{buscar ? 'No hay coincidencias' : `Todavía no hay ${config.titulo.toLowerCase()}`}</h3><p>{buscar ? 'Probá con otra búsqueda.' : `Agregá un ${config.singular} para empezar a registrar viajes.`}</p></div>
                : <div className="tabla-contenedor"><table><caption className="solo-lector">{config.titulo} registrados</caption><thead><tr>
                    {tipo === 'vehiculos' ? <><th>Patente</th><th>Vehículo</th><th>Año</th><th>Carga (kg)</th></> : <><th>Conductor</th><th>Documento</th><th>Licencia</th><th>Alta</th><th>Vencimiento</th></>}
                    <th>Acciones</th>
                </tr></thead><tbody>{visibles.map(f => <tr key={f.id}>
                    {tipo === 'vehiculos' ? <><td><span className="patente">{f.patente}</span></td><td>{f.marca} {f.modelo}</td><td>{f.anio}</td><td>{Number(f.capacidad_carga).toLocaleString('es-AR')}</td></>
                        : <><td><strong>{f.apellido}, {f.nombre}</strong></td><td>{f.documento}</td><td>{f.numero_licencia}</td><td>{mostrarFecha(f.fecha_alta_licencia)}</td><td><span className={f.fecha_vencimiento_licencia < hoyLocal() ? 'licencia-vencida' : ''}>{mostrarFecha(f.fecha_vencimiento_licencia)}</span></td></>}
                    <td><div className="acciones-fila"><Link to={`/viajes?${tipo === 'vehiculos' ? 'vehiculo_id' : 'conductor_id'}=${f.id}`}>Historial</Link><button onClick={() => abrir(f)}>Editar</button><button className="peligro" disabled={eliminando === f.id} onClick={() => eliminar(f)}>{eliminando === f.id ? 'Eliminando…' : 'Eliminar'}</button></div></td>
                </tr>)}</tbody></table></div>}
        </section>
    </section>;
}

function mostrarFecha(fecha) { return fecha.split('-').reverse().join('/'); }
function hoyLocal() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

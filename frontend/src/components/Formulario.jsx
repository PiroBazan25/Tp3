export default function Formulario({ titulo, campos, valores, cambiar, guardar, cancelar, guardando, error }) {
    function enviar(event) { event.preventDefault(); guardar(); }
    return <section className="panel formulario-panel" aria-labelledby="titulo-formulario">
        <div className="panel-titulo"><h2 id="titulo-formulario">{titulo}</h2><button type="button" className="boton-texto" onClick={cancelar} disabled={guardando}>Cerrar</button></div>
        {error && <p className="aviso error" role="alert">{error}</p>}
        <form onSubmit={enviar}>
            <div className="campos">
                {campos.map(campo => <label key={campo.nombre} className={campo.tipo === 'textarea' ? 'campo-ancho' : ''}>
                    {campo.etiqueta}{campo.opcional && <span className="opcional"> (opcional)</span>}
                    {campo.tipo === 'select' ? <select required={!campo.opcional} value={valores[campo.nombre] ?? ''} onChange={e => cambiar(campo.nombre, e.target.value)}>
                        <option value="">Seleccionar…</option>
                        {campo.opciones.map(op => <option key={op.valor} value={op.valor}>{op.texto}</option>)}
                    </select> : campo.tipo === 'textarea'
                        ? <textarea rows="3" maxLength={1000} value={valores[campo.nombre] ?? ''} onChange={e => cambiar(campo.nombre, e.target.value)} />
                        : <input type={campo.tipo || 'text'} required={!campo.opcional}
                            value={valores[campo.nombre] ?? ''} onChange={e => cambiar(campo.nombre, e.target.value)}
                            min={campo.min} max={campo.max} step={campo.step} minLength={campo.minLength}
                            maxLength={campo.maxLength} pattern={campo.pattern} />}
                </label>)}
            </div>
            <div className="acciones-form"><button className="boton" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button><button className="boton boton-blanco" type="button" onClick={cancelar} disabled={guardando}>Cancelar</button></div>
        </form>
    </section>;
}

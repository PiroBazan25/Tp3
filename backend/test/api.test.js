import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

test('API con MySQL: autenticación, validaciones, CRUD e historiales', {
    skip: process.env.RUN_INTEGRATION !== '1' ? 'Definí RUN_INTEGRATION=1 y las variables TEST_DB_* para ejecutar contra una base temporal.' : false,
}, async t => {
    const dbName = `tp3_test_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const admin = await mysql.createConnection({
        host: process.env.TEST_DB_HOST || '127.0.0.1', port: Number(process.env.TEST_DB_PORT || 3306),
        user: process.env.TEST_DB_USER || 'root', password: process.env.TEST_DB_PASSWORD || '',
    });
    let pool, server;
    try {
        await admin.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4`);
        await admin.changeUser({ database: dbName });
        const sql = await readFile(new URL('../sql/tablas.sql', import.meta.url), 'utf8');
        for (const sentencia of sql.split(';').map(s => s.trim()).filter(Boolean)) await admin.query(sentencia);
        Object.assign(process.env, {
            DB_HOST: process.env.TEST_DB_HOST || '127.0.0.1', DB_PORT: process.env.TEST_DB_PORT || '3306',
            DB_USER: process.env.TEST_DB_USER || 'root', DB_PASSWORD: process.env.TEST_DB_PASSWORD || '',
            DB_NAME: dbName, JWT_SECRET: randomBytes(48).toString('hex'),
        });
        const { default: app } = await import('../src/app.js');
        ({ pool } = await import('../src/config/db.js'));
        server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
        const base = `http://127.0.0.1:${server.address().port}/api`;
        let token, usuarioId, vehiculoId, conductorId, viajeId;

        async function request(ruta, metodo = 'GET', datos, credencial = token) {
            const respuesta = await fetch(`${base}${ruta}`, {
                method: metodo, headers: { 'Content-Type': 'application/json', ...(credencial ? { Authorization: `Bearer ${credencial}` } : {}) },
                ...(datos === undefined ? {} : { body: JSON.stringify(datos) }),
            });
            return { estado: respuesta.status, datos: respuesta.status === 204 ? null : await respuesta.json() };
        }
        const vehiculo = { marca: 'Iveco', modelo: 'Daily', patente: 'AB123CD', anio: 2024, capacidad_carga: 3500 };
        const conductor = { nombre: 'Ana', apellido: 'Pérez', documento: '32123456', numero_licencia: 'LR-12345', fecha_alta_licencia: '2024-01-01', fecha_vencimiento_licencia: '2030-12-31' };

        await t.test('CRUD requiere autenticación', async () => {
            for (const ruta of ['/vehiculos', '/conductores', '/viajes']) assert.equal((await request(ruta)).estado, 401);
        });
        await t.test('registro válido y contraseña hasheada; JWT de 4 horas', async () => {
            const r = await request('/auth/registro', 'POST', { nombre: 'Prueba', email: 'test@example.com', contrasena: 'Prueba123!' });
            assert.equal(r.estado, 201); token = r.datos.token; usuarioId = r.datos.usuario.id;
            assert.equal(r.datos.usuario.contrasena, undefined);
            const payload = jwt.decode(token); assert.equal(payload.exp - payload.iat, 14400);
            const [[usuario]] = await admin.execute('SELECT contrasena FROM usuarios WHERE id=?', [usuarioId]);
            assert.notEqual(usuario.contrasena, 'Prueba123!'); assert.equal(await bcrypt.compare('Prueba123!', usuario.contrasena), true);
        });
        await t.test('registro inválido, duplicados y login incorrecto', async () => {
            assert.equal((await request('/auth/registro', 'POST', { nombre: '', email: 'mal', contrasena: '1' })).estado, 400);
            assert.equal((await request('/auth/registro', 'POST', { nombre: 'Otro', email: 'test@example.com', contrasena: 'Prueba123!' })).estado, 400);
            assert.equal((await request('/auth/login', 'POST', { email: 'test@example.com', contrasena: 'incorrecta' })).estado, 401);
            assert.equal((await request('/auth/login', 'POST', { email: 'test@example.com', contrasena: 'Prueba123!' })).estado, 200);
            assert.equal((await request('/auth/yo')).datos.id, usuarioId);
        });
        await t.test('validaciones en rutas de consulta, alta y modificación', async () => {
            assert.equal((await request('/vehiculos/abc')).estado, 400);
            assert.equal((await request('/vehiculos?buscar=' + 'a'.repeat(101))).estado, 400);
            assert.equal((await request('/viajes?conductor_id=abc')).estado, 400);
            assert.equal((await request('/vehiculos', 'POST', { ...vehiculo, capacidad_carga: -1 })).estado, 400);
            assert.equal((await request('/conductores', 'POST', { ...conductor, fecha_vencimiento_licencia: '2020-01-01' })).estado, 400);
            assert.equal((await request('/conductores', 'POST', { ...conductor, fecha_alta_licencia: '2024-02-30' })).estado, 400);
        });
        await t.test('alta, consulta, actualización y duplicados de vehículos y conductores', async () => {
            const v = await request('/vehiculos', 'POST', vehiculo); assert.equal(v.estado, 201); vehiculoId = v.datos.id;
            const c = await request('/conductores', 'POST', conductor); assert.equal(c.estado, 201); conductorId = c.datos.id;
            assert.equal((await request(`/vehiculos/${vehiculoId}`)).datos.patente, vehiculo.patente);
            assert.equal((await request(`/conductores/${conductorId}`)).datos.documento, conductor.documento);
            assert.equal((await request('/vehiculos', 'POST', vehiculo)).estado, 400);
            assert.equal((await request(`/vehiculos/${vehiculoId}`, 'PUT', { ...vehiculo, modelo: 'Daily 70' })).datos.modelo, 'Daily 70');
            assert.equal((await request(`/conductores/${conductorId}`, 'PUT', { ...conductor, nombre: 'Ana María' })).datos.nombre, 'Ana María');
            assert.equal((await request(`/vehiculos/${vehiculoId}`, 'PUT', { ...vehiculo, anio: 1800 })).estado, 400);
            assert.equal((await request('/vehiculos/999999')).estado, 404);
            assert.equal((await request('/conductores/999999', 'PUT', conductor)).estado, 404);
        });
        let viaje;
        await t.test('registro de viajes y validación de fechas, licencia y relaciones', async () => {
            viaje = { vehiculo_id: vehiculoId, conductor_id: conductorId, fecha_salida: '2026-10-01T08:00', fecha_llegada: '2026-10-01T12:00', origen: 'La Rioja', destino: 'Chilecito', kilometros: 200.25, observaciones: 'Viaje de prueba' };
            assert.equal((await request('/viajes', 'POST', { ...viaje, vehiculo_id: 999999 })).estado, 400);
            assert.equal((await request('/viajes', 'POST', { ...viaje, fecha_llegada: '2026-09-30T12:00' })).estado, 400);
            assert.equal((await request('/viajes', 'POST', { ...viaje, fecha_salida: '2031-01-01T08:00', fecha_llegada: '2031-01-01T12:00' })).estado, 400);
            const r = await request('/viajes', 'POST', viaje); assert.equal(r.estado, 201); viajeId = r.datos.id;
            assert.equal(r.datos.patente, vehiculo.patente);
            assert.equal((await request(`/viajes/${viajeId}`, 'PUT', { ...viaje, kilometros: 210.5 })).datos.kilometros, 210.5);
        });
        await t.test('historial filtrado, totales decimales y protección de relaciones', async () => {
            for (const filtro of [`vehiculo_id=${vehiculoId}`, `conductor_id=${conductorId}`, `vehiculo_id=${vehiculoId}&conductor_id=${conductorId}`]) {
                const r = await request(`/viajes?${filtro}`); assert.equal(r.estado, 200); assert.equal(r.datos.total_kilometros, 210.5); assert.equal(r.datos.viajes.length, 1);
            }
            assert.equal((await request('/viajes?vehiculo_id=999999')).estado, 404);
            assert.equal((await request(`/vehiculos/${vehiculoId}`, 'DELETE')).estado, 400);
            assert.equal((await request(`/conductores/${conductorId}`, 'DELETE')).estado, 400);
        });
        await t.test('token vencido, token adulterado y usuario sin acceso', async () => {
            const vencido = jwt.sign({}, process.env.JWT_SECRET, { subject: String(usuarioId), issuer: 'tp3-transporte', audience: 'tp3-frontend', expiresIn: -1 });
            assert.equal((await request('/vehiculos', 'GET', undefined, vencido)).estado, 401);
            assert.equal((await request('/vehiculos', 'GET', undefined, 'invalido')).estado, 401);
            const sinCuenta = jwt.sign({}, process.env.JWT_SECRET, { subject: '999999', issuer: 'tp3-transporte', audience: 'tp3-frontend', expiresIn: '4h' });
            assert.equal((await request('/vehiculos', 'GET', undefined, sinCuenta)).estado, 403);
        });
        await t.test('eliminación de viajes, vehículos y conductores', async () => {
            assert.equal((await request(`/viajes/${viajeId}`, 'DELETE')).estado, 204);
            assert.equal((await request(`/viajes?vehiculo_id=${vehiculoId}`)).datos.total_kilometros, 0);
            assert.equal((await request(`/vehiculos/${vehiculoId}`, 'DELETE')).estado, 204);
            assert.equal((await request(`/conductores/${conductorId}`, 'DELETE')).estado, 204);
            assert.equal((await request(`/viajes/${viajeId}`)).estado, 404);
        });
        await t.test('errores JSON y respuesta 500 sin detalles internos', async () => {
            const malformado = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
            assert.equal(malformado.status, 400);
            assert.equal((await request('/no-existe')).estado, 404);
            await admin.query('RENAME TABLE vehiculos TO vehiculos_temporal');
            try {
                const r = await request('/vehiculos'); assert.equal(r.estado, 500); assert.equal(r.datos.mensaje, 'Error interno del servidor. Intentá nuevamente.');
            } finally { await admin.query('RENAME TABLE vehiculos_temporal TO vehiculos'); }
        });
    } finally {
        if (server) await new Promise(resolve => server.close(resolve));
        if (pool) await pool.end();
        await admin.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await admin.end();
    }
});

# TP3 - Gestión de transporte

Aplicación para registrar vehículos, conductores y viajes de una empresa de transporte.
Incluye una página principal pública, registro e inicio de sesión, formularios de gestión
e historial de viajes con kilómetros acumulados por vehículo o conductor.

## Tecnologías

- Frontend: Vite, React y JavaScript. CSS puro, sin bibliotecas de estilos.
- Backend: Express, mysql2, express-validator, Passport JWT, jsonwebtoken y bcrypt.
- Base de datos: MySQL.

## Abrir en Visual Studio Code

Abrir la carpeta completa `tp3-transporte` desde **Archivo > Abrir carpeta**.
Se necesita Node.js 22.12 o posterior y MySQL 8 o posterior en ejecución.

### 1. Configurar el backend

Abrir una terminal en `backend` e instalar:

```sh
npm install
```

Copiar `.env.example` como `.env` y completar los datos de MySQL. En PowerShell:

```powershell
Copy-Item .env.example .env
```

No sobrescribir un `.env` que ya esté configurado. Para generar un secreto de JWT:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Pegar el resultado en `JWT_SECRET` del `.env`. No subir ese archivo a GitHub.
Crear la base y las tablas:

```sh
npm run db:init
npm run cert:crear
npm run dev
```

El script utiliza `DB_NAME` y ejecuta `backend/tablas.sql`. No borra tablas existentes.
El usuario de MySQL debe poder crear la base y las tablas; también se puede preparar
la base con un administrador y configurar un usuario con permisos limitados para la API.

El backend usa HTTPS en el puerto 3000. El archivo SQL también puede ejecutarse manualmente
desde una conexión a la base elegida en MySQL Workbench o DBeaver.

### 2. Iniciar el frontend

Abrir otra terminal en `frontend`:

```sh
npm install
npm run dev
```

Abrir la dirección HTTPS que muestra Vite, normalmente `https://127.0.0.1:5173`.
Vite redirige `/api` al backend en `https://127.0.0.1:3000` mediante su proxy.
Si se cambia el puerto del backend, actualizar también `frontend/vite.config.js`.

Una vez instaladas las dependencias y configurado MySQL, también se pueden iniciar
ambos servidores desde **Terminal > Ejecutar tarea > Iniciar TP3** en VS Code.

### Certificado de desarrollo

`npm run cert:crear` genera un certificado para `localhost` y `127.0.0.1`, con una
clave propia para este equipo. Los guarda en `certs`, fuera de Git. Si ya existen,
el script no los reemplaza. No instala certificados ni cambia la configuración del sistema.

El certificado es autofirmado: el navegador o REST Client pueden mostrar un aviso
de confianza. Para trabajar sin ese aviso, configurar un certificado local confiable
con ayuda del docente o del administrador del equipo. No desactivar la validación
SSL del navegador ni de REST Client. En Vite y Express se usan por defecto los
archivos `certs/localhost.pem` y `certs/localhost-key.pem`.

El backend también admite `TLS_CERT_PATH` y `TLS_KEY_PATH` para certificados propios.
El proxy de Vite verifica el certificado del backend; no usa `secure: false`.
La compilación del frontend no necesita los certificados privados.

## Uso

1. Crear una cuenta desde la página pública. No hay usuarios ni contraseñas predeterminados.
2. Agregar vehículos y conductores, incluyendo las fechas de licencia.
3. Registrar un viaje seleccionando un vehículo y un conductor.
4. Consultar el historial y usar los filtros para ver los kilómetros de cada vehículo o conductor.
5. Editar o eliminar registros desde los listados. Para conservar las relaciones, no se puede
   borrar un vehículo o conductor que tenga viajes asociados.

Las capacidades se expresan en kilogramos y los recorridos en kilómetros. Las fechas
de viaje son horas locales de la empresa, guardadas como DATETIME sin conversión de zona horaria.
Se registran viajes con fecha de salida y llegada conocidas. La licencia debe estar
vigente durante todo el recorrido. No se realiza planificación de viajes ni control de turnos.

Todos los usuarios registrados acceden a la misma información de la empresa. La consigna
no define roles ni empresas separadas.

## Estructura

```text
backend/
  index.js              Inicio del servidor HTTPS
  app.js                Configuración de Express y rutas
  db.js                 Conexión a MySQL
  auth.js               Registro, login y Passport JWT
  usuarios.js           Consultas de usuarios
  vehiculos.js          Rutas y consultas de vehículos
  conductores.js        Rutas y consultas de conductores
  viajes.js             Rutas, consultas e historial de viajes
  validaciones.js       Validaciones de datos
  errores.js            Respuestas de error
  env.js                Configuración de entorno
  tls.js                Lectura del certificado HTTPS
  crear-base.js         Creación de base y tablas
  crear-certificado.js  Certificado local de desarrollo
  tablas.sql            Definiciones y relaciones
  api.http              Pruebas manuales de la API
  test/api.test.js       Pruebas de integración
frontend/
  src/
    components/         Layout y formulario reutilizable
    context/            Estado de sesión
    pages/              Inicio, acceso, catálogos y viajes
    services/           Cliente fetch
```

El backend sigue la organización por archivos del ejemplo de la clase del 6 de noviembre:
[repositorio de las clases](https://github.com/mfpuentear/tup-programacion-IV-2026/tree/master/2026-11-06).
Se mantienen las carpetas `backend` y `frontend` que solicita la consigna del TP3.

## API

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/salud` | Público |
| POST | `/api/auth/registro` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/yo` | JWT |
| GET, POST | `/api/vehiculos` | JWT |
| GET, PUT, DELETE | `/api/vehiculos/:id` | JWT |
| GET, POST | `/api/conductores` | JWT |
| GET, PUT, DELETE | `/api/conductores/:id` | JWT |
| GET, POST | `/api/viajes` | JWT |
| GET, PUT, DELETE | `/api/viajes/:id` | JWT |

Los listados de vehículos y conductores aceptan `?buscar=texto`.
El listado de viajes acepta `?vehiculo_id=1`, `?conductor_id=1` o ambos.
Responde con `viajes` y `total_kilometros` para el historial seleccionado.

Los errores devuelven JSON con `mensaje` y, si hay errores de validación, `errores`.
Se utilizan 400 para datos inválidos o conflictos de integridad, 401 para credenciales
o tokens inválidos, 403 para una cuenta que ya no existe aunque el token sea válido,
404 para rutas o registros inexistentes y 500 para errores internos.

## Seguridad

- bcrypt guarda únicamente el hash de la contraseña. La API nunca devuelve contraseñas ni hashes.
- Passport verifica JWT con firma HS256, emisor, audiencia y vencimiento de cuatro horas.
- El token se guarda en sessionStorage y se elimina al cerrar sesión. No se persisten contraseñas.
- Las consultas utilizan parámetros y las rutas protegidas verifican la autenticación en el servidor.
- Los valores de campos sensibles no se incluyen en los errores de validación.
- `.env`, `certs`, `node_modules` y `dist` están excluidos de Git.

El frontend y el backend se sirven por HTTPS. El cliente bloquea las solicitudes si
se abre desde HTTP. Las contraseñas viajan dentro de TLS y se guardan con bcrypt;
no se registran en logs ni se devuelven en respuestas. Para un despliegue en Internet,
usar un certificado válido emitido para el dominio. No subir claves privadas al repositorio.

## Pruebas

Con la extensión REST Client de VS Code se puede abrir `backend/api.http`
y ejecutar las solicitudes en orden. Los ejemplos crean registros de prueba que
pueden borrarse usando las últimas solicitudes del archivo.

Para compilar el frontend:

```sh
cd frontend
npm run build
```

Las pruebas de integración del backend crean una base temporal con nombre único y
la eliminan al terminar. Requieren un usuario de pruebas con permiso de crear y borrar
bases. No usan la base de la aplicación. Ejemplo en PowerShell, desde `backend`:

```powershell
$env:RUN_INTEGRATION='1'
$env:TEST_DB_HOST='127.0.0.1'
$env:TEST_DB_PORT='3306'
$env:TEST_DB_USER='usuario_de_pruebas'
# Configurar TEST_DB_PASSWORD en el entorno local.
npm test
```

Sin `RUN_INTEGRATION=1`, la prueba se omite explícitamente. Las pruebas cubren registro,
hash de contraseñas, duración y rechazo de JWT, acceso protegido, validaciones, CRUD,
relaciones, filtros, kilómetros y respuestas de error.
También se verifica que la API responda con un certificado confiado explícitamente
por la prueba, que el cliente rechace un certificado no confiado y que la API no acepte HTTP.

## Entrega en GitHub

La entrega es la URL de un repositorio nuevo que incluya `backend` y `frontend`.
No se entrega solamente un ZIP. Antes de subir, revisar `git status` y confirmar que
no se incluyan credenciales, dependencias ni archivos de la base de datos.

Realizar commits descriptivos conforme se avanza y dentro del período de entrega.
Permitir al profesor acceder al repositorio según las indicaciones de la materia.

## Referencias

- [Passport JWT](https://www.passportjs.org/packages/passport-jwt/)
- [express-validator](https://express-validator.github.io/docs/)
- [mysql2](https://sidorares.github.io/node-mysql2/docs)
- [Vite](https://vite.dev/guide/)

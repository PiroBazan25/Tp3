# TP3 - Gestión de transporte

Este trabajo práctico es un sistema para registrar vehículos, conductores y viajes de una empresa. Se puede crear una cuenta, iniciar sesión y consultar cuántos kilómetros se recorrieron por vehículo o por conductor.

El frontend está hecho con React y Vite. El backend usa Express y guarda los datos en MySQL.

## Cómo levantarlo

Abrí la carpeta del proyecto en VS Code. Necesitás Node.js 22.12 o superior y MySQL 8 o superior en ejecución.

**Backend.** Desde la carpeta `backend`, instalá las dependencias con `npm ci`. Copiá `.env.example` como `.env` y completá los datos de conexión a MySQL. Para generar el valor de `JWT_SECRET`, podés usar este comando y pegar el resultado en el archivo.

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Después ejecutá estos comandos en la misma terminal.

```sh
npm run db:init
npm run cert:crear
npm run dev
```

El primer comando crea la base y las tablas que están en `backend/tablas.sql`. Usá una cuenta de MySQL con permisos para crearlas. El segundo genera los certificados locales para HTTPS.

**Frontend.** Dejá el backend andando y abrí otra terminal en `frontend`.

```sh
npm ci
npm run dev
```

Entrá a la dirección HTTPS que muestra Vite. Como el certificado de desarrollo es autofirmado, el navegador puede pedir que lo configures como confiable en tu equipo.

## Cómo probarlo

Creá una cuenta y cargá un vehículo y un conductor con licencia vigente. Después registrá un viaje con esos datos. En el historial podés filtrar por vehículo o conductor y ver el total de kilómetros de los viajes que coincidan.

Para probar las rutas por separado, abrí `backend/api.http` con REST Client en VS Code. Registrá un usuario e iniciá sesión antes de ejecutar las solicitudes que usan el token.

Las contraseñas se guardan con **bcrypt** y las rutas privadas se protegen con **Passport y JWT**. El token vence a las cuatro horas. Cada instalación usa su propio `.env` y sus propios certificados.

La estructura sigue los ejemplos de la clase del 6 de noviembre. [Repositorio de las clases](https://github.com/mfpuentear/tup-programacion-IV-2026/tree/master/2026-11-06)

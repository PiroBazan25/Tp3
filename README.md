# TP3 - Gestión de transporte

El proyecto parte de una situación común en una empresa de transporte. Hace falta saber qué vehículos están disponibles, quién puede manejarlos y qué recorridos se hicieron. La aplicación reúne esos datos y permite consultar cuántos kilómetros hizo cada vehículo o conductor.

Desde la pantalla de inicio se puede crear una cuenta o ingresar con una existente. Una vez iniciada la sesión, se pueden cargar, editar y eliminar vehículos y conductores. En cada viaje se elige un vehículo y un conductor, y se anotan el origen, el destino, las fechas, los kilómetros y cualquier observación que haga falta.

## Cómo se relacionan los datos

Para registrar un viaje, el vehículo y el conductor ya tienen que estar cargados. La licencia debe estar vigente tanto al salir como al llegar. Si un vehículo o un conductor tiene viajes asociados, el sistema avisa antes de eliminarlo y conserva el historial.

En la pantalla de viajes se puede filtrar por vehículo, por conductor o por los dos juntos. El total de kilómetros se calcula con los viajes que quedan en ese filtro. Por ejemplo, si un vehículo tiene dos viajes de 80 y 120 km, al seleccionarlo el historial muestra 200 km. Si el filtro de conductor deja solo uno de esos viajes, el total se actualiza.

## Organización del proyecto

El frontend está hecho con React, Vite y CSS. Los componentes están en `frontend/src` y usan `fetch` para comunicarse con la API de Express. En `backend` hay un archivo por recurso, junto con la conexión a MySQL y las validaciones. Para ordenar las carpetas se siguió el ejemplo de la clase del 6 de noviembre. [Repositorio de la clase](https://github.com/mfpuentear/tup-programacion-IV-2026/tree/master/2026-11-06)

MySQL guarda los usuarios, los vehículos, los conductores y los viajes. Las contraseñas se guardan como hashes de bcrypt. Al iniciar sesión, el servidor devuelve un token JWT que dura cuatro horas. Passport lo verifica antes de permitir el acceso a las rutas privadas. La comunicación entre el navegador y la API usa HTTPS.

## Para correrlo en local

Se necesita Node.js 22.12 o superior y MySQL 8 en funcionamiento. Las dependencias se instalan con `npm ci` dentro de `backend` y `frontend`. El backend usa un archivo `.env` basado en `backend/.env.example`, con los datos de MySQL y un `JWT_SECRET` propio. El archivo de ejemplo incluye un comando para generar ese secreto.

Desde `backend`, `npm run db:init` crea la base y las tablas con `tablas.sql`, y `npm run cert:crear` genera los certificados para HTTPS local. Cada parte se inicia con `npm run dev` en su carpeta. La aplicación se abre en la dirección HTTPS que muestra Vite. El navegador puede pedir que se configure el certificado local como confiable.

El archivo `backend/api.http` tiene solicitudes de ejemplo para probar el registro, el inicio de sesión y las operaciones de la API desde REST Client en VS Code.

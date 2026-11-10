import { mkdir, writeFile, access } from 'node:fs/promises';
import selfsigned from 'selfsigned';

const carpeta = new URL('../certs/', import.meta.url);
const clave = new URL('localhost-key.pem', carpeta);
const certificado = new URL('localhost.pem', carpeta);

const existe = archivo => access(archivo).then(() => true, () => false);
if (await existe(clave) || await existe(certificado)) {
    console.log('Ya hay archivos en certs. Se conservaron sin cambios.');
} else {
    const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
        keySize: 2048,
        algorithm: 'sha256',
        extensions: [
            { name: 'basicConstraints', cA: false },
            { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
            { name: 'extKeyUsage', serverAuth: true },
            { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }] },
        ],
    });
    await mkdir(carpeta, { recursive: true });
    await writeFile(clave, pems.private, { flag: 'wx', mode: 0o600 });
    await writeFile(certificado, pems.cert, { flag: 'wx' });
    console.log('Certificado de desarrollo creado en certs. No se modificó la confianza del sistema.');
    console.log('Para el navegador se necesita confiar en ese certificado local o usar uno emitido por una CA confiable.');
}

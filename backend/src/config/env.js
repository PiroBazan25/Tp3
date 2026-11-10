import 'dotenv/config';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configurá JWT_SECRET en backend/.env con al menos 32 caracteres.');
}

export const config = {
    port: Number(process.env.PORT || 3000),
    host: process.env.HOST || '127.0.0.1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET,
};

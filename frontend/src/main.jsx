import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './Auth.jsx';
import AuthLayout from './AuthLayout.jsx';
import Layout from './Layout.jsx';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Vehiculos from './Vehiculos.jsx';
import Conductores from './Conductores.jsx';
import Viajes from './Viajes.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="login" element={<Login key="login" />} />
                        <Route path="registro" element={<Login key="registro" registro />} />
                        <Route element={<AuthLayout />}>
                            <Route path="vehiculos" element={<Vehiculos />} />
                            <Route path="conductores" element={<Conductores />} />
                            <Route path="viajes" element={<Viajes />} />
                        </Route>
                        <Route path="*" element={<section className="estado-vacio"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></section>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
);

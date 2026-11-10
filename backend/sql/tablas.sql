CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehiculos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    patente VARCHAR(15) NOT NULL UNIQUE,
    anio SMALLINT UNSIGNED NOT NULL,
    capacidad_carga DECIMAL(12,2) NOT NULL,
    CONSTRAINT chk_capacidad CHECK (capacidad_carga > 0),
    CONSTRAINT chk_anio CHECK (anio >= 1900)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conductores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    numero_licencia VARCHAR(30) NOT NULL UNIQUE,
    fecha_alta_licencia DATE NOT NULL,
    fecha_vencimiento_licencia DATE NOT NULL,
    CONSTRAINT chk_fechas_licencia CHECK (fecha_vencimiento_licencia > fecha_alta_licencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS viajes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT UNSIGNED NOT NULL,
    conductor_id INT UNSIGNED NOT NULL,
    fecha_salida DATETIME NOT NULL,
    fecha_llegada DATETIME NOT NULL,
    origen VARCHAR(120) NOT NULL,
    destino VARCHAR(120) NOT NULL,
    kilometros DECIMAL(12,2) NOT NULL,
    observaciones VARCHAR(1000) NOT NULL DEFAULT '',
    CONSTRAINT fk_viaje_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_viaje_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE RESTRICT,
    CONSTRAINT chk_fechas_viaje CHECK (fecha_llegada >= fecha_salida),
    CONSTRAINT chk_kilometros CHECK (kilometros > 0),
    INDEX idx_viaje_vehiculo_fecha (vehiculo_id, fecha_salida),
    INDEX idx_viaje_conductor_fecha (conductor_id, fecha_salida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

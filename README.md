# PruebaUnow
 
# 🚀 Guía de Instalación de Proyectos

Este documento te guiará paso a paso para instalar y ejecutar los proyectos de React, Symfony y el servicio de Email en Flask.


## ⚛️ **Proyecto React**

### 1. Instalar dependencias
- npm install

### 2. Iniciar el servidor
- npm start

## 🖥️ **Proyecto Symfony**

### 1. Instalar dependencias
- composer install

### 2 .Configuración de la base de datos
- Abre el archivo .env <br>
- Configura la variable DATABASE_URL con los datos locales de tu base de datos.

   DATABASE_URL="mysql://usuario:contraseña@127.0.0.1:3306/nombre_base_de_datos"

### 3. Configuracion de las credenciales de MAILER_DSN para el envio de emails

- MAILER_DSN='smtp://tu_correo_gmail@gmail.com:tu_clave_SMTP_en_Gmail@smtp.gmail.com:587?encryption=tls&auth_mode=login'

### 4. Configuracion de la base de datos de prueba

- Abre tu .env.test 

- DATABASE_URL="mysql://root:@127.0.0.1:3306/nombre_base_de_datos"


### 5. Crea y ejecuta migraciones de la BD
- php bin/console make:migration <br>
- php bin/console doctrine:migrations:migrate


### 6. Iniciar el servidor
- php -S 127.0.0.1:8001 -t public

# Recomendaciones

- Ten en cuenta las credenciales para el servicio de correos electroniscos, que tu direccion email este hablitada para servicio SMTP.











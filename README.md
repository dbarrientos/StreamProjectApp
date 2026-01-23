# Stream Raffle App

## Requisitos Previos

- Ruby 3.2.3
- Rails 7.1
- Node.js & npm/yarn
- Un canal de Twitch y una Aplicación creada en [Twitch Console](https://dev.twitch.tv/console)

## Instrucciones de Inicio

### 1. Configuración del Backend (API)

Navega a la carpeta `api`:

```bash
cd api
```

Instala las dependencias (si no se instalaron correctamente):

```bash
bundle install
```

Configura tus credenciales:
Edita el archivo `.env` y coloca tu `TWITCH_CLIENT_ID` y `TWITCH_CLIENT_SECRET`.

Prepara la base de datos:

```bash
rails db:migrate
```

Inicia el servidor (Puerto 3000):

```bash
rails s -b 'ssl://localhost:3000?key=localhost-key.pem&cert=localhost.pem'
# O si usas HTTP (recomendado para probar rápido):
# rails s
```

_Nota: Si usas HTTP, asegúrate que en Twitch Console la URL de redirección sea http._

### 2. Configuración del Frontend (Client)

Navega a la carpeta `client`:

```bash
cd client
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo (Puerto 5173):

```bash
npm run dev
```

### 3. Uso

1. Abre `http://localhost:5173` (o la URL que te indique Vite).
2. Inicia sesión con Twitch.
3. En el Dashboard, haz clic en "Crear Sorteo".
4. Escribe el nombre del canal para conectar el chat.
5. Pide a los usuarios que escriban `!participar`.
6. ¡Gira la ruleta!

## Estructura

- `/api`: Backend Rails (Auth, DB).
- `/client`: Frontend React (UI, Lógica de Sorteo).

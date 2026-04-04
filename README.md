# Blog List Backend

API backend para la parte de blogs del bootcamp Full Stack Open.

## Descripción

Este proyecto usa Node.js, Express y MongoDB para implementar una API de blogs con autenticación JWT, administración de usuarios y pruebas.

## Dependencias principales

- express
- mongoose
- bcrypt
- jsonwebtoken
- cors
- dotenv

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las variables necesarias:

```env
PORT=3003
MONGODB_URI=<tu_mongodb_uri>
TEST_MONGODB_URI=<tu_mongodb_test_uri>
SECRET=<secreto_para_jwt>
```

## Comandos

- Instalar dependencias:
  ```bash
  npm install
  ```
- Iniciar en modo desarrollo:
  ```bash
  npm run dev
  ```
- Iniciar en producción:
  ```bash
  npm start
  ```
- Ejecutar pruebas:
  ```bash
  npm test
  ```

## Endpoints principales

- `POST /api/login` - iniciar sesión y obtener token
- `GET /api/blogs` - obtener lista de blogs
- `POST /api/blogs` - crear un nuevo blog (requiere token)
- `PUT /api/blogs/:id` - actualizar un blog
- `DELETE /api/blogs/:id` - eliminar un blog (requiere token)
- `GET /api/users` - obtener usuarios
- `POST /api/users` - crear un nuevo usuario

## Notas

- La aplicación usa el archivo `app.js` para definir rutas y conexión a MongoDB.
- El servidor se inicia desde `index.js` leyendo la configuración en `utils/config.js`.
- Si quieres ejecutar pruebas en una base de datos separada, asegúrate de configurar `TEST_MONGODB_URI`.

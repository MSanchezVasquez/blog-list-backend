const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  // 1. Buscamos al usuario por su username
  const user = await User.findOne({ username });

  // 2. Comparamos la contraseña recibida con el hash guardado
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  // 3. Creamos la información que irá dentro del token (payload)
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // 4. Firmamos el token con nuestra palabra secreta
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60 * 60 }, // El token expira en una hora (opcional)
  );

  // 5. Respondemos con el token y los datos del usuario
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;

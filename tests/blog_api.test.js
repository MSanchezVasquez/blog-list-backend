const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");

let token = null;

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
];

describe("when there is initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});

    // Creamos un usuario de prueba
    const newUser = {
      username: "testuser",
      name: "Test User",
      password: "password123",
    };
    await api.post("/api/users").send(newUser);

    // Iniciamos sesión para obtener el token
    const loginResponse = await api
      .post("/api/login")
      .send({ username: "testuser", password: "password123" });

    token = loginResponse.body.token;

    // Buscamos al usuario recién creado para asignarle los blogs iniciales
    const user = await User.findOne({ username: "testuser" });

    // 🛠️ Guardamos los blogs iniciales en la base de datos vinculados a este usuario
    for (let blog of initialBlogs) {
      let blogObject = new Blog({
        ...blog,
        user: user._id,
      });
      await blogObject.save();
    }
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, initialBlogs.length);
  });

  test("the unique identifier property of the blog posts is named id", async () => {
    const response = await api.get("/api/blogs");

    // Tomamos el primer blog de la respuesta
    const blogToCheck = response.body[0];

    assert.ok(blogToCheck.id);

    assert.strictEqual(blogToCheck._id, undefined);
  });

  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "Async/await simplifies making async calls",
      author: "Jest User",
      url: "https://jestjs.io/docs/en/asynchronous",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await Blog.find({});
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1);

    const contents = blogsAtEnd.map((b) => b.title);
    assert.ok(contents.includes("Async/await simplifies making async calls"));
  });

  test("fails with status code 401 if token is not provided", async () => {
    const newBlog = {
      title: "Blog no autorizado",
      author: "Hacker",
      url: "http://hack.com",
    };

    const result = await api.post("/api/blogs").send(newBlog).expect(401);

    assert.ok(result.body.error.includes("token missing or invalid"));
  });

  test("likes defaults to 0 if missing", async () => {
    const newBlog = {
      title: "Blog with no likes",
      author: "Unknown",
      url: "http://nolikes.com",
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.likes, 0);
  });

  test("backend responds with 400 if title is missing", async () => {
    const newBlog = {
      author: "Test Author",
      url: "http://testurl.com",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(400); // Esperamos Bad Request
  });

  test("backend responds with 400 if url is missing", async () => {
    const newBlog = {
      title: "Test Title",
      author: "Test Author",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(400); // Esperamos Bad Request
  });

  test("succeeds with status code 204 if id is valid", async () => {
    // 1. Buscamos qué hay en la DB actualmente
    const blogsAtStart = await Blog.find({});
    const blogToDelete = blogsAtStart[0];

    // 2. Ejecutamos el borrado
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    // 3. Verificamos el resultado final
    const blogsAtEnd = await Blog.find({});

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);

    // Opcional: aseguramos que el título borrado ya no existe
    const contents = blogsAtEnd.map((r) => r.title);
    assert.ok(!contents.includes(blogToDelete.title));
  });

  test("succeeds with status 200 if update is valid", async () => {
    const blogsAtStart = await Blog.find({});
    const blogToUpdate = blogsAtStart[0];

    // Le sumamos 10 likes a los que ya tenga
    const updatedData = {
      likes: blogToUpdate.likes + 10,
    };

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200);

    assert.strictEqual(result.body.likes, blogToUpdate.likes + 10);
  });
});

after(async () => {
  await mongoose.connection.close();
});

const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Tu aplicación express
const api = supertest(app);
const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "HTML is easy",
    author: "Dijkstra",
    url: "http://html-easy.com",
    likes: 10,
  },
  {
    title: "Browser can execute only JavaScript",
    author: "Brendan Eich",
    url: "http://js-only.com",
    likes: 20,
  },
];

describe("there are initially some blogs saved", () => {
  // Antes de cada test, borramos todo y guardamos los iniciales
  beforeEach(async () => {
    await Blog.deleteMany({});

    // Guardamos los blogs iniciales de forma paralela
    const blogObjects = initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
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
});

// Al finalizar todos los tests, cerramos la conexión a Mongo
after(async () => {
  await mongoose.connection.close();
});

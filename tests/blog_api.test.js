const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
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
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const contents = response.body.map((r) => r.title);

    // La longitud debe ser la inicial + 1
    assert.strictEqual(response.body.length, initialBlogs.length + 1);

    // El título debe estar en la lista
    assert.ok(contents.includes("Async/await simplifies making async calls"));
  });
});

after(async () => {
  await mongoose.connection.close();
});

const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("creation fails with proper statuscode and message if password is too short", async () => {
    const newUser = {
      username: "root",
      name: "Superuser",
      password: "12", // Muy corta
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.ok(
      result.body.error.includes("password must be at least 3 characters long"),
    );
  });

  test("creation fails with statuscode 400 if username is not unique", async () => {
    const newUser = {
      username: "unique_user",
      name: "First User",
      password: "password",
    };

    await api.post("/api/users").send(newUser); // Creamos el primero

    const result = await api
      .post("/api/users")
      .send(newUser) // Intentamos crear el mismo username
      .expect(400);

    assert.ok(result.body.error.includes("expected `username` to be unique"));
  });
});

after(async () => {
  await mongoose.connection.close();
});

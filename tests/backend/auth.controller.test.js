import User from "../../models/user.model";
import request from "supertest";
import mongoose from "mongoose";
import { app, server } from "../../index.js";
import bcryptjs from "bcryptjs";

beforeEach(async () => {
  await User.deleteMany({ username: "testuser" });
});

// SIGN UP
describe("Auth Controller", () => {
  describe("POST /signup", () => {
    it("should create a new user and return the user data without the password", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "testpassword",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          username: userData.username,
          email: userData.email,
        })
      );
      expect(response.body.password).toBeUndefined();
      expect(response.headers["set-cookie"]).toBeDefined();
      // Verify that the user is saved in the database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.password).not.toBe(userData.password);
    });

    it("should return an error if any required field is missing", async () => {
      const userData = {
        username: "testuser",
        email: "",
        password: "testpassword",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);
      expect(response.body.message).toBe("All fields are required");
    });
  });
});

//SIGN IN

describe("POST /signin", () => {
  it("should sign in a user and return a token", async () => {
    // Create a test user
    const hashedPassword = bcryptjs.hashSync("pacheca", 10);
    const testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });
    await testUser.save();

    // Make a POST request to sign in

    const response = await request(app).post("/api/auth/signin").send({
      email: "test@example.com",
      password: "pacheca",
    });

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should return an error if email is not registered", async () => {
    const response = await request(app).post("/api/auth/signin").send({
      email: "unregistered@example.com",
      password: "pacheca",
    });

    // Assert the response
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Email not registered");
  });

  it("should return an error if password is invalid", async () => {
    // Create a test user
    const hashedPassword = bcryptjs.hashSync("pacheca", 10);
    const testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });
    await testUser.save();

    // Make a POST request with an invalid password
    const response = await request(app).post("/api/auth/signin").send({
      email: "test@example.com",
      password: "invalidpassword",
    });

    // Assert the response
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid password");
  });

  it("should return an error if required fields are missing", async () => {
    // Make a POST request with missing fields
    const response = await request(app).post("/api/auth/signin").send({});

    // Assert the response
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "All fields are required");
  });

  afterAll(async () => {
    await User.deleteMany({ username: "testuser" });
    server.close();
    await mongoose.disconnect();
    mongoose.connection.close();
  });
});

const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = [
  {
    username: "admin",
    password: bcrypt.hashSync("12345678", 8),
  },
];

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Login API",
      version: "1.0.0",
      description: "Simple Authentication and Password Reset API",
    },
    servers: [
      {
        url: "http://localhost:6060",
      },
    ],
  },
  apis: ["./server.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Allows a user to log in using username and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login Successful
 *         content:
 *           application/json:
 *             example:
 *               message: Login Successful
 *       400:
 *         description: Wrong password or user not found
 *         content:
 *           application/json:
 *             example:
 *               message: Wrong Password
 */

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Wrong Password" });
  }

  res.status(200).json({ message: "Login Successful" });
});

/**
 * @swagger
 * /api/forgot:
 *   post:
 *     summary: Reset password
 *     description: Allows a user to reset their password using username
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Your password has been changed successfully
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 */

app.post("/api/forgot", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const newPasswordHash = bcrypt.hashSync(password, 8);
  user.password = newPasswordHash;

  res.status(200).json({
    message: "Your password has been changed successfully!",
  });
});

const PORT = 6060;
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}/api-docs`);
});
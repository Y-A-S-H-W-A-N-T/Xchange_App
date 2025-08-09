import bcrypt from "bcrypt";
import express from "express";
import User from "../schemas/userSchema.js";
const app = express();
const router = express.Router();

app.use(express.json());

router.post("/signup", async (req, res) => {
  console.log("POST - /signup")
  try {
    const { name, number, password } = req.body;
    console.log(req.body)
    const existingUser = await User.findOne({ number });
    if (existingUser) {
      console.log("User already exists with this number")
      return res.json({
        status: 409,
        message: "User with this number already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      number,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.log("User created:", savedUser);

    return res.json({
      status: 201,
      savedUser
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Failed to save user");
  }
});

export default router;
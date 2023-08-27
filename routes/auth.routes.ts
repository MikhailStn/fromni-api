import Router from "express";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import config from "config";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = Router();

router.post(
  "/registration",
  [
    check("email", "Некорректный адрес электронной почты").isEmail(),
    check("password", "Длина пароля должна быть от 3 до 12").isLength({ min: 3, max: 12 }),
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Введите корректный адрес электронной почты" });
      }
      const { email, password } = req.body;

      if (await User.findOne({ email })) {
        return res.status(400).json({ message: `Пользователь с почтой ${email} уже существует` });
      }

      const hashPassword = await bcrypt.hash(password, 7);
      const user = new User({ email, password: hashPassword });
      await user.save();
      const token = jwt.sign({ id: user._id }, config.get("secretKey"));
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } catch (e) {
      res.send({ message: "Ошибка сервера" });
    }
  }
);

router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: `Пользователь с почтой ${email} не найден` });
    }
    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({ message: "Неверный пароль" });
    }
    const token = jwt.sign({ id: user._id }, config.get("secretKey"));
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

router.get("/auth", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findOne({ id: req.user._id });
    console.log(user);
    let token = "";
    if (user) token = jwt.sign({ id: user.id }, config.get("secretKey"));
    if (user)
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

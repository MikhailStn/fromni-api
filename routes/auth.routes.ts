import Router from "express";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import config from "config";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authChannelMiddleware } from "../middleware/authChannel.middleware.js";

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
      const user = new User({
        email,
        password: hashPassword,
        channels: [
          {
            name: "vk",
            isActive: false,
            message: "",
            keyboard: "standart",
            quickButtons: [],
            urlButtons: [],
          },
          {
            name: "telegram",
            isActive: false,
            message: "",
            keyboard: "standart",
            quickButtons: [],
            urlButtons: [],
          },
          {
            name: "whatsapp",
            isActive: false,
            message: "",
            keyboard: "standart",
            quickButtons: [],
            urlButtons: [],
          },
          {
            name: "sms",
            isActive: false,
            message: "",
            keyboard: "standart",
            quickButtons: [],
            urlButtons: [],
          },
        ],
      });
      await user.save();
      const token = jwt.sign({ id: user._id }, config.get("secretKey"));
      return res.json({
        token,
        user,
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
    return res.json({ token, user });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

router.get("/auth", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    let token = "";
    if (user) token = jwt.sign({ _id: user.id }, config.get("secretKey"));
    if (user) res.json({ token, user });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

router.put("/add-channel", authChannelMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const { message, quickButtons, urlButtons, keyboard, key } = req.body;
    if (key == "vk") {
      if (user) {
        if (keyboard == "inline") {
          if (quickButtons.length > 10) {
            return res.status(400).json({ message: `Максимальное количество кнопок - 10` });
          }
        } else {
          if (quickButtons.length > 40) {
            return res.status(400).json({ message: `Максимальное количество кнопок - 10` });
          }
        }
        user.channels[0].message = message;
        user.channels[0].quickButtons = quickButtons;
        user.channels[0].urlButtons = urlButtons;
        user.channels[0].keyboard = keyboard;
        await user.save();
      }
    } else if (key == "telegram") {
      if (keyboard == "standart") {
        if (urlButtons.length > 0) {
          return res.status(400).json({ message: `Кнопки-ссылки недоступны для этой клавиатуры` });
        }
      }
      if (user) {
        user.channels[1].message = message;
        user.channels[1].quickButtons = quickButtons;
        user.channels[1].urlButtons = urlButtons;
        user.channels[1].keyboard = keyboard;
        await user.save();
      }
    } else if (key == "whatsapp") {
      if (user) {
        if (keyboard == "inline") {
          if (quickButtons.length > 3) {
            return res.status(400).json({ message: `Максимальное количество кнопок - 3` });
          }
          if (urlButtons.length > 1) {
            return res.status(400).json({ message: `Максимальное количество кнопок-ссылок - 1` });
          }
        } else {
          if (quickButtons.length > 10) {
            return res.status(400).json({ message: `Максимальное количество кнопок - 10` });
          }
          if (urlButtons.length > 0) {
            return res.status(400).json({ message: `Кнопки-ссылки недоступны для этой клавиатуры` });
          }
        }
        user.channels[2].message = message;
        user.channels[2].quickButtons = quickButtons;
        user.channels[2].urlButtons = urlButtons;
        user.channels[2].keyboard = keyboard;
        await user.save();
      }
    } else {
      if (user) {
        user.channels[3].message = message;
        await user.save();
      }
    }
    return res.json({ user });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

router.put("/remove-button", authChannelMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const { message, quickButtons, urlButtons, keyboard, key } = req.body;
    if (key == "vk") {
      if (user) {
        user.channels[0].message = message;
        user.channels[0].quickButtons = quickButtons;
        user.channels[0].urlButtons = urlButtons;
        user.channels[0].keyboard = keyboard;
        await user.save();
      }
    } else if (key == "telegram") {
      if (user) {
        user.channels[1].message = message;
        user.channels[1].quickButtons = quickButtons;
        user.channels[1].urlButtons = urlButtons;
        user.channels[1].keyboard = keyboard;
        await user.save();
      }
    } else if (key == "whatsapp") {
      if (user) {
        user.channels[2].message = message;
        user.channels[2].quickButtons = quickButtons;
        user.channels[2].urlButtons = urlButtons;
        user.channels[2].keyboard = keyboard;
        await user.save();
      }
    } else {
      if (user) {
        user.channels[3].message = message;
        await user.save();
      }
    }
    return res.json({ user });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

router.put("/set-channel", authChannelMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const { isActive, key } = req.body;
    if (key == "vk") {
      if (user) {
        user.channels[0].isActive = isActive;
        await user.save();
      }
    } else if (key == "telegram") {
      if (user) {
        user.channels[1].isActive = isActive;
        await user.save();
      }
    } else if (key == "whatsapp") {
      if (user) {
        user.channels[2].isActive = isActive;
        await user.save();
      }
    } else {
      if (user) {
        user.channels[3].isActive = isActive;
        await user.save();
      }
    }
    return res.json({ user });
  } catch (e) {
    res.send({ message: "Ошибка сервера" });
  }
});

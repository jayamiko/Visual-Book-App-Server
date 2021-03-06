const {user} = require("../../models");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const avatarDefault = require("../utils/avatar");

// register session
exports.register = async (req, res) => {
  const schema = Joi.object({
    fullName: Joi.string().min(4).required(),
    email: Joi.string().email().min(8).required(),
    password: Joi.string().min(7).required(),
    status: Joi.string().required(),
    gender: Joi.string().required(),
    phone: Joi.string().min(12).required(),
    city: Joi.string().required(),
    avatar: Joi.string(),
  });

  const {error} = schema.validate(req.body);

  if (error) {
    return res.status(400).send({
      error: {message: error.details[0].message},
    });
  }

  try {
    const allUser = await user.findAll();
    const nameExist = allUser.find(
      (item) => req.body.fullName === item.fullName
    );
    const emailExist = allUser.find((item) => req.body.email === item.email);

    if (nameExist) {
      return res.status(400).send({
        status: "failed",
        message: "Full Name already exist",
      });
    } else if (emailExist) {
      return res.status(400).send({
        status: "failed",
        message: "Email already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const {fullName, email, status, gender, phone, city, avatar} = req.body;

    const randomAvatar = Math.floor(Math.random() * avatarDefault.length);

    const path_avatar = process.env.DEV_PATH_AVATAR;
    const newUser = await user.create({
      fullName,
      email,
      password: hashedPassword,
      gender,
      phone,
      city,
      status,
      avatar: path_avatar + avatarDefault[randomAvatar],
    });

    const token = jwt.sign(
      {id: newUser.id, status: newUser.status},
      process.env.TOKEN_KEY,
      {expiresIn: "1d"}
    );

    res.status(200).send({
      status: "success",
      user: {
        fullName: newUser.fullName,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Internal server error",
    });
  }
};

// login section
exports.login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().min(6).required(),
    password: Joi.string().required(),
  });

  const {error} = schema.validate(req.body);

  if (error) {
    return res.status(400).send({
      error: {message: error.details[0].message},
    });
  }

  try {
    const userExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!userExist) {
      return res.status(400).send({
        status: "failed",
        message: "Email or password are incorrect",
      });
    }

    const isPassValid = await bcrypt.compare(
      req.body.password,
      userExist.password
    );
    if (!isPassValid) {
      return res.status(400).send({
        status: "failed",
        message: "Email or password are incorrect",
      });
    }

    // create jwt token, and add id, status user to token. expiresIn for expires date of token
    const token = jwt.sign(
      {id: userExist.id, status: userExist.status},
      process.env.TOKEN_KEY,
      {expiresIn: "1d"}
    );
    res.status(200).send({
      status: "success",
      user: {
        name: userExist.name,
        token,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Internal server error",
    });
  }
};

// check is authentication valid
exports.checkAuth = async (req, res) => {
  try {
    const {id} = req.user;

    const dataUser = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!dataUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    res.send({
      status: "success",
      data: {
        user: {
          id: dataUser.id,
          fullName: dataUser.fullName,
          email: dataUser.email,
          status: dataUser.status,
          gender: dataUser.gender,
          phone: dataUser.phone,
          city: dataUser.city,
          avatar: dataUser.avatar,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

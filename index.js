const express = require("express");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const { auth } = require("./middleware");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const mongodbURI = require("./constants");
const ProblemsModel = require("./models/Problems");
const UserModel = require("./models/User");
const SubmissionsModel = require("./models/Submissions");
const PORT = process.env.PORT;


app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("ERROR: " + err);
  });

app.get("/", (req, res) => {
  res.json({
    msg: "hello world",
  });
});

app.get("/problems", async (req, res) => {
  try {
    const problems = await ProblemsModel.find();
    res.json({
      problems: problems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/problem/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const problem = await ProblemsModel.findOne({ problemId: id });

    if (!problem) {
      return res.status(404).json({ error: "Problem Not Found" });
    }

    res.json({
      problem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/me", auth, async (req, res) => {
  console.log(req);
  try {
    const user = await UserModel.findOne({ userId: req.userId });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/submissions/:problemId", auth, async (req, res) => {
  try {
    const problemId = req.params.problemId;
    const submissions = await SubmissionsModel.find({
      problemId: problemId,
      userId: req.userId,
    });
    res.json({
      submissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/submission", auth, async (req, res) => {
  try {
    const { problemId, submission } = req.body;
    console.log(req.body);
    // Validate that both `submission` and `problemId` are provided
    if (!problemId || !submission) {
      return res
        .status(400)
        .json({ error: "Both submission and problemId are required" });
    }

    // Your existing submission creation logic here...
    const isCorrect = Math.random() < 0.5;
    const status = isCorrect ? "AC" : "WA";

    const newSubmission = new SubmissionsModel({
      submission: submission,
      problemId: problemId,
      userId: req.userId,
      status: status,
    });

    await newSubmission.save();

    return res.json({
      status: status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const existingEmail = await UserModel.findOne({
      email: req.body.email,
    });

    if (existingEmail) {
      return res.status(409).json({ msg: "Email already exists!" });
    }

    const newUser = new UserModel({
      email: req.body.email,
      password: req.body.password,
      // Assuming UserModel has a property called userId and you want to set it during signup
      userId: generateUserId(), // You need to implement a function to generate a unique userId
    });

    await newUser.save();

    console.log("User created!");
    console.log(newUser.toJSON());
    return res.status(201).json({
      msg: "Success",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

// Add this function to generate a unique userId
function generateUserId() {
  // Implement your logic to generate a unique userId, e.g., using a library like uuid
  // For simplicity, you can use a timestamp or any other method to make it unique
  return Date.now().toString();
}

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(403).json({ msg: "User not found" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(403).json({ msg: "Incorrect password" });
    }
    console.log(user.userId);
    const token = jwt.sign(
      {
        id: user.userId, // Assuming your UserModel has a property called userId
      },
      "secret"
    );

    console.log("User logged in!");
    console.log(email);
    res.status(200).json({
      message: "Logged in successfully!",
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

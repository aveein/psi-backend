const express = require("express");
const db = require("./db");
const BlackListController = require("./controllers/BlackListController");
const app = express();
const cors = require("cors");
const User = require("./models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log(req.body);
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });
const uploadMiddleware = upload.fields([{ name: 'employee_photo', maxCount: 1 }, { name: 'card_photo', maxCount: 1 }])

const port = 3001;
db.authenticate();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  const users = await User.findAll();

  res.json(users);
});

app.get("/api/blacklist", BlackListController.getBlackList);

app.post("/api/blacklist", uploadMiddleware, BlackListController.addToBlackList);

app.delete("/api/blacklist/:id", BlackListController.deleteBlackList);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

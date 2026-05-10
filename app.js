require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cookieParser = require("cookie-parser");

const db = require("./db");
require("./models");

const AuthController = require("./controllers/AuthController");
const EmployeeController = require("./controllers/EmployeeController");
const RecordController = require("./controllers/RecordController");
const TransferController = require("./controllers/TransferController");
const AdminController = require("./controllers/AdminController");

const authMiddleware = require("./middleware/authMiddleware");
const { requireRole } = authMiddleware;

const app = express();
const port = 3001;

// uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });
const photoUpload = upload.fields([{ name: "photo", maxCount: 1 }]);

// middleware
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    // origin: (origin, cb) => {
    //   if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    //   else cb(new Error("Not allowed by CORS"));
    // },
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

db.authenticate();

// PUBLIC
app.get("/", (req, res) => res.send("Pioneer Service API"));
app.get("/api/public/search", EmployeeController.publicSearch);
app.get("/api/public/stats", AdminController.stats);

// AUTH
app.post("/api/login", AuthController.login);
app.post("/api/logout", authMiddleware, AuthController.logout);
app.get("/api/me", authMiddleware, AuthController.me);

// EMPLOYEES
app.get("/api/employees", authMiddleware, EmployeeController.list);
app.get("/api/employees/:id", authMiddleware, EmployeeController.detail);
app.post("/api/employees", authMiddleware, photoUpload, EmployeeController.create);
app.put("/api/employees/:id", authMiddleware, photoUpload, EmployeeController.update);
app.delete(
  "/api/employees/:id",
  authMiddleware,
  requireRole("admin"),
  EmployeeController.remove
);

// RECORDS
app.get(
  "/api/records/pending",
  authMiddleware,
  requireRole("admin"),
  RecordController.listPending
);
app.post(
  "/api/records/:id/approve",
  authMiddleware,
  requireRole("admin"),
  RecordController.approve
);
app.post(
  "/api/records/:id/reject",
  authMiddleware,
  requireRole("admin"),
  RecordController.reject
);
app.post(
  "/api/records/approve-all",
  authMiddleware,
  requireRole("admin"),
  RecordController.approveAll
);

// TRANSFERS
app.get("/api/transfers", authMiddleware, TransferController.list);
app.post("/api/transfers", authMiddleware, TransferController.create);
app.post(
  "/api/transfers/:id/approve",
  authMiddleware,
  requireRole("admin"),
  TransferController.approve
);
app.post(
  "/api/transfers/:id/reject",
  authMiddleware,
  requireRole("admin"),
  TransferController.reject
);

// USERS (admin only)
app.get("/api/users", authMiddleware, requireRole("admin"), AdminController.listUsers);
app.post("/api/users", authMiddleware, requireRole("admin"), AdminController.createUser);
app.put("/api/users/:id", authMiddleware, requireRole("admin"), AdminController.updateUser);
app.delete("/api/users/:id", authMiddleware, requireRole("admin"), AdminController.deleteUser);

// SITES
app.get("/api/sites", authMiddleware, AdminController.listSites);
app.post("/api/sites", authMiddleware, requireRole("admin"), AdminController.createSite);
app.put("/api/sites/:id", authMiddleware, requireRole("admin"), AdminController.updateSite);
app.delete("/api/sites/:id", authMiddleware, requireRole("admin"), AdminController.deleteSite);

// FIELDS
app.get("/api/fields", authMiddleware, AdminController.listFields);
app.post("/api/fields", authMiddleware, requireRole("admin"), AdminController.createField);
app.put("/api/fields/:id", authMiddleware, requireRole("admin"), AdminController.updateField);
app.delete("/api/fields/:id", authMiddleware, requireRole("admin"), AdminController.deleteField);

// PERMISSIONS
app.get("/api/permissions", authMiddleware, AdminController.listPermissions);
app.put(
  "/api/permissions/:role",
  authMiddleware,
  requireRole("admin"),
  AdminController.updatePermission
);

// LOGS
app.get("/api/logs", authMiddleware, requireRole("admin"), AdminController.listLogs);
app.delete("/api/logs", authMiddleware, requireRole("admin"), AdminController.clearLogs);

// RECYCLE
app.get("/api/recycle", authMiddleware, requireRole("admin"), AdminController.listRecycle);
app.post(
  "/api/recycle/:id/restore",
  authMiddleware,
  requireRole("admin"),
  AdminController.restoreRecycle
);
app.delete(
  "/api/recycle/:id",
  authMiddleware,
  requireRole("admin"),
  AdminController.permaDelete
);
app.delete("/api/recycle", authMiddleware, requireRole("admin"), AdminController.emptyRecycle);

// STATS
app.get("/api/stats", authMiddleware, AdminController.stats);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

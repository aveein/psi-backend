require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const {
  User,
  Employee,
  EmploymentRecord,
  TransferRequest,
  Site,
  CustomField,
  AuditLog,
  RecycleBin,
  Permission,
} = require("./models");

const DEFAULT_PERMS = {
  admin: {
    view: true,
    add: true,
    edit: true,
    delete: true,
    approve: true,
    users: true,
    fields: true,
    sites: true,
    logs: true,
    recycle: true,
    analytics: true,
    export: true,
  },
  editor: {
    view: true,
    add: true,
    edit: true,
    delete: false,
    approve: false,
    users: false,
    fields: false,
    sites: false,
    logs: false,
    recycle: false,
    analytics: false,
    export: false,
  },
  site: {
    view: true,
    add: true,
    edit: true,
    delete: false,
    approve: false,
    users: false,
    fields: false,
    sites: false,
    logs: false,
    recycle: false,
    analytics: false,
    export: false,
  },
};

const SITES = [
  "ROKU KYOTO LXR HOTELS",
  "HILTON OSAKA",
  "SHERATON TOKYO",
  "MARRIOTT KYOTO",
  "HYATT REGENCY FUKUOKA",
  "ANA INTERCONTINENTAL TOKYO",
];

const FIELDS = [
  { label: "Department", type: "text", required: false, enabled: true },
  {
    label: "Contract Type",
    type: "select",
    options: "Full-time,Part-time,Contract,Dispatch",
    required: false,
    enabled: true,
  },
];

(async () => {
  try {
    await db.authenticate();
    await db.sequelize.sync({ force: true });

    const hash = (pw) => bcrypt.hashSync(pw, 10);

    await User.bulkCreate([
      { username: "admin", password: hash("pioneer2025"), role: "admin", site: null },
      { username: "editor", password: hash("editor2025"), role: "editor", site: null },
      {
        username: "site1",
        password: hash("site2025"),
        role: "site",
        site: "ROKU KYOTO LXR HOTELS",
      },
    ]);

    await Site.bulkCreate(SITES.map((name) => ({ name })));
    await CustomField.bulkCreate(FIELDS);

    await Permission.bulkCreate(
      Object.entries(DEFAULT_PERMS).map(([role, perms]) => ({ role, perms }))
    );

    const emp = await Employee.create({
      zairo: "UH86456494LF",
      name: "Suraj Bhatt",
      kana: "スラジ バット",
      dob: "1990-05-15",
      gender: "Male",
      nationality: "Nepali",
      visa: "技能実習 (Ginou Jisshu)",
      photo: null,
      custom: {},
      createdBy: "admin",
    });

    await EmploymentRecord.create({
      empId: emp.id,
      site: "ROKU KYOTO LXR HOTELS",
      joining: "2026-04-09",
      leaving: "2026-04-11",
      status: "resigned",
      reason: "Personal reasons, returning home.",
      approved: true,
      approvedBy: "admin",
      approvedAt: new Date(),
      requestedBy: "admin",
    });

    await AuditLog.create({
      action: "seed",
      detail: "Database seeded with demo data",
      user: "system",
    });

    console.log("✅ Migration complete. Demo users:");
    console.log("   admin / pioneer2025");
    console.log("   editor / editor2025");
    console.log("   site1 / site2025");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();

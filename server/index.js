console.log("Loading index.js...");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const ApplicationSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  refNo: { type: String, unique: true },
  epicNo: { type: String, unique: true, sparse: true },
  submittedAt: Date,
  status: { type: String, default: "Submitted" },
  isDuplicate: { type: Boolean, default: false },
  rejectionReason: { type: String, default: null },
  formData: Object,
  documents: {
    photo: { data: Buffer, contentType: String },
    dobProof: { data: Buffer, contentType: String },
    addressProof: { data: Buffer, contentType: String },
    disabilityCert: { data: Buffer, contentType: String },
  },
});

const Application = mongoose.model("Application", ApplicationSchema);

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model("Admin", AdminSchema);

const upload = multer({ storage: multer.memoryStorage() });

const generateEpicNumber = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let alpha = "";
  for (let i = 0; i < 3; i++)
    alpha += letters[Math.floor(Math.random() * letters.length)];
  let num = "";
  for (let i = 0; i < 7; i++) num += Math.floor(Math.random() * 10);
  return alpha + num;
};

const generateRefNumber = () =>
  "S" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);


const axios = require("axios");

app.get("/api/states", async (req, res) => {
  try {
    const r = await axios.get(`${process.env.ECI_API_BASE}/states`);
    res.json(r.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "States not found" });
    }
    console.error("Error fetching states:", error.message);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

app.get("/api/districts/:stateCd", async (req, res) => {
  try {
    const r = await axios.get(
      `${process.env.ECI_API_BASE}/districts/${req.params.stateCd}`
    );
    res.json(r.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json([]);
    }
    console.error("Error fetching districts:", error.message);
    res.status(500).json([]);
  }
});

app.get("/api/acs/:districtCd", async (req, res) => {
  try {
    const r = await axios.get(
      `${process.env.ECI_API_BASE}/acs/${req.params.districtCd}`
    );
    res.json(r.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json([]);
    }
    console.error("Error fetching acs:", error.message);
    res.status(500).json([]);
  }
});

app.post("/api/admin", async (req, res) => {
  try {
    await new Admin(req.body).save();
    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }
    const admin = await Admin.findOne({ username, password });
    if (admin) return res.json({ success: true, token: "admin-token" });
    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { query, type } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Query required" });

    let appx;
    const searchRegex = { $regex: new RegExp(`^${query}$`, "i") };

    if (type === "epic") {
      appx = await Application.findOne({ epicNo: searchRegex });
    } else if (type === "ref") {
      appx = await Application.findOne({ refNo: searchRegex });
    } else {
      appx = await Application.findOne({
        $or: [{ refNo: searchRegex }, { epicNo: searchRegex }],
      });
    }

    if (appx) {
      const appData = appx.toObject();
      appData.hasPhoto = !!appData.documents?.photo;
      appData.hasDobProof = !!appData.documents?.dobProof;
      appData.hasAddressProof = !!appData.documents?.addressProof;
      appData.hasDisabilityCert = !!appData.documents?.disabilityCert;
      delete appData.documents;
      return res.json({ success: true, data: appData });
    }
    res.json({ success: false, message: "Not Found" });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

const cpUpload = upload.fields([
  { name: "photo" },
  { name: "dobProof" },
  { name: "addressProof" },
  { name: "disabilityCert" },
]);

app.post("/api/register", cpUpload, async (req, res) => {
  try {
    const id = Date.now().toString();
    const refNo = generateRefNumber();
    const documents = {};

    ["photo", "dobProof", "addressProof", "disabilityCert"].forEach((f) => {
      if (req.files?.[f]) {
        documents[f] = {
          data: req.files[f][0].buffer,
          contentType: req.files[f][0].mimetype,
        };
      }
    });

    const { firstName, surname, dob, gender, district, ac } = req.body;
    const candidates = await Application.find({
      "formData.dob": dob,
      "formData.gender": gender,
      "formData.district": district,
      "formData.ac": ac,
    });

    const normalize = (s) => String(s || "").toLowerCase().replace(/\s+/g, "");
    const nNewFirst = normalize(firstName);
    const nNewSurname = normalize(surname);

    const existing = candidates.find(c => {
      const nExFirst = normalize(c.formData.firstName);
      const nExSurname = normalize(c.formData.surname);
      const firstMatch = nNewFirst.includes(nExFirst) || nExFirst.includes(nNewFirst);
      const surnameMatch = nNewSurname.includes(nExSurname) || nExSurname.includes(nNewSurname);
      return firstMatch && surnameMatch && nNewFirst.length > 0;
    });

    const isDuplicate = !!existing;
    if (isDuplicate) {
      console.log(`Fuzzy duplicate detected for: ${firstName} ${surname} (Matched Ref: ${existing.refNo})`);
    }

    const app = new Application({
      id,
      refNo,
      submittedAt: new Date(),
      status: "Submitted",
      isDuplicate,
      formData: req.body,
      documents,
    });

    console.log(`Saving application ${refNo}. Duplicate: ${isDuplicate}. Files: ${Object.keys(documents).join(", ")}`);
    await app.save();

    res.json({ success: true, refNo });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.get("/api/applications", async (req, res) => {
  try {
    const { state, district, ac } = req.query;
    console.log("Filtering params:", { state, district, ac });

    const query = {};
    if (state) query["formData.state"] = { $regex: new RegExp(`^${state}$`, "i") };
    if (district) query["formData.district"] = { $regex: new RegExp(`^${district}$`, "i") };
    if (ac) query["formData.ac"] = { $regex: new RegExp(`^${ac}$`, "i") };

    const appsRaw = await Application.find(query).sort({ submittedAt: -1 }).lean();

    const finalApps = appsRaw.map((app) => {
      const { documents, ...rest } = app;
      return {
        ...rest,
        hasPhoto: !!documents?.photo,
        hasDobProof: !!documents?.dobProof,
        hasAddressProof: !!documents?.addressProof,
        hasDisabilityCert: !!documents?.disabilityCert,
      };
    });

    console.log(`Found ${finalApps.length} applications matching filters`);
    res.json(finalApps);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
});

app.put("/api/applications/:id/status", async (req, res) => {
  try {
    const appx = await Application.findOne({ id: req.params.id });
    if (!appx) return res.status(404).json({ success: false });

    appx.status = req.body.status;
    appx.rejectionReason = req.body.rejectionReason || null;

    if (req.body.status === "Accepted" && !appx.epicNo) {
      let epic;
      do {
        epic = generateEpicNumber();
      } while (await Application.findOne({ epicNo: epic }));
      appx.epicNo = epic;
    }

    await appx.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

app.delete("/api/applications/:id", async (req, res) => {
  try {
    await Application.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ success: false, message: "Failed to delete application" });
  }
});

app.get("/api/track/:refNo", async (req, res) => {
  try {
    const appx = await Application.findOne({ refNo: req.params.refNo });
    if (!appx) return res.json({ success: false });

    res.json({
      success: true,
      status: appx.status,
      epicNo: appx.epicNo,
      rejectionReason: appx.rejectionReason,
      hasPhoto: !!appx.documents?.photo,
      hasDobProof: !!appx.documents?.dobProof,
      hasAddressProof: !!appx.documents?.addressProof,
      hasDisabilityCert: !!appx.documents?.disabilityCert
    });
  } catch (error) {
    console.error("Error tracking application:", error);
    res.status(500).json({ success: false, message: "Failed to track application" });
  }
});

const serveFile = async (req, res, docType) => {
  try {
    const appx = await Application.findOne({ id: req.params.id });
    if (!appx || !appx.documents || !appx.documents[docType]) {
      return res.status(404).send("File not found");
    }
    const doc = appx.documents[docType];
    res.set("Content-Type", doc.contentType);
    res.send(doc.data);
  } catch (error) {
    console.error(`Error serving ${docType}:`, error);
    res.status(500).send("Error serving file");
  }
};

app.get("/api/applications/:id/photo", (req, res) => serveFile(req, res, "photo"));
app.get("/api/applications/:id/dobProof", (req, res) => serveFile(req, res, "dobProof"));
app.get("/api/applications/:id/addressProof", (req, res) => serveFile(req, res, "addressProof"));
app.get("/api/applications/:id/disabilityCert", (req, res) => serveFile(req, res, "disabilityCert"));

module.exports = app;

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

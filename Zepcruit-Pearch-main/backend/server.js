import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB CONNECTION ================= */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const promiseDb = db.promise();

/* ================= SEARCH (WITH CACHE) ================= */
app.post("/search", async (req, res) => {
  try {
    const { query, limit } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 1️⃣ Check cache
    const [rows] = await promiseDb.execute(
      "SELECT * FROM jobs_cache WHERE query = ? LIMIT 1",
      [query]
    );

    if (rows.length > 0) {
      console.log("⚡ Serving from DB cache");
      return res.json(JSON.parse(rows[0].data));
    }

    // 2️⃣ Call Pearch API
    const response = await axios.post(
  "https://api.pearch.ai/v2/search",
  {
    query,
    type: "pro",

    insights: true,
    profile_scoring: true,

    reveal_emails: true,
    reveal_phones: true,

    filter_out_no_emails: false,
    filter_out_no_phones: false,

    limit: limit || 10,
    offset: 0
  },
      {
        headers: {
          Authorization: `Bearer ${process.env.PEARCH_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 3️⃣ Store in DB
    await promiseDb.execute(
      "INSERT INTO jobs_cache (query, data) VALUES (?, ?)",
      [query, JSON.stringify(response.data)]
    );

    console.log("💾 Stored in DB");

    res.json(response.data);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ================= SAVE JOB ================= */
app.post("/save-job", async (req, res) => {
  try {
    const { job_id, title, company, location, user_id } = req.body;

    if (!job_id || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await promiseDb.execute(
      `INSERT INTO saved_jobs (job_id, title, company, location, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [job_id, title, company, location, user_id]
    );

    res.json({ success: true });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({ message: "Job already saved" });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET SAVED JOBS ================= */
app.get("/saved-jobs/:user_id", async (req, res) => {
  try {
    const [rows] = await promiseDb.execute(
      "SELECT * FROM saved_jobs WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.user_id]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE SAVED JOB ================= */
app.delete("/delete-job/:id", async (req, res) => {
  try {
    await promiseDb.execute(
      "DELETE FROM saved_jobs WHERE id = ?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body); // 👈 ADD THIS (debug)

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const [existing] = await promiseDb.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await promiseDb.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("REGISTER ERROR:", err); 
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await promiseDb.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= BASIC HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("Zepcruit API running 🚀");
});

app.delete("/delete-job/:job_id/:user_id", async (req, res) => {
  try {
    const { job_id, user_id } = req.params;

    await promiseDb.execute(
      "DELETE FROM saved_jobs WHERE job_id = ? AND user_id = ?",
      [job_id, user_id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UNLOCK CONTACT ================= */

app.post("/unlock-contact", async (req,res)=>{

try{

const {docid}=req.body;

const response=await axios.get(
`https://chat.pearch.ai/api-server-prod/v1/profile?docid=${docid}&reveal_emails=true`,
{
headers:{
Authorization:`Bearer ${process.env.PEARCH_API_KEY}`
}
}
);


console.log(
  JSON.stringify(response.data, null, 2)
);

const profile =
  response.data.profile ||
  response.data;

res.json({

  personal_email:
    profile?.personal_emails?.[0] ||
    null,

  email:
    profile?.best_personal_email ||
    profile?.personal_emails?.[0] ||
    profile?.best_business_email ||
    profile?.business_emails?.[0] ||
    null,

  phone_numbers:
    profile?.phone_numbers || []

});

}catch(err){

console.log(
err.response?.data || err.message
);

res.status(500).json({
error:err.message
});

}

});

app.use(express.static(path.join(__dirname, '../dist')));

// Fallback: serve index.html for all non-API routes
// This fixes the 404 on reload for client-side routes
app.get('*', (req, res) => {
  // Don't catch API routes
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/search') ||
      req.path.startsWith('/save-job') ||
      req.path.startsWith('/saved-jobs') ||
      req.path.startsWith('/delete-job') ||
      req.path.startsWith('/register') ||
      req.path.startsWith('/login') ||
      req.path.startsWith('/unlock-contact')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Serve index.html for all other routes (React Router will handle them)
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
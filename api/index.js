import express from "express";
import cors from "cors";
import clientPromise from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- ROOT ---
app.get("/", (req, res) => {
  res.send("LoanLink Server is running");
});

// --- GET LOANS ---
app.get("/loans", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("loanlink");
    const loans = await db.collection("loans").find().toArray();
    res.json(loans);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database service unavailable.", error: err.message });
  }
});

// --- ADD / UPDATE USER ---
app.post("/user", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("loanlink");
    const usersCollection = db.collection("users");

    const userData = req.body;
    userData.created_at = new Date().toISOString();
    userData.last_loggedIn = new Date().toISOString();
    userData.role = "customer";

    const query = { email: userData.email };
    const existing = await usersCollection.findOne(query);

    if (existing) {
      const result = await usersCollection.updateOne(query, {
        $set: { last_loggedIn: new Date().toISOString() },
      });
      return res.json(result);
    }

    const result = await usersCollection.insertOne(userData);
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database service unavailable.", error: err.message });
  }
});

// --- APPLY LOAN ---
app.post("/apply-loan", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("loanlink");
    const loanApplicationsCollection = db.collection("loanApplications");

    const loanData = req.body;
    loanData.application_date = new Date().toISOString();
    loanData.status = "pending";
    loanData.applicationFeeStatus = "unpaid";

    const result = await loanApplicationsCollection.insertOne(loanData);
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database service unavailable.", error: err.message });
  }
});

// --- MY LOANS BY EMAIL ---
app.get("/my-loans/:email", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("loanlink");
    const loanApplicationsCollection = db.collection("loanApplications");

    const email = req.params.email;
    const loans = await loanApplicationsCollection
      .find({ userEmail: email })
      .toArray();
    res.json(loans);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database service unavailable.", error: err.message });
  }
});

// --- PENDING LOANS ---
app.get("/pending-loans", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("loanlink");
    const loanApplicationsCollection = db.collection("loanApplications");

    const pending = await loanApplicationsCollection
      .find({ status: "pending" })
      .toArray();
    res.json(pending);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database service unavailable.", error: err.message });
  }
});

export default app;

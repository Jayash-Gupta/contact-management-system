const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const csv = require("csv-parser");
const fs = require("fs");
const { Readable } = require("stream");
const Contact = require("./models/Contact");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// import contacts
app.post("/api/contacts/import", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file.buffer.toString("utf-8");
    const contactsArray = await parseCSV(buffer);

    // Save contacts to the database
    await Contact.insertMany(contactsArray);

    res.json({ message: "Contacts imported successfully" });
  } catch (error) {
    console.error("Error importing contacts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function parseCSV(data) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from([data]);

    stream
      .pipe(csv())
      .on("data", (row) => {
        const { first_name, last_name, email, phone1 } = row;
        const fullName = `${first_name} ${last_name}`;
        const phoneNumber = phone1;
        results.push({ name: fullName, email, phoneNumber });
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

//get contacts

app.get("/api/contacts", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Pagination logic using Mongoose
    const totalContacts = await Contact.countDocuments();
    const totalPages = Math.ceil(totalContacts / limitNumber);

    const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages));

    const contacts = await Contact.find()
      .skip((validPageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      totalContacts,
      totalPages,
      currentPage: validPageNumber,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

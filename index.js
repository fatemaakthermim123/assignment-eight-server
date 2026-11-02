

import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb"; 

const app = express();
const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); 
  }
}

app.use(cors());
app.use(express.json());

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("assignment-eight");
const userCollection = db.collection("all-books");
const myBooksCollection = db.collection("my-Books");


app.get("/", (req, res) => {
  res.send("hello");
});






app.get("/all-books", async (req, res) => {
  try {
    const result = await userCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("find failed:", err);
    res.status(500).send({ error: err.message });
  }
});

app.post('/all-books', async (req, res) => {
  try {
    const newBook = req.body;

    const result = await userCollection.insertOne(newBook);
    await myBooksCollection.insertOne(newBook);

    res.send({ success: true, message: "successfully added", result });
  } catch (err) {
    console.error("insert failed:", err);
    res.status(500).send({ error: err.message });
  }
});


app.get("/all-books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid id" });
    }

    const result = await userCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send({ error: "Book not found" });
    }

    res.send(result);
  } catch (err) {
    console.error("findOne failed:", err);
    res.status(500).send({ error: err.message });
  }
});

app.get('/my-books/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await myBooksCollection
      .find({ addedByEmail: email })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("my-books find failed:", err);
    res.status(500).send({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`my port is running successfully ${PORT}`);
});





export default app;
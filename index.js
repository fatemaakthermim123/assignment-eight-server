

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
const borrowsCollection = db.collection("borrows");


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


app.get("/latest-books", async (req, res) => {
  try {
    const result = await userCollection
      .find()
      .sort({ _id: -1 })
      .limit(8)
      .toArray();

    res.send(result);
  } catch (err) {
    console.error("latest books fetch failed:", err);
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
// বই এডিট
app.patch('/all-books/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const result = await userCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data },
  );
  await myBooksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data },
  );

  res.json(result);
});

// বই ডিলিট (ওই বইয়ের borrow রেকর্ডও মুছে যায়)
app.delete('/all-books/:id', async (req, res) => {
  const { id } = req.params;

  const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
  await myBooksCollection.deleteOne({ _id: new ObjectId(id) });
  await borrowsCollection.deleteMany({ bookId: id });

  res.json(result);
});

// Borrow
app.post('/borrows', async (req, res) => {
  const { bookId, bookTitle, bookImage, userEmail } = req.body;

  // একই ইউজার একই বই দুইবার নিতে পারবে না
  const already = await borrowsCollection.findOne({ bookId, userEmail });
  if (already) {
    return res.status(400).send({ error: "You have already borrowed this book" });
  }

  // কপি ১ বা বেশি থাকলে তবেই ১ কমবে
  const updated = await userCollection.updateOne(
    { _id: new ObjectId(bookId), availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
  );
  if (updated.modifiedCount === 0) {
    return res.status(400).send({ error: "No copies available" });
  }

  await myBooksCollection.updateOne(
    { _id: new ObjectId(bookId) },
    { $inc: { availableCopies: -1 } },
  );

  const borrowDate = new Date();
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 7);

  const result = await borrowsCollection.insertOne({
    bookId,
    bookTitle,
    bookImage,
    userEmail,
    borrowDate,
    returnDate,
  });

  res.send({ success: true, result });
});

// ইউজারের সব borrow
app.get('/borrows/:email', async (req, res) => {
  const result = await borrowsCollection
    .find({ userEmail: req.params.email })
    .toArray();
  res.send(result);
});

// Return: রেকর্ড মুছে যায়, কপি ১ বাড়ে
app.delete('/borrows/:id', async (req, res) => {
  const { id } = req.params;

  const borrow = await borrowsCollection.findOne({ _id: new ObjectId(id) });
  if (!borrow) {
    return res.status(404).send({ error: "Borrow record not found" });
  }

  await borrowsCollection.deleteOne({ _id: new ObjectId(id) });

  await userCollection.updateOne(
    { _id: new ObjectId(borrow.bookId) },
    { $inc: { availableCopies: 1 } },
  );
  await myBooksCollection.updateOne(
    { _id: new ObjectId(borrow.bookId) },
    { $inc: { availableCopies: 1 } },
  );

  res.send({ success: true });
});

app.listen(PORT, () => {
  console.log(`my port is running successfully ${PORT}`);
});





export default app;
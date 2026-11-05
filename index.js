

// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import { MongoClient } from "mongodb";
// import { ObjectId } from "mongodb"; 
// import { createRemoteJWKSet, jwtVerify } from "jose";

// const app = express();
// const PORT = process.env.PORT || 5000;

// const client = new MongoClient(process.env.MONGODB_URI);

// async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;
//   } catch (err) {
//     console.error("MongoDB connection failed:", err.message);
//     process.exit(1); 
//   }
// }

// app.use(cors());
// app.use(express.json());

// const mongoClient = await connectToMongoDB();
// const db = mongoClient.db("assignment-eight");
// const userCollection = db.collection("all-books");
// const myBooksCollection = db.collection("my-Books");
// const borrowsCollection = db.collection("borrows");

// const JWKS = createRemoteJWKSet(
//   new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
// );

// const verifyToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(" ")[1];

//   console.log("CLIENT_URL:", process.env.CLIENT_URL);
//   console.log("Token received:", token ? token.slice(0, 20) + "..." : token);

//   if (!token || token === "undefined") {
//     return res.status(401).send({ msg: "Unauthorized!" });
//   }

//   try {
//     const { payload } = await jwtVerify(token, JWKS);
//     req.user = payload;
//     next();
//   } catch (error) {
//     console.error("JWT verify failed:", error.message);
//     return res.status(401).send({ msg: "Unauthorized!" });
//   }
// };
// app.get("/", (req, res) => {
//   res.send("hello");
// });






// app.get("/all-books", async (req, res) => {
//   try {
//     const result = await userCollection.find().toArray();
//     res.send(result);
//   } catch (err) {
//     console.error("find failed:", err);
//     res.status(500).send({ error: err.message });
//   }
// });


// app.get("/latest-books", async (req, res) => {
//   try {
//     const result = await userCollection
//       .find()
//       .sort({ _id: -1 })
//       .limit(8)
//       .toArray();

//     res.send(result);
//   } catch (err) {
//     console.error("latest books fetch failed:", err);
//     res.status(500).send({ error: err.message });
//   }
// });


// app.post('/all-books', verifyToken, async (req, res) => {
//   try {
//     const newBook = {
//       ...req.body,
//       addedByEmail: req.user.email,
//       addedByName: req.user.name,
//     };

//     const result = await userCollection.insertOne(newBook);
//     await myBooksCollection.insertOne(newBook);

//     res.send({ success: true, message: "successfully added", result });
//   } catch (err) {
//     console.error("insert failed:", err);
//     res.status(500).send({ error: err.message });
//   }
// });



// app.get("/all-books/:id", verifyToken,async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ error: "Invalid id" });
//     }

//     const result = await userCollection.findOne({ _id: new ObjectId(id) });

//     if (!result) {
//       return res.status(404).send({ error: "Book not found" });
//     }

//     res.send(result);
//   } catch (err) {
//     console.error("findOne failed:", err);
//     res.status(500).send({ error: err.message });
//   }
// });
// app.get('/my-books/:email', verifyToken, async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (req.user.email !== email) {
//       return res.status(403).send({ error: "Forbidden" });
//     }

//     const result = await myBooksCollection
//       .find({ addedByEmail: email })
//       .toArray();
//     res.send(result);
//   } catch (err) {
//     console.error("my-books find failed:", err);
//     res.status(500).send({ error: err.message });
//   }
// });
// // বই এডিট (শুধু যে বইটা যোগ করেছে)
// app.patch('/all-books/:id', verifyToken, async (req, res) => {
//   const { id } = req.params;
//   const { _id, addedByEmail, addedByName, ...data } = req.body;

//   const book = await userCollection.findOne({ _id: new ObjectId(id) });
//   if (!book) {
//     return res.status(404).send({ error: "Book not found" });
//   }
//   if (book.addedByEmail !== req.user.email) {
//     return res.status(403).send({ error: "Forbidden" });
//   }

//   const result = await userCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: data },
//   );
//   await myBooksCollection.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: data },
//   );

//   res.json(result);
// });

// // বই ডিলিট (শুধু যে বইটা যোগ করেছে)
// app.delete('/all-books/:id', verifyToken, async (req, res) => {
//   const { id } = req.params;

//   const book = await userCollection.findOne({ _id: new ObjectId(id) });
//   if (!book) {
//     return res.status(404).send({ error: "Book not found" });
//   }
//   if (book.addedByEmail !== req.user.email) {
//     return res.status(403).send({ error: "Forbidden" });
//   }

//   const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
//   await myBooksCollection.deleteOne({ _id: new ObjectId(id) });
//   await borrowsCollection.deleteMany({ bookId: id });

//   res.json(result);
// });

// // Borrow
// app.post('/borrows', verifyToken, async (req, res) => {
//   const { bookId, bookTitle, bookImage } = req.body;
//   const userEmail = req.user.email;

//   // একই ইউজার একই বই দুইবার নিতে পারবে না
//   const already = await borrowsCollection.findOne({ bookId, userEmail });
//   if (already) {
//     return res.status(400).send({ error: "You have already borrowed this book" });
//   }

//   // কপি ১ বা বেশি থাকলে তবেই ১ কমবে
//   const updated = await userCollection.updateOne(
//     { _id: new ObjectId(bookId), availableCopies: { $gt: 0 } },
//     { $inc: { availableCopies: -1 } },
//   );
//   if (updated.modifiedCount === 0) {
//     return res.status(400).send({ error: "No copies available" });
//   }

//   await myBooksCollection.updateOne(
//     { _id: new ObjectId(bookId) },
//     { $inc: { availableCopies: -1 } },
//   );

//   const borrowDate = new Date();
//   const returnDate = new Date();
//   returnDate.setDate(returnDate.getDate() + 7);

//   const result = await borrowsCollection.insertOne({
//     bookId,
//     bookTitle,
//     bookImage,
//     userEmail,
//     borrowDate,
//     returnDate,
//   });

//   res.send({ success: true, result });
// });

// // ইউজারের সব borrow
// app.get('/borrows/:email', verifyToken, async (req, res) => {
//   if (req.user.email !== req.params.email) {
//     return res.status(403).send({ error: "Forbidden" });
//   }

//   const result = await borrowsCollection
//     .find({ userEmail: req.params.email })
//     .toArray();
//   res.send(result);
// });

// // Return: রেকর্ড মুছে যায়, কপি ১ বাড়ে
// app.delete('/borrows/:id', verifyToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // ১. বরো বা ধার নেওয়ার রেকর্ডটি খুঁজে বের করা
//     const borrow = await borrowsCollection.findOne({ _id: new ObjectId(id) });
//     if (!borrow) {
//       return res.status(404).send({ error: "Borrow record not found" });
//     }

//     // ২. ইউজার চেক করা (যাতে অন্য কেউ ডিলিট করতে না পারে)
//     if (borrow.userEmail !== req.user.email) {
//       return res.status(403).send({ error: "Forbidden" });
//     }

//     // ৩. বরো রেকর্ডটি ডিলিট করা
//     await borrowsCollection.deleteOne({ _id: new ObjectId(id) });

//     // ৪. মূল বইয়ের কালেকশনে কপি ১ বাড়ানো 
    
//     await booksCollection.updateOne(
//       { _id: new ObjectId(borrow.bookId) },
//       { $inc: { availableCopies: 1 } }
//     );

//     res.send({ success: true });
//   } catch (error) {
//     console.p(error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });
// app.listen(PORT, () => {
//   console.log(`my port is running successfully ${PORT}`);
// });





// export default app;












import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

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

// পরিষ্কার নামকরণের জন্য কালেকশনগুলো ডিফাইন করা হলো:
const booksCollection = db.collection("all-books");       // সব বইয়ের কালেকশন
const myBooksCollection = db.collection("my-Books");     // ইউজারের যোগ করা বইয়ের কালেকশন
const borrowsCollection = db.collection("borrows");      // ধার নেওয়া বইয়ের কালেকশন

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token || token === "undefined") {
    return res.status(401).send({ msg: "Unauthorized!" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    console.error("JWT verify failed:", error.message);
    return res.status(401).send({ msg: "Unauthorized!" });
  }
};

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/all-books", async (req, res) => {
  try {
    const result = await booksCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("find failed:", err);
    res.status(500).send({ error: err.message });
  }
});

app.get("/latest-books", async (req, res) => {
  try {
    const result = await booksCollection
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

app.post('/all-books', verifyToken, async (req, res) => {
  try {
    const newBook = {
      ...req.body,
      addedByEmail: req.user.email,
      addedByName: req.user.name,
    };

    const result = await booksCollection.insertOne(newBook);
    await myBooksCollection.insertOne(newBook);

    res.send({ success: true, message: "successfully added", result });
  } catch (err) {
    console.error("insert failed:", err);
    res.status(500).send({ error: err.message });
  }
});

app.get("/all-books/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid id" });
    }

    const result = await booksCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send({ error: "Book not found" });
    }

    res.send(result);
  } catch (err) {
    console.error("findOne failed:", err);
    res.status(500).send({ error: err.message });
  }
});

app.get('/my-books/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;

    if (req.user.email !== email) {
      return res.status(403).send({ error: "Forbidden" });
    }

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
app.patch('/all-books/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { _id, addedByEmail, addedByName, ...data } = req.body;

  const book = await booksCollection.findOne({ _id: new ObjectId(id) });
  if (!book) {
    return res.status(404).send({ error: "Book not found" });
  }
  if (book.addedByEmail !== req.user.email) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const result = await booksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data },
  );
  await myBooksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data },
  );

  res.json(result);
});

// বই ডিলিট
app.delete('/all-books/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  const book = await booksCollection.findOne({ _id: new ObjectId(id) });
  if (!book) {
    return res.status(404).send({ error: "Book not found" });
  }
  if (book.addedByEmail !== req.user.email) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
  await myBooksCollection.deleteOne({ _id: new ObjectId(id) });
  await borrowsCollection.deleteMany({ bookId: id });

  res.json(result);
});

// Borrow
app.post('/borrows', verifyToken, async (req, res) => {
  const { bookId, bookTitle, bookImage } = req.body;
  const userEmail = req.user.email;

  const already = await borrowsCollection.findOne({ bookId, userEmail });
  if (already) {
    return res.status(400).send({ error: "You have already borrowed this book" });
  }

  const updated = await booksCollection.updateOne(
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
app.get('/borrows/:email', verifyToken, async (req, res) => {
  if (req.user.email !== req.params.email) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const result = await borrowsCollection
    .find({ userEmail: req.params.email })
    .toArray();
  res.send(result);
});

// Return: রেকর্ড মুছে যায়, কপি ১ বাড়ে
app.delete('/borrows/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const borrow = await borrowsCollection.findOne({ _id: new ObjectId(id) });
    if (!borrow) {
      return res.status(404).send({ error: "Borrow record not found" });
    }

    if (borrow.userEmail !== req.user.email) {
      return res.status(403).send({ error: "Forbidden" });
    }

    await borrowsCollection.deleteOne({ _id: new ObjectId(id) });

    // মূল বইয়ের কালেকশনে কপি ১ বাড়ানো
    await booksCollection.updateOne(
      { _id: new ObjectId(borrow.bookId) },
      { $inc: { availableCopies: 1 } }
    );

    // myBooksCollection-এও কপি ১ বাড়ানো (যদি থেকে থাকে)
    await myBooksCollection.updateOne(
      { _id: new ObjectId(borrow.bookId) },
      { $inc: { availableCopies: 1 } }
    );

    res.send({ success: true });
  } catch (error) {
    console.error("Delete borrow error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`my port is running successfully ${PORT}`);
});

export default app;
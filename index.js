// import express from "express";
// import 'dotenv/config'
// import cors from "cors";
// import { MongoClient } from 'mongodb';
// const app= express();
// const PORT =process.env.PORT || 5000 ;


// const client = new MongoClient(process.env.MONGODB_URI);

// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;
//   } catch (err) {
//     console.dir(err);
//   }
// }

// app.use(cors());
// app.use(express.json())


// const mongoClient = await connectToMongoDB()
// const db = mongoClient.db("assignment-eight")
// const userCollection =  db.collection("users")


// app.post("/users", async(req, res) => {
//   const data = req.body
//   const result = await userCollection.insertOne(data)
//   res.send(result)
// })

// app.get("/",(req,res)=>{
//     res.send("hello")
// })

// app.get('/about',(req,res)=>{
//     res.send('hello about section')
// })
 



// app.get('/users', async(req, res) => {
//   const result = await userCollection.find().toArray() 
//   res.send(result)
// })


// // app.post('/users',(req,res)=>{
// //     console.log('data from client',req.body)
// //     const newUser=req.body;
// //     newUser.id= users.length+1;
// //     users.push(newUser)
// //     res.send({success:true, message:"successfully added"})
// // })
// app.listen(PORT, () => {
//   console.log(`my port is running succussfully ${PORT}`)
// })













import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient } from "mongodb";

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
    process.exit(1); // কানেকশন না হলে সার্ভার বন্ধ হবে, যাতে error চোখে পড়ে
  }
}

app.use(cors());
app.use(express.json());

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("assignment-eight");
const userCollection = db.collection("users");


app.get("/", (req, res) => {
  res.send("hello");
});




app.post("/users", async (req, res) => {
  try {
    const data = req.body;
    console.log("data from client:", data);
    const result = await userCollection.insertOne(data);
    console.log("insert result:", result);
    res.send(result);
  } catch (err) {
    console.error("insert failed:", err);
    res.status(500).send({ error: err.message });
  }
});


app.get("/users", async (req, res) => {
  try {
    const result = await userCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("find failed:", err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`my port is running successfully ${PORT}`);
});
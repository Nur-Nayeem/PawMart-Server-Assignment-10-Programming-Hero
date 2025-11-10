const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is runnig");
});

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const pawsMart = client.db("pawsmart");
    const allCollection = pawsMart.collection("petsandsupplies");

    app.get("/recent-pets-and-supplies", async (req, res) => {
      const cursor = allCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/pets-and-supplies", async (req, res) => {
      const cursor = allCollection.find().sort({ date: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/pets-and-supplies/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      console.log(query);

      const result = await allCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-listing", async (req, res) => {
      const objectData = req.body;
      const result = await allCollection.insertOne(objectData);
      res.status(201).send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});

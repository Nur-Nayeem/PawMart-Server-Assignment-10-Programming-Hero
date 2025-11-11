const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseAdminSdk.json");

require("dotenv").config();
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

const verifyTokenWithFirebase = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const userInfo = await admin.auth().verifyIdToken(token);
  req.token_email = userInfo.email;
  next();
};

async function run() {
  try {
    await client.connect();

    const pawsMart = client.db("pawsmart");
    const allCollection = pawsMart.collection("petsandsupplies");
    const orderCollection = pawsMart.collection("orders");

    app.get("/recent-listings", async (req, res) => {
      const cursor = allCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/search-listings", async (req, res) => {
      const search = req.query.search;
      const result = await allCollection
        .find({ name: { $regex: search, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.get("/listings", async (req, res) => {
      const category = req.query.category;
      let query = {};

      if (category) {
        query = { category };
      }

      const result = await allCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/listings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-listing", verifyTokenWithFirebase, async (req, res) => {
      const objectData = req.body;
      const result = await allCollection.insertOne(objectData);
      res.status(201).send(result);
    });

    app.post("/order", async (req, res) => {
      const orderObject = req.body;
      const result = await orderCollection.insertOne(orderObject);
      res.send(result);
    });
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      query = { email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/my-listings", verifyTokenWithFirebase, async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await allCollection.find(query).toArray();
      res.send(result);
    });
    app.patch(
      "/update-listing/:id",
      verifyTokenWithFirebase,
      async (req, res) => {
        const updateInfo = req.body;
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateListing = {
          $set: updateInfo,
        };
        const result = await allCollection.updateOne(query, updateListing);
        res.send(result);
      }
    );
    app.delete("/listings/:id", verifyTokenWithFirebase, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allCollection.deleteOne(query);
      res.send(result);
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

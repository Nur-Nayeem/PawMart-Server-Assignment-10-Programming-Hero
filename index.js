const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);

// const serviceAccount = require("./firebaseAdminSdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is runnig");
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
    // await client.connect();

    const pawsMart = client.db("pawsmart");
    const allCollection = pawsMart.collection("petsandsupplies");
    const orderCollection = pawsMart.collection("orders");

    app.get("/recent-listings", async (req, res) => {
      try {
        const cursor = allCollection.find().sort({ createdAt: -1 }).limit(6);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching recent listings:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/search-listings", async (req, res) => {
      try {
        const search = req.query.search;
        if (!search) {
          return res.status(400).send({ message: "Search query is required" });
        }
        const result = await allCollection
          .find({ name: { $regex: search, $options: "i" } })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error searching listings:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/listings", async (req, res) => {
      try {
        const category = req.query.category;
        let query = {};

        if (category) {
          query = { category };
        }

        const result = await allCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!id) {
          return res.status(400).send({ message: "Listing ID is required" });
        }

        let objectId;
        try {
          objectId = new ObjectId(id);
        } catch (error) {
          return res.status(400).send({ message: "Invalid listing ID" });
        }

        const query = { _id: objectId };
        const result = await allCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Listing not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.post("/add-listing", verifyTokenWithFirebase, async (req, res) => {
      try {
        const objectData = req.body;

        if (!objectData || Object.keys(objectData).length === 0) {
          return res.status(400).send({ message: "Listing data is required" });
        }

        if (objectData.email !== req.token_email) {
          return res.status(403).send({ message: "Forbidden access" });
        }

        if (objectData.category === "Pets") {
          objectData.price = 0;
        }

        objectData.createdAt = new Date();

        const result = await allCollection.insertOne(objectData);

        res.status(201).send({
          message: "Listing added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding listing:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.post("/order", async (req, res) => {
      try {
        const orderObject = req.body;

        if (!orderObject || Object.keys(orderObject).length === 0) {
          return res.status(400).send({ message: "Order data is required" });
        }

        if (orderObject.category === "Pets") {
          orderObject.price = 0;
        }

        const result = await orderCollection.insertOne(orderObject);

        res.status(201).send({
          message: "Order placed successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/order", async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({ message: "Missing email" });
        }

        const query = { email };
        const result = await orderCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/my-listings", verifyTokenWithFirebase, async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).send({ message: "Missing email" });
        }
        if (email !== req.token_email) {
          return res.status(403).send({ message: "Forbidden access" });
        }
        const query = { email };
        const result = await allCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    app.patch(
      "/update-listing/:id",
      verifyTokenWithFirebase,
      async (req, res) => {
        try {
          const updateInfo = req.body;
          const id = req.params.id;
          const email = req.query.email;

          if (!id || !email) {
            return res.status(400).send({ message: "Missing id or email" });
          }

          if (updateInfo.category === "Pets") {
            updateInfo.price = 0;
          }

          // Verify user
          if (email !== req.token_email) {
            return res.status(403).send({ message: "Forbidden access" });
          }

          const query = { _id: new ObjectId(id), email };
          const updateListing = { $set: updateInfo };

          const result = await allCollection.updateOne(query, updateListing);

          if (result.matchedCount === 0) {
            return res
              .status(404)
              .send({ message: "Listing not found or unauthorized" });
          }

          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send({ message: "Internal Server Error" });
        }
      }
    );
    app.delete("/listings/:id", verifyTokenWithFirebase, async (req, res) => {
      try {
        const id = req.params.id;
        const email = req.query.email;

        if (!id || !email) {
          return res.status(400).send({ message: "Missing id or email" });
        }
        if (email !== req.token_email) {
          return res.status(403).send({ message: "Forbidden access" });
        }
        const query = { _id: new ObjectId(id), email };
        const result = await allCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res
            .status(404)
            .send({ message: "Listing not found or unauthorized" });
        }
        res.send({ message: "Listing deleted successfully", result });
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // await client.db("admin").command({ ping: 1 });
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

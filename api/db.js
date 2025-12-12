import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;

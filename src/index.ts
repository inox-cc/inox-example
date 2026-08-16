import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')

try {
  await client.connect()
  const collection = client.db('inox_example').collection('documents')

  await collection.deleteMany({})
  await collection.insertOne({ message: 'Hello from Inox' })

  console.log(await collection.find().toArray())
} finally {
  await client.close()
}

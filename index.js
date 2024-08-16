const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app=express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fbvkkp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobtaskphcollection = client.db('jobPh').collection('products');

    // data get from database with pagination
    
    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
      const sortBy = req.query.sortBy || 'date'; // Default sorting by date
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Default descending order
      const skip = (page - 1) * limit;
      const searchTerm = req.query.search || ''; 
  
      let sortQuery = {};
      
      if (sortBy === 'price') {
          sortQuery = { price: sortOrder };
      } else if (sortBy === 'date') {
          sortQuery = { createdAt: sortOrder };
      }
  
      // Build the search query
      let searchQuery = {};
      if (searchTerm) {
          searchQuery = {
              productName: { $regex: searchTerm, $options: 'i' } // Case-insensitive regex search
          };
      }
  
      // Find products based on search, sort, and pagination
      const cursor = jobtaskphcollection.find(searchQuery).sort(sortQuery).skip(skip).limit(limit);
      const result = await cursor.toArray();
      const totalProducts = await jobtaskphcollection.countDocuments(searchQuery); // Count only the filtered documents
      
      res.send({
          products: result,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts
      });
  });
  
  
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('the  product server is running')
})

app.listen(port,()=>{
    console.log(`the product is running port : ${port}`)
})
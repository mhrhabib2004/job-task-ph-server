const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://job-task-from-ph.web.app',
    // 'https://bestdeal-5e08b.firebaseapp.com'
  ],
  credentials: true
}));
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
      const sortBy = req.query.sortBy || 'date';
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      const skip = (page - 1) * limit;
      const searchTerm = req.query.search || '';
  
      const brandFilter = req.query.brand || '';
      const categoryFilter = req.query.category || '';
      const priceRangeFilter = req.query.priceRange ? req.query.priceRange.split('-').map(Number) : [0, Infinity];
  
      let sortQuery = {};
  
      if (sortBy === 'price') {
          sortQuery = { price: sortOrder };
      } else if (sortBy === 'date') {
          sortQuery = { createdAt: sortOrder };
      }
  
      // Build the search query
      let searchQuery = {};
      if (searchTerm) {
          searchQuery.productName = { $regex: searchTerm, $options: 'i' };
      }
  
      // Add brand filter to the search query if provided
      if (brandFilter) {
          searchQuery.brandName = brandFilter;
      }
  
      // Add category filter to the search query if provided
      if (categoryFilter) {
          searchQuery.category = categoryFilter;
      }
  
      // Add price range filter to the search query
      if (priceRangeFilter) {
          searchQuery.price = { $gte: priceRangeFilter[0], $lte: priceRangeFilter[1] };
      }
  
      // Find products based on search, filter, sort, and pagination
      const cursor = jobtaskphcollection.find(searchQuery).sort(sortQuery).skip(skip).limit(limit);
      const result = await cursor.toArray();
      const totalProducts = await jobtaskphcollection.countDocuments(searchQuery);
  
      res.send({
          products: result,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts
      });
  });
  


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('the best electronics server is running')
})

app.listen(port, () => {
  console.log(`the best electronics server is running port : ${port}`)
})
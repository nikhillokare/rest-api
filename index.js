const express = require("express");
const mongoose = require("mongoose");
const port = 8080;
const app = express();
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// Body parser
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Middle Ware
app.use((req, res, next) => {
  console.log(req.method, req.ip, req.hostname, new Date());
  next();
});

// Connect to Mongoose DB
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Connected To Mongodb");
}

// DataBase Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  rating: Number,
  stock: Number,
});

// Create Model
const Product = new mongoose.model("Product", productSchema);

// Rest Api
// Create Api
app.post("/api/v1/products/new", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    console.log(product);
    res.status(201).json({ product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while creating the product" });
  }
});

// Read Api
app.get("/api/v1/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching the products" });
  }
});
// Update Api
app.put("/api/v1/products/:id", async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the product" });
  }
});

// Delete Api

app.delete("/api/v1/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product is not available" });
    }
    res
      .status(200)
      .json({ message: "Product is deleted successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the product" });
  }
});

// Private localhost Server
app.listen(port, () => {
  console.log(`Server is Running on ${port}`);
});

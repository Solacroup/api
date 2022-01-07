const express = require("express");

const joi = require ('joi')

const fs = require("fs"); // file system
const path = require("path");

const pathProductsJSON = path.join(__dirname, "./data/products.json");

const products = JSON.parse(fs.readFileSync(pathProductsJSON).toString()); // string json --> objet js

const schemaPost = joi.object({
  id: joi.number().integer().min(1).required(),
  title: joi.string().min(3).max(100).required(),
  price: joi.number().precision(2).integer().min(0.01).required(),
  description: joi.string().min(10).max(800).required(),
  category: joi.string().min(3).max(20).required(),
  image: joi.string().pattern(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/).required(),
  rating: joi.object({
    rate: joi.number().integer().precision(1).min(0).max(5).required(),
    count: joi.number().integer().min(1).required()
  })
   
})



const app = express();

app.use(express.json());

app.get("", (req, res) => {
  // res==>response
  console.log("requête entrante sur la homepage");
  res.send("Homepage");
});

app.get("/api/products", (req, res) => {
  res.status(200).send(products);
});

app.post("/api/products", (req, res) => {
  const product = req.body;

  product.id = products[products.length - 1].id + 1;

  products.push(product);

  res.status(201).send(products);
});

app.delete('/api/products/:id', (req, res)=>{
  const productId = parseInt(req.params.id)
  const product = products.find(produit => produit.id === productId)

  //si le résultat de find est undefined
  if(!product){
    return res.status(404).send('product not found with the given id')
  }
  const index = products.indexOf(product)
  products.splice(index, 1)

  res.status(200).send(product)
})

app.put('/api/products/:id', (req, res)=>{
  const productId = parseInt(req.params.id)
  const change = req.body
  const foundProduct = products.find(produit => produit.id === productId)

  if(!foundProduct){
    return res.status(404).send('product not found with the given id')
  }

  const schemaPut = joi.object({
    id: joi.number().integer().min(1),
    title: joi.string().min(3).max(100),
    price: joi.number().precision(2).integer().min(0.01),
    description: joi.string().min(10).max(800),
    category: joi.string().min(3).max(20),
    image: joi.string().pattern(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/),
    rating: joi.object({
      rate: joi.number().integer().precision(1).min(0).max(5),
      count: joi.number().integer().min(1)
    })   
  })

  //vérifier la correspondance de change avec schema
  const {error} = schemaPut.validate(change)

  if(error){
    res.status(400).send(validationSchema.error)
  }

  for(const key in change){
    foundProduct[key] = change[key] 
  }
  res.status(201).send(foundProduct)


})

app.get('/api/products/:id', (req,res)=>{
  const productId = parseInt(req.params.id)
  const foundProduct = products.find(produit => produit.id === productId)
  if(!foundProduct){
    return res.status(404).send('Product not found')
  }
  res.status(200).send(foundProduct)
})

app.listen(process.env.PORT || 3000, () =>
  console.log(`Listening on port ${process.env.PORT ||  3000}...`)
);

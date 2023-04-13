const express = require('express');
const app = express();
const db = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    // port: 3308,
    user: 'root',
    password: 'sqldb',
    database: 'product_management'
  }
});

app.use(express.json());

app.get('/api',(req,res)=>{
    res.send('api is working')
})

//get all products 

app.get('/api/products', async(req,res)=>{
    const { category, status } = req.query;
      const products = await db.select('*')
    .from('Product')
    .join('CategoryProduct', 'Product.id', '=', 'CategoryProduct.product_id')
    .join('Category', 'CategoryProduct.category_id', '=', 'Category.id')
    .where('Category.name', '=', category)
    .andWhere('Product.status', '=', status);
  res.json(products);
})

// Search products
app.get('/api/products/search', async (req, res) => {
    const { search } = req.query;
    const products = await db.select('*')
      .from('Product')
      .where('Product.name', 'like', `%${search}%`);
    res.json(products);
  });

// Get single product with all details
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await db.select('*')
      .from('Product')
      .join('ProductAttribute', 'Product.id', '=', 'ProductAttribute.product_id')
      .join('Attribute', 'ProductAttribute.attribute_id', '=', 'Attribute.id')
      .join('AttributeValue', 'ProductAttribute.attribute_value_id', '=', 'AttributeValue.id')
      .where('Product.id', '=', id);
    res.json(product);
  });

// Update product
app.patch('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, status } = req.body;
    await db('Product')
      .where('id', '=', id)
      .update({
        name,
        price,
        status
      });
    res.send(`Product with id ${id} has been updated.`);
  });

  app.post('/products', async (req, res) => {
    const { name, price, status, categories, attributes } = req.body;
    const [productId] = await db('Product').insert({
      name,
      price,
      status
    });
    const categoryInserts = categories.map(category => ({
      category_id: category,
      product_id: productId
    }));
    await db('CategoryProduct').insert(categoryInserts);
    const attributeInserts = attributes.map(attribute => ({
      product_id: productId,
      attribute_id: attribute.id,
      attribute_value_id:
      attribute.valueId
}));
await db('ProductAttribute').insert(attributeInserts);
res.send(`Product with id ${productId} has been added.`);
});

app.listen(4000, () => {
  console.log('Server started on port 3000');
});


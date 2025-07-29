const mysql = require('mysql2/promise');
const request = require('supertest');
const app = require('../../app.js');

let connection;
let createdProductId, createdUserId, createdOrderId, createdCategoryId, createdWorkerId, createdAdminId, createdPaymentId, authToken;

beforeAll(async () => {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'testuser',
    password: process.env.DB_PASSWORD || 'testpassword',
    database: process.env.DB_NAME || 'ishop_test',
  });

});

afterAll(async () => {
  await connection.end();
});

describe('iShop Integration Tests', () => {
  // PRODUCTS
  test('POST /products creates a product', async () => {
    const res = await request(app).post('/products').send({ name: 'Test Product', price: 9.99, stock: 10 });
    expect(res.statusCode).toBe(201);
    createdProductId = res.body.id;
  });
  test('GET /products returns products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /products/:id returns a single product', async () => {
    const res = await request(app).get(`/products/${createdProductId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdProductId);
  });
  test('PUT /products/:id updates a product', async () => {
    const res = await request(app).put(`/products/${createdProductId}`).send({ name: 'Updated Product', price: 19.99, stock: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Product');
  });
  test('DELETE /products/:id deletes a product', async () => {
    const res = await request(app).delete(`/products/${createdProductId}`);
    expect(res.statusCode).toBe(204);
  });
  // PRODUCTS ERROR CASES
  test('GET /products/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/products/999999');
    expect(res.statusCode).toBe(404);
  });
  test('POST /products with invalid data returns 400', async () => {
    const res = await request(app).post('/products').send({ price: -1 });
    expect(res.statusCode).toBe(400);
  });
  test('PUT /products/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/products/999999').send({ name: 'x', price: 1, stock: 1 });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /products/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/products/1').send({ price: -100 });
    expect(res.statusCode).toBe(400);
  });
  test('DELETE /products/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/products/999999');
    expect(res.statusCode).toBe(404);
  });

  // USERS
  test('POST /users creates a user', async () => {
    const res = await request(app).post('/users').send({ username: 'testuser', password: 'password123', email: 'test@example.com' });
    expect(res.statusCode).toBe(201);
    createdUserId = res.body.id;
  });
  test('GET /users returns users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /users/:id returns a single user', async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdUserId);
  });
  test('PUT /users/:id updates a user', async () => {
    const res = await request(app).put(`/users/${createdUserId}`).send({ username: 'updateduser', email: 'updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('updateduser');
  });
  test('DELETE /users/:id deletes a user', async () => {
    const res = await request(app).delete(`/users/${createdUserId}`);
    expect(res.statusCode).toBe(204);
  });
  // USERS ERROR CASES
  test('GET /users/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/users/999999');
    expect(res.statusCode).toBe(404);
  });
  test('POST /users with missing fields returns 400', async () => {
    const res = await request(app).post('/users').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });
  test('PUT /users/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/users/999999').send({ username: 'x' });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /users/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/users/1').send({ email: 'not-an-email' });
    expect([400, 422]).toContain(res.statusCode);
  });
  test('DELETE /users/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/users/999999');
    expect(res.statusCode).toBe(404);
  });

  // WORKERS
  test('POST /workers creates a worker', async () => {
    const res = await request(app).post('/workers').send({ name: 'Worker1', role: 'packer' });
    expect(res.statusCode).toBe(201);
    createdWorkerId = res.body.id;
  });
  test('GET /workers returns workers', async () => {
    const res = await request(app).get('/workers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /workers/:id returns a single worker', async () => {
    const res = await request(app).get(`/workers/${createdWorkerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdWorkerId);
  });
  test('PUT /workers/:id updates a worker', async () => {
    const res = await request(app).put(`/workers/${createdWorkerId}`).send({ name: 'Worker2', role: 'shipper' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Worker2');
  });
  test('DELETE /workers/:id deletes a worker', async () => {
    const res = await request(app).delete(`/workers/${createdWorkerId}`);
    expect(res.statusCode).toBe(204);
  });
  // WORKERS ERROR CASES
  test('GET /workers/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/workers/999999');
    expect(res.statusCode).toBe(404);
  });
  test('POST /workers with missing fields returns 400', async () => {
    const res = await request(app).post('/workers').send({ name: '' });
    expect(res.statusCode).toBe(400);
  });
  test('PUT /workers/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/workers/999999').send({ name: 'x', role: 'x' });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /workers/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/workers/1').send({ name: '', role: '' });
    expect(res.statusCode).toBe(400);
  });
  test('DELETE /workers/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/workers/999999');
    expect(res.statusCode).toBe(404);
  });

  // ADMIN
  test('POST /admin creates an admin', async () => {
    const res = await request(app).post('/admin').send({ username: 'admin1', password: 'adminpass' });
    expect(res.statusCode).toBe(201);
    createdAdminId = res.body.id;
  });
  test('GET /admin returns admins', async () => {
    const res = await request(app).get('/admin');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /admin/:id returns a single admin', async () => {
    const res = await request(app).get(`/admin/${createdAdminId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdAdminId);
  });
  test('PUT /admin/:id updates an admin', async () => {
    const res = await request(app).put(`/admin/${createdAdminId}`).send({ username: 'admin2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('admin2');
  });
  test('DELETE /admin/:id deletes an admin', async () => {
    const res = await request(app).delete(`/admin/${createdAdminId}`);
    expect(res.statusCode).toBe(204);
  });
  // ADMIN ERROR CASES
  test('GET /admin/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/admin/999999');
    expect(res.statusCode).toBe(404);
  });
  test('POST /admin with missing fields returns 400', async () => {
    const res = await request(app).post('/admin').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });
  test('PUT /admin/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/admin/999999').send({ username: 'x' });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /admin/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/admin/1').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });
  test('DELETE /admin/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/admin/999999');
    expect(res.statusCode).toBe(404);
  });

  // CATEGORIES
  test('POST /categories creates a category', async () => {
    const res = await request(app).post('/categories').send({ name: 'Electronics' });
    expect(res.statusCode).toBe(201);
    createdCategoryId = res.body.id;
  });
  test('GET /categories returns categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /categories/:id returns a single category', async () => {
    const res = await request(app).get(`/categories/${createdCategoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdCategoryId);
  });
  test('PUT /categories/:id updates a category', async () => {
    const res = await request(app).put(`/categories/${createdCategoryId}`).send({ name: 'Updated Category' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Category');
  });
  test('DELETE /categories/:id deletes a category', async () => {
    const res = await request(app).delete(`/categories/${createdCategoryId}`);
    expect(res.statusCode).toBe(204);
  });
  // CATEGORIES ERROR CASES
  test('GET /categories/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/categories/999999');
    expect(res.statusCode).toBe(404);
  });
  test('POST /categories with missing name returns 400', async () => {
    const res = await request(app).post('/categories').send({});
    expect(res.statusCode).toBe(400);
  });
  test('PUT /categories/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/categories/999999').send({ name: 'x' });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /categories/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/categories/1').send({ name: '' });
    expect(res.statusCode).toBe(400);
  });
  test('DELETE /categories/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/categories/999999');
    expect(res.statusCode).toBe(404);
  });

  // PAYMENT
  test('POST /payments creates a payment', async () => {
    // Create a user and order for payment
    const userRes = await request(app).post('/users').send({ username: 'payuser', password: 'pass', email: 'pay@example.com' });
    const productRes = await request(app).post('/products').send({ name: 'Pay Product', price: 10, stock: 5 });
    const orderRes = await request(app).post('/orders').send({
      userId: userRes.body.id,
      items: [{ productId: productRes.body.id, quantity: 1 }]
    });
    const res = await request(app).post('/payments').send({
      orderId: orderRes.body.id,
      amount: 10,
      currency: 'usd',
      method: 'credit_card'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdPaymentId = res.body.id;
  });

  test('GET /payments returns payments', async () => {
    const res = await request(app).get('/payments');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /payments/:id returns a single payment', async () => {
    const res = await request(app).get(`/payments/${createdPaymentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdPaymentId);
  });

  test('PUT /payments/:id updates a payment', async () => {
    const res = await request(app).put(`/payments/${createdPaymentId}`).send({ method: 'paypal' });
    expect(res.statusCode).toBe(200);
    expect(res.body.method).toBe('paypal');
  });

  test('DELETE /payments/:id deletes a payment', async () => {
    const res = await request(app).delete(`/payments/${createdPaymentId}`);
    expect(res.statusCode).toBe(204);
  });
  // PAYMENT ERROR CASES
  test('POST /payments with missing amount or currency returns 400', async () => {
    const res = await request(app).post('/payments').send({ amount: 1000 }); // missing currency
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /payments with invalid amount returns 400', async () => {
    const res = await request(app).post('/payments').send({ amount: -1000, currency: 'usd', method: 'credit_card' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /payments with invalid currency returns 400', async () => {
    const res = await request(app).post('/payments').send({ amount: 1000, currency: 'invalid', method: 'credit_card' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /payments with non-number amount returns 400', async () => {
    const res = await request(app).post('/payments').send({ amount: "not-a-number", currency: 'usd', method: 'credit_card' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /payments/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/payments/999999');
    expect(res.statusCode).toBe(404);
  });
  test('PUT /payments/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/payments/999999').send({ method: 'cash' });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /payments/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/payments/1').send({ method: '' });
    expect(res.statusCode).toBe(400);
  });
  test('DELETE /payments/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/payments/999999');
    expect(res.statusCode).toBe(404);
  });

  // AUTH
  test('POST /auth/register registers a user', async () => {
    const res = await request(app).post('/auth/register').send({ username: 'authuser', password: 'authpass', email: 'auth@example.com' });
    expect(res.statusCode).toBe(201);
  });
  test('POST /auth/login logs in a user', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'authuser', password: 'authpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });
  // AUTH ERROR CASES
  test('POST /auth/register with missing fields returns 400', async () => {
    const res = await request(app).post('/auth/register').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });
  test('POST /auth/login with wrong credentials returns 401', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'authuser', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
  test('POST /auth/login with missing fields returns 400', async () => {
    const res = await request(app).post('/auth/login').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });

  // ORDERS (for completeness)
  test('POST /orders creates an order', async () => {
    const productRes = await request(app).post('/products').send({ name: 'Order Product', price: 5.99, stock: 20 });
    const userRes = await request(app).post('/users').send({ username: 'orderuser', password: 'pass', email: 'order@example.com' });
    const order = {
      userId: userRes.body.id,
      items: [{ productId: productRes.body.id, quantity: 2 }]
    };
    const res = await request(app).post('/orders').send(order);
    expect(res.statusCode).toBe(201);
    createdOrderId = res.body.id;
  });
  test('GET /orders returns orders', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /orders/:id returns a single order', async () => {
    const res = await request(app).get(`/orders/${createdOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdOrderId);
  });
  test('PUT /orders/:id updates an order', async () => {
    const res = await request(app).put(`/orders/${createdOrderId}`).send({ status: 'shipped' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('shipped');
  });
  test('DELETE /orders/:id deletes an order', async () => {
    const res = await request(app).delete(`/orders/${createdOrderId}`);
    expect(res.statusCode).toBe(204);
  });
  // ORDERS ERROR CASES
  test('GET /orders/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/orders/999999');
    expect(res.statusCode).toBe(404);
  });
  test('POST /orders with missing fields returns 400', async () => {
    const res = await request(app).post('/orders').send({});
    expect(res.statusCode).toBe(400);
  });
  test('POST /orders with invalid product id returns 400', async () => {
    const res = await request(app).post('/orders').send({
      userId: 1,
      items: [{ productId: 999999, quantity: 1 }]
    });
    expect(res.statusCode).toBe(400);
  });
  test('PUT /orders/:id with non-existent id returns 404', async () => {
    const res = await request(app).put('/orders/999999').send({ status: 'cancelled' });
    expect(res.statusCode).toBe(404);
  });
  test('PUT /orders/:id with invalid data returns 400', async () => {
    const res = await request(app).put('/orders/1').send({ status: 123 });
    expect(res.statusCode).toBe(400);
  });
  test('DELETE /orders/:id with non-existent id returns 404', async () => {
    const res = await request(app).delete('/orders/999999');
    expect(res.statusCode).toBe(404);
  });

  // GENERAL ERROR CASES
  test('PATCH /products/:id returns 405 or 404', async () => {
    const res = await request(app).patch('/products/1').send({ name: 'patch' });
    expect([404, 405]).toContain(res.statusCode);
  });
  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
  });

});

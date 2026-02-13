const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Mock email function (imported or redefined)
const sendLowStockEmail = (productName, quantity) => {
    console.log(`[EMAIL SENT] Alert: Stock for '${productName}' is low (${quantity} remaining). Please restock.`);
};

// Buyer Home
router.get('/home', verifyToken, requireRole('buyer'), (req, res) => {
    // Only show published products
    db.all(`SELECT * FROM products WHERE is_published = 1 AND quantity > 0`, (err, products) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.render('buyer-dashboard', { user: req.user, products: products });
    });
});

// Buy Product
router.post('/buy/:id', verifyToken, requireRole('buyer'), (req, res) => {
    const productId = req.params.id;

    db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, product) => {
        if (err || !product) return res.status(404).send("Product not found");
        if (product.quantity <= 0) return res.status(400).send("Out of stock");

        const newQuantity = product.quantity - 1;
        db.run(`UPDATE products SET quantity = ? WHERE id = ?`, [newQuantity, productId], (err) => {
            if (err) return res.status(500).send("Error processing purchase");

            // Automation: Check low stock
            if (newQuantity < 10) {
                sendLowStockEmail(product.name, newQuantity);
            }

            res.redirect('/buyer/home');
        });
    });
});

module.exports = router;

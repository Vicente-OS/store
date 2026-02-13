const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

// Mock email function
const sendLowStockEmail = (productName, quantity) => {
    console.log(`[EMAIL SENT] Alert: Stock for '${productName}' is low (${quantity} remaining). Please restock.`);
};

// Dashboard
router.get('/dashboard', verifyToken, requireRole('seller'), (req, res) => {
    db.all(`SELECT * FROM products WHERE seller_id = ?`, [req.user.id], (err, products) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.render('seller-dashboard', { user: req.user, products: products });
    });
});

// Create Product
router.post('/products', verifyToken, requireRole('seller'), (req, res) => {
    const { name, description, price, quantity } = req.body;
    db.run(`INSERT INTO products (seller_id, name, description, price, quantity) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, name, description, price, quantity],
        function(err) {
            if (err) console.error(err);
            res.redirect('/seller/dashboard');
        }
    );
});

// Update Product (Publish/Unpublish & Restock)
router.post('/products/:id/update', verifyToken, requireRole('seller'), (req, res) => {
    const { action, quantity } = req.body;
    const productId = req.params.id;

    if (action === 'publish') {
        db.run(`UPDATE products SET is_published = 1 WHERE id = ? AND seller_id = ?`, [productId, req.user.id], () => res.redirect('/seller/dashboard'));
    } else if (action === 'unpublish') {
        db.run(`UPDATE products SET is_published = 0 WHERE id = ? AND seller_id = ?`, [productId, req.user.id], () => res.redirect('/seller/dashboard'));
    } else if (action === 'update_stock') {
        // Logic to update stock and check low inventory
        db.run(`UPDATE products SET quantity = ? WHERE id = ? AND seller_id = ?`, [quantity, productId, req.user.id], function(err) {
           // Check if low
           if (quantity < 10) {
               // We need to fetch product name first ideally, but for now let's assume we pass it or fetch it.
               // Let's do a quick fetch
               db.get(`SELECT name FROM products WHERE id = ?`, [productId], (err, row) => {
                   if (row) sendLowStockEmail(row.name, quantity);
               });
           }
           res.redirect('/seller/dashboard');
        });
    } else {
        res.redirect('/seller/dashboard');
    }
});

// Export CSV
router.get('/export', verifyToken, requireRole('seller'), (req, res) => {
    db.all(`SELECT * FROM products WHERE seller_id = ?`, [req.user.id], (err, products) => {
        if (err) return res.status(500).send("Error fetching data");

        const csvPath = path.resolve(__dirname, '../../products_export.csv');
        const csvWriter = createCsvWriter({
            path: csvPath,
            header: [
                {id: 'id', title: 'ID'},
                {id: 'name', title: 'Name'},
                {id: 'price', title: 'Price'},
                {id: 'quantity', title: 'Quantity'},
                {id: 'is_published', title: 'Published'}
            ]
        });

        csvWriter.writeRecords(products)
            .then(() => {
                res.download(csvPath, 'products_report.csv', (err) => {
                    if (err) console.error(err);
                    // fs.unlinkSync(csvPath); // Optional: delete after download
                });
            });
    });
});

module.exports = router;

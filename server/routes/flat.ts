import express = require('express');
import jwt = require('jsonwebtoken');

const router = express.Router();
import {pool} from "../db";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Authorization Header:', authHeader);
    console.log('Extracted Token:', token);

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed', err);
            return res.sendStatus(403); // Forbidden
        }
        console.log('Verified User:', user);
        req.user = user;
        next();
    });
};


router.post('/rent', authenticateToken, async (req: any, res: any) => {
    const {title, description, price, pictures} = req.body;
    try {
        const newFlat = await pool.query(
            'INSERT INTO flats_for_rent (user_id, title, description, price, pictures) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.userId, title, description, price, pictures]
        );
        res.json(newFlat.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/user', authenticateToken, async (req: any, res: any) => {
    try {
        const flatsForRent = await pool.query(
            'SELECT * FROM flats_for_rent WHERE user_id = $1',
            [req.user.userId]
        );
        const flatsForSale = await pool.query(
            'SELECT * FROM flats_for_sale WHERE user_id = $1',
            [req.user.userId]
        );
        res.json({
            flatsForRent: flatsForRent.rows,
            flatsForSale: flatsForSale.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/sale', authenticateToken, async (req: any, res: any) => {
    const {title, description, price, pictures} = req.body;
    try {
        const newFlat = await pool.query(
            'INSERT INTO flats_for_sale (user_id, title, description, price, pictures) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.userId, title, description, price, pictures]
        );
        res.json(newFlat.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

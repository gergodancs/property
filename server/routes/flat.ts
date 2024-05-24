import express = require('express');
import {pool} from "../db";
import {authenticateToken} from "../midlewares/auth";
import {parsePictures, upload} from "../midlewares/upload";

const router = express.Router();

router.post('/rent', authenticateToken, upload.array('pictures', 10), async (req: any, res: any) => {
    const {position, district, city, country, title, shortDescription, description, price, email} = req.body;
    const pictures = parsePictures(req.files);

    try {
        const newFlat = await pool.query(
            'INSERT INTO flats_for_rent (user_id, position, district, city, country, title, short_description, description, price, email, pictures) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [req.user.userId, position, district, city, country, title, shortDescription, description, price, email, pictures]
        );
        res.json(newFlat.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/sale', authenticateToken, upload.array('pictures', 10), async (req: any, res) => {
    const {position, district, city, country, title, shortDescription, description, price, email} = req.body;
    const pictures = parsePictures(req.files);

    try {
        const newFlat = await pool.query(
            'INSERT INTO flats_for_sale (user_id, position, district, city, country, title, short_description, description, price, email, pictures) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [req.user.userId, position, district, city, country, title, shortDescription, description, price, email, pictures]
        );
        res.json(newFlat.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/user', authenticateToken, async (req: any, res) => {
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

router.get('/for-rent', async (_req, res) => {
    try {
        const flatsForRent = await pool.query('SELECT * FROM flats_for_rent');
        res.json(flatsForRent.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/for-sale', async (_req, res) => {
    try {
        const flatsForSale = await pool.query('SELECT * FROM flats_for_sale');
        res.json(flatsForSale.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/all', async (_req, res) => {
    try {
        const flatsForRent = await pool.query('SELECT * FROM flats_for_rent');
        const flatsForSale = await pool.query('SELECT * FROM flats_for_sale');
        res.json([...flatsForRent.rows, ...flatsForSale.rows])
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export = router;

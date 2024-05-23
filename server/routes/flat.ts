import express = require('express');
import jwt = require('jsonwebtoken');
import multer = require("multer");
import * as path from "node:path";
import {pool} from "../db";

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // directory to save files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // generate unique filename
    }
});

const upload = multer({storage});

const parsePictures = (files) => {
    return files.map(file => ({
        url: `/uploads/${file.filename}`,
        description: file.originalname
    }));
};

router.post('/rent', authenticateToken, upload.array('pictures', 10), async (req: any, res: any) => {
    console.log(req);
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

export = router;

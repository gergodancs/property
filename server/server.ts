import express = require('express');
import bodyParser = require('body-parser');
import cors = require('cors');
import * as path from "node:path";
const app = express();
app.use(bodyParser.json());
app.use(cors());

const authRoutes = require('./routes/auth');
import flatRoutes = require('./routes/flat');
app.use('/auth', authRoutes);
app.use('/flats', flatRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

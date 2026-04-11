const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth check - apply to specific routes
app.get('/api/gsheets/candidates', ClerkExpressRequireAuth(), (req, res) => {
    const data = [
        { id: 101, name: "David Miller", match: 94, status: "Sync", role: "Product Manager" },
    ];
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});

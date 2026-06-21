const express = require('express');
const userRoutes = require('./routes/routes');
const path = require("path");


const app = express();
const port = 3000;

app.use(userRoutes);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

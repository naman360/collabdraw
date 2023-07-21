const express = require("express");
const app = express();
const port = process.env.PORT || 5002;

app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});

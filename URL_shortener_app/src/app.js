const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const connection = require('./config/db');
app.use(cors());
app.use(helmet());
app.use(express.json());
// app.use(connection);
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Something went wrong, Try again!';
   
    return res.status(errorStatus).json({
      status: errorStatus,
      message: errorMessage,
      stack: err.stack,
      success: false,
    });
  });

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log('Server running on port:',PORT);
})
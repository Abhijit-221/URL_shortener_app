const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const connection = require('./config/db');
const userRouter = require('./routes/user/auth');
const urlRouter = require('./routes/url/urlShortener');
const analyticsRouter = require('./routes/url/analytics');
app.use(cors());
// app.use(helmet());
app.use(express.json());

app.use('/',userRouter);
app.use('/api',urlRouter);
app.use('/api/analytics',analyticsRouter);

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.doc');
app.use('/api-docs', swaggerUi.serve,(req, res, next) => {
  req.headers['Authorization'] = 'YourAuthToken'; // Example hardcoded token
  next();}, swaggerUi.setup(swaggerDocs));

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
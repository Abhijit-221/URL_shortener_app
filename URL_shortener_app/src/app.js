const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const connection = require('./config/db');
const userRouter = require('./routes/user/auth');
app.use(cors());
app.use(helmet());
app.use(express.json());
// app.use(connection);

// const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// const GOOGLE_CALLBACK_URL = "http%3A//localhost:8000/google/callback";

// const GOOGLE_OAUTH_SCOPES = [

// "https%3A//www.googleapis.com/auth/userinfo.email",

// "https%3A//www.googleapis.com/auth/userinfo.profile",

// ];

// app.get("/login", async (req, res) => {
//   const state = "some_state";
//   const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
//   const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
//   res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
// });
app.use('/',userRouter);

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
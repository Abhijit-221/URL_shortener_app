const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://abhijit2017:Qwertyuiop@cluster0.mtljto2.mongodb.net/URL_shortener')
.then(()=>{
    console.log('Mongodb connected successfully.')
}).catch((error)=>{
    console.log('MongoDB connection error:',error.message);
})
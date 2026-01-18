const express =require('express');
const cors=require('cors');
const problemRoutes=require("./routes/problemRoutes");
const app=express();
//Middleware
app.use(cors());
app.use(express.json());
//Routes
app.use('/api/problems',problemRoutes);
module.exports=app;

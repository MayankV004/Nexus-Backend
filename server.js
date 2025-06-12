import express from 'express'
import connectDB from './config/db.js';

const app = express();

connectDB()

app.get('/',(req,res)=>{
    res.send("Server is Running!")
})

app.listen(5000, ()=>{
    console.log("Server is Running on PORT 5000!")
})
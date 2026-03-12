// Import Packages
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from 'dotenv';
dotenv.config();



// Import Routes
import authRouter from "./src/routes/auth.route.js";
import cloundAccountRouter from './src/routes/cloudAccount.route.js';



const app = express();


app.use(express.json());
app.use(bodyParser.json({ limit: "4kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "4kb" }));
app.use(cookieParser());


// Routing APIs
app.use('/auth',authRouter);

app.use('/cloudAccount',cloundAccountRouter);


const PORT = process.env.PORT || 4444;
mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(PORT,()=>{
            console.log(`Server Started at ${PORT}`);
        });        
    })
    .catch(err => console.log("❌ DB Error:", err));    


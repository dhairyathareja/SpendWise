import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from 'dotenv';
dotenv.config();




const app = express();


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(bodyParser.json({ limit: "4kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "4kb" }));
app.use(cookieParser());


// app.use(express.static(path.join(__dirname, '../public/build')));





// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../frontend/build/index.js'));
// });


const PORT = process.env.PORT || 4444;
mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(PORT,()=>{
            console.log(`Server Started at ${PORT}`);
        });        
    })
    .catch(err => console.log("❌ DB Error:", err));    


// tests auto docs test
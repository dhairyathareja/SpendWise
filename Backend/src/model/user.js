import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;

const userSchema= new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    organization: {
        type: String, 
        required: true,
    },
    refreshToken: {
        type: String
    },
    createdAt:{
        type: Date,
        default:Date.now
    },
    role:{
        type:'string',
        default:'member'
    }
})



const User = mongoose.model("User", userSchema);
export default User
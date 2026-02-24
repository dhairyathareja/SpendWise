import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
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
        type:String,
        default:'member'
    }
})


userSchema.pre('save', async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});




userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    const user = this; 
    return await bcrypt.compare(enteredPassword,user.password);
}    

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            userId: this._id
        },
        process.env.REFRESH_TOKEN_KEY
        ,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        });
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_KEY
        ,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        });
}


const User = mongoose.model("User", userSchema);
export default User
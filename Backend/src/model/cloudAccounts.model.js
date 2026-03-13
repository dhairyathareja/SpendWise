import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema({

    userId:{
        type:String,
        required:true,
        trim: true
    },
    accountName:{
        type:String,
        required:true,
        trim: true
    },
    provider: {
        type:String,
        default:"aws"
    },
    roleArn:{
        type:String,
        required:true,
        trim: true,
        unique:true
    },
    status: {
        type:String,
        required:true,
        default:"failed"
    },
    scanHistory:[
        {
            scanId:{
                type: String,
                required: true
            },
            scanDate:{
                type: Date,
                required: true
            }
        }
    ],
    createdAt:{
        type: Date,
        default:Date.now
    }
})

const Accounts = mongoose.model("Accounts",accountSchema);
export default Accounts;
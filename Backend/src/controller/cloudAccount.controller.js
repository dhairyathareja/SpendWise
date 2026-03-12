import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand
} from "@aws-sdk/client-sts";
import Accounts from "../model/cloudAccounts.model.js";


export const connectAccount = ErrorWrapper(async (req,res,next) => {
    
    const sts = new STSClient({ region: process.env.AWS_REGION });

    const {roleArn,accountName}=req.body;
    let identity;
    
    try {
        
        const assume = await sts.send(new AssumeRoleCommand({
            RoleArn: roleArn,
            RoleSessionName: "SpendWiseSession"
        }));

        const creds = assume.Credentials;

        // create STS client with assumed credentials
        const assumedSTS = new STSClient({
            region: "ap-south-1",
            credentials: {
            accessKeyId: creds.AccessKeyId,
            secretAccessKey: creds.SecretAccessKey,
            sessionToken: creds.SessionToken
            }
        });

        // verify identity
        identity = await assumedSTS.send(
            new GetCallerIdentityCommand({})
        );


    } catch (error) {
        throw new ErrorHandler(401,`Error in connecting to your account`);
    }

    try {
        
        const account=await Accounts.create({
            userId:identity.Account,
            accountName:accountName,
            roleArn:roleArn,
            status:"Connected"
        });

        res.status(200)
        .json({
            success:true,
            message:`Account ${identity.Account} Connected Successfuly`
        })

    } catch (error) {
        throw new ErrorHandler(501,`Database Error, contact Error`);
    }
    
    
})

export const removeAccount = ErrorWrapper(async (req,res,next) => {

    const{accountId}=req.body;
    
    try {

        await Accounts.deleteOne({_id:accountId});

        res.status(200)
        .json({
            success:true,
            message:`Account ${accountId} deleted Successfully`
        })
        
    } catch (error) {
        throw new ErrorHandler(501,error.message);
    }


})
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";



const sesClient = new SESv2Client({
  region: process.env.AWS_REGION,
});

export const sendCostAlertEmail = ErrorWrapper( async (req,res,next) => {
    
    const {userEmail} = req.body;
    
  try {
    const params = {
      FromEmailAddress: process.env.SENDER_EMAIL, 
      Destination: {
        ToAddresses: [userEmail],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "⚠️ SpendWise Alert – Resource Optimization Needed",
          },
          Body: {
            Html: {
              Data: `
                <h2>SpendWise Alert 🚨</h2>
                <p>Hey User,</p>

                <p>We detected an inefficient resource in your cloud account:</p>

                <ul>
                  <li><b>Resource:</b> </li>
                  <li><b>Usage:</b> </li>
                  <li><b>Estimated Savings:</b> </li>
                </ul>

                <p><b>Recommendation:</b> </p>

                <hr/>
                <p>– Team SpendWise</p>
              `,
            },
            Text: {
              Data: `
SpendWise Alert

Resource: 
Usage: 
Savings: 

Recommendation: 
              `,
            },
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    res.status(200).json({
        message:"Notification Sent Successfully",
        success:true
    })
    

  } catch (error) {
    console.error("FULL ERROR:", error);
    throw new ErrorHandler(401,error.message);
  }


});
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION,
});

export const sendCostAlert = async ({
  userEmail,
  resource,
  usage,
  savings,
  recommendation,
}) => {
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

                <p>We detected an inefficient resource:</p>

                <ul>
                  <li><b>Resource:</b> ${resource}</li>
                  <li><b>Usage:</b> ${usage}</li>
                  <li><b>Estimated Savings:</b> ${savings}</li>
                </ul>

                <p><b>Recommendation:</b> ${recommendation}</p>

                <hr/>
                <p>– Team SpendWise</p>
              `,
            },
            Text: {
              Data: `
SpendWise Alert

Resource: ${resource}
Usage: ${usage}
Savings: ${savings}

Recommendation: ${recommendation}
              `,
            },
          },
        }, 
      },
    };

    console.log("Params", params)
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("SES RESPONSE:", response);


  } catch (error) {
    console.error("Email Error:", error);
  }
};

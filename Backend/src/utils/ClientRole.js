import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export async function assumeClientRole(roleArn){

    const sts = new STSClient({ region: process.env.AWS_REGION });

    const assume = await sts.send(new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: "SpendWiseSession"
    }));

    return {
        accessKeyId: assume.Credentials.AccessKeyId,
        secretAccessKey: assume.Credentials.SecretAccessKey,
        sessionToken: assume.Credentials.SessionToken
    };
}
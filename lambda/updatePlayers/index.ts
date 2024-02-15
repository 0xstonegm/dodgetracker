import { Handler } from "aws-lambda";

export const handler: Handler = async () => {
    console.log("Running function...");
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Players updated" }),
    };
};

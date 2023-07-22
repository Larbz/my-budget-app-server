import "dotenv/config";

interface Config {
    PORT: string;
    MONGO_URL: string;
    SECRET_KEY: string;
    REFRESH_KEY: string;
    AWS_BUCKET_NAME: string;
    AWS_BUCKET_REGION: string;
    AWS_PUBLIC_KEY: string;
    AWS_SECRET_KEY: string;
    ENVIRONMENT: string;
}

export const config: Config = {
    PORT: process.env.PORT || "",
    MONGO_URL: process.env.MONGO_URL || "",
    SECRET_KEY: process.env.SECRET_KEY || "",
    REFRESH_KEY: process.env.REFRESH_KEY || "",
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",
    AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION || "",
    AWS_PUBLIC_KEY: process.env.AWS_PUBLIC_KEY || "",
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || "",
    ENVIRONMENT: process.env.ENVIRONMENT || "",
};

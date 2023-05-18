declare namespace Express {
    export interface Request {
        userId: string;
        csrf:string;
    }
}

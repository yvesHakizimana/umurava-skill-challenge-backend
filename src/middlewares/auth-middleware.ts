import {NextFunction, Request, Response} from "express";
import {verify} from "jsonwebtoken";
import HttpException from "@exceptions/http-exception";
import {ACCESS_TOKEN_SECRET_KEY} from "@config";

interface UserPayload {
    userId: string;
    isAdmin: boolean;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}


const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.get("Authorization");

        if(!authHeader) next(new HttpException(401, "Unauthorized: Token missing or invalid."));

        const token = authHeader.split(" ")[1]

        req.currentUser = verify(token, ACCESS_TOKEN_SECRET_KEY) as UserPayload;

        next()
    } catch (error) {
        next(new HttpException(401, "Invalid Jwt token."))
    }
}

export default authMiddleware;
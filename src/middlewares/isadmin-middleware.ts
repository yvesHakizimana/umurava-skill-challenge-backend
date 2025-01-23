import {NextFunction, Request, Response} from "express";
import HttpException from "@exceptions/http-exception";

const isAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.currentUser) next(new HttpException(401, "Unauthorized: No user logged in"));

        if(!req.currentUser.isAdmin) next(new HttpException(403, "Forbidden: Admin Access required to perform that action."));

        next()

    } catch(error){
        next(new HttpException(401, "Unauthorized: You are required to perform full authentication"));
    }
}

export default isAdminMiddleware;
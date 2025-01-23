import HttpException from "@exceptions/http-exception";
import {NextFunction, Request, Response} from "express";
import {logger} from "@utils/logger";

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {

    const statusCode = error.status || 500
    const message = error.message || "Internal Server Error.";

    logger.error(`${req.method} ${req.path}  ${statusCode}  message: ${message}`)
    res.status(statusCode).json({message})

}

export default errorMiddleware;
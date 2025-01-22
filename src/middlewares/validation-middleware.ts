import {RequestHandler} from "express";
import {validate, ValidationError} from "class-validator";
import {plainToInstance} from "class-transformer";
import HttpException from "@exceptions/http-exception";

const validationMiddleware = (
    type: any,
    value: string | 'body' | 'query' | 'params' = 'body',
    skipMissingProperties: boolean = false,
    whitelist: boolean = true,
    forbidNonWhitelisted = false
): RequestHandler => {
    return (req, res, next) => {
        validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted })
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            });
    }
}

export default validationMiddleware;

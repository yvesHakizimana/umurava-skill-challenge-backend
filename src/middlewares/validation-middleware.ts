import { RequestHandler } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import HttpException from "@exceptions/http-exception";

const validationMiddleware = (
    type: any,
    value: 'body' | 'query' | 'params' = 'body',
    skipMissingProperties: boolean = false,
    whitelist: boolean = true,
    forbidNonWhitelisted: boolean = false
): RequestHandler => {
    return async (req, res, next) => {
        try {
            // Transform request data to an instance of the provided type
            const transformed = plainToInstance(type, req[value]);

            // Validate the transformed data
            const errors = await validate(transformed, {
                skipMissingProperties,
                whitelist,
                forbidNonWhitelisted,
            });

            if (errors.length > 0) {
                // Extract and format error messages
                const message = errors
                    .map((error: ValidationError) =>
                        error.constraints ? Object.values(error.constraints).join(', ') : 'Invalid input'
                    )
                    .join(', ');

                // Pass error to the next middleware
                return next(new HttpException(400, message));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default validationMiddleware;

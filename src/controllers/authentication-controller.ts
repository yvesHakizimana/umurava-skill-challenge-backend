import AuthService from "@services/auth-service";
import {NextFunction, Request, Response} from "express";

export default class AuthenticationController {
    private authService: AuthService = new AuthService();

    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRequestData = req.body;
            const userSaved = await this.authService.signup(userRequestData);

            res.status(200).json({
                data: userSaved,
                message: "Sign up went successfully"
            });
        } catch (error){
            next(error)
        }

    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authenticateUserRequest = req.body
            const token =  await this.authService.authenticateUser(authenticateUserRequest);

            res.status(200).json({
                data: token,
                message: "Authentication went successfully",
            })
        } catch (error){
            next(error)
        }

    }
}
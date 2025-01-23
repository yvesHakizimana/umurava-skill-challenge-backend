import {Router} from "express";
import {IRouter} from "@routes/router-interface";
import validationMiddleware from "@middlewares/validation-middleware";
import AuthenticationController from "@controllers/authentication-controller";
import {AuthenticateUserDto, RegisterUserDto} from "@dtos/auth-dtos";


export default class AuthRouter implements IRouter {
    public path = '/auth';
    public router = Router();
    public authController = new AuthenticationController();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/signup`, validationMiddleware(RegisterUserDto, 'body') , this.authController.signup);
        this.router.post(`${this.path}/login`, validationMiddleware(AuthenticateUserDto, 'body') ,this.authController.login);
    }
}
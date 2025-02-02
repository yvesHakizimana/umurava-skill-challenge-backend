import {IRouter} from "@routes/router-interface";
import {Router} from "express";
import ChallengeController from "@controllers/challenge-controller";
import authMiddleware from "@middlewares/auth-middleware";
import isAdminMiddleware from "@middlewares/isadmin-middleware";

export default class AdminRouter implements IRouter {
    public path = '/admin';
    public router = Router();
    public challengeController = new ChallengeController();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes(){
        this.router.get(
            `${this.path}/stats`,
            authMiddleware,
            isAdminMiddleware,
            this.challengeController.getChallengeStatistics
        )
    }
}
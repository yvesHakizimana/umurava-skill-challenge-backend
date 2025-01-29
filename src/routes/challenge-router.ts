import {Router} from "express";
import {IRouter} from "@routes/router-interface";
import ChallengeController from "@controllers/challenge-controller";
import validationMiddleware from "@middlewares/validation-middleware";
import {CreateChallengeDto, UpdateChallengeDto} from "@dtos/challenge-dtos";
import authMiddleware from "@middlewares/auth-middleware";
import isAdminMiddleware from "@middlewares/isadmin-middleware";


export default class ChallengeRouter implements IRouter {
    public path = '/challenges';
    public router = Router();
    public challengeController = new ChallengeController();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`,this.challengeController.getAllChallenges);
        this.router.get(`${this.path}/:challengeId`, authMiddleware, this.challengeController.getChallengeById);
        this.router.post(`${this.path}`, authMiddleware, isAdminMiddleware, validationMiddleware(CreateChallengeDto, 'body') ,  this.challengeController.createChallenge);
        this.router.put(`${this.path}/:challengeId`, authMiddleware, isAdminMiddleware, validationMiddleware(UpdateChallengeDto, 'body'), this.challengeController.updateChallengeById)
        this.router.delete(`${this.path}/:challengeId`, authMiddleware, isAdminMiddleware,  this.challengeController.deleteChallengeById);
    }
}
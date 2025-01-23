import express, {Router} from "express";
import {IRouter} from "@routes/router-interface";
import ChallengeController from "@controllers/challenge-controller";
import validationMiddleware from "@middlewares/validation-middleware";
import {CreateChallengeDto} from "@dtos/challenge-dtos";


export default class ChallengeRouter implements IRouter {
    public path = '/challenges';
    public router = Router();
    public challengeController = new ChallengeController();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`,this.challengeController.getAllChallenges);
        this.router.get(`${this.path}/:challengeId`, this.challengeController.getChallengeById);
        this.router.post(`${this.path}`, validationMiddleware(CreateChallengeDto, 'body') ,  this.challengeController.createChallenge);
        this.router.patch(`${this.path}/:challengeId`, this.challengeController.updateChallengeById)
        this.router.delete(`${this.path}/:challengeId`, this.challengeController.deleteChallengeById);
    }
}
import express, {Router} from "express";
import {IRouter} from "@routes/router-interface";
import ChallengeController from "@controllers/challenge-controller";


export default class ChallengeRouter implements IRouter {
    public path = '/auth/';
    public router = Router();
    public challengeController = new ChallengeController();

    constructor() {

    }

    private initializeRoutes() {
        this.router.get("", this.challengeController.getAllChallenges);
        this.router.get("", this.challengeController.getAllChallenges);
        this.router.post("")
        this.router.patch("")
        this.router.delete("")
    }


}
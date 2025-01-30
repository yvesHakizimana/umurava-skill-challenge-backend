import {Router} from "express";
import {IRouter} from "@routes/router-interface";
import ChallengeController from "@controllers/challenge-controller";
import validationMiddleware from "@middlewares/validation-middleware";
import {
    CreateChallengeDto,
    ChallengePaginationData,
    ParticipateToChallengeDto,
    UpdateChallengeDto,
    StatsQueryData
} from "@dtos/challenge-dtos";
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
        // Getting all challenges but with pagination.
        this.router.get(
            `${this.path}`,
            this.challengeController.getAllChallenges
        );

        // Getting a specific challenge details.
        this.router.get(
            `${this.path}/:challengeId`,
            authMiddleware,
            this.challengeController.getChallengeById
        );

        // Getting all participants participated/ participating on the challenge.
        // ::todo:: not documented.
        this.router.get(
            `${this.path}/:challengeId/participants`,
            authMiddleware,
            isAdminMiddleware,
            this.challengeController.getParticipantDetails
        )

        // ::todo:: not documented.
        this.router.get(
            `${this.path}/stats`,
            authMiddleware,
            isAdminMiddleware,
            validationMiddleware(StatsQueryData, 'query'),
            this.challengeController.getChallengeStats
        )

        // Creating a new challenge which will be done by the admin.
        this.router.post(
            `${this.path}`,
            authMiddleware,
            isAdminMiddleware,
            validationMiddleware(CreateChallengeDto, 'body') ,
            this.challengeController.createChallenge);

        // This is for someone who starts the challenge/ requests to start it
        // todo:: not documented.
        this.router.patch(
            `${this.path}/:challengeId/participate`,
            authMiddleware,
            validationMiddleware(ParticipateToChallengeDto, 'params'),
            this.challengeController.startChallenge)

        // This route is for admin who will update the challenge details.
        this.router.put(
            `${this.path}/:challengeId`,
            authMiddleware,
            isAdminMiddleware,
            validationMiddleware(UpdateChallengeDto, 'body'),
            this.challengeController.updateChallengeById)

        // this route is for admin who will delete the challenge he/she created.
        this.router.delete(
            `${this.path}/:challengeId`,
            authMiddleware,
            isAdminMiddleware,
            this.challengeController.deleteChallengeById);
    }
}
import ChallengeService from "@services/challenge-service";
import {NextFunction, Request, Response} from "express";

export default class ChallengeController {
    private challengeService: ChallengeService = new ChallengeService();

    createChallenge = async (req: Request, res: Response, next: NextFunction) => {}
    getChallengeById = async (q: Request, res: Response, next: NextFunction) => {}
    getAllChallenges= async (q: Request, res: Response, next: NextFunction) => {}
    updateChallengeById= async (q: Request, res: Response, next: NextFunction) => {}
    deleteChallengeById = async (q: Request, res: Response, next: NextFunction) => {}
}
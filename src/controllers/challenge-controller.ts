import ChallengeService from "@services/challenge-service";
import {NextFunction, Request, Response} from "express";

export default class ChallengeController {
    private challengeService: ChallengeService = new ChallengeService();

    startChallenge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {challengeId} = req.params;
            const challengeUpdated = await this.challengeService.startChallenge(challengeId, req.currentUser.userId)
            res.status(200).json(
                { message: "Added to challenge participants successfully", challenge: challengeUpdated })
        } catch (error){
            next(error)
        }
    }

    createChallenge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const challengeCreated = await this.challengeService.createChallenge(req.body, req.currentUser.userId);
            res.status(200).json(
                { message: "Challenge is being created successfully", challenge: challengeCreated })
        } catch (error){
            next(error)
        }
    }

    getChallengeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {challengeId} = req.params;

            const challengeFromDb = await this.challengeService.getChallenge(challengeId);

            res.status(200).json({ message: "Challenge is being retrieved successfully", data: challengeFromDb})
        } catch (err){
            next(err)
        }
    }

    getAllChallenges= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.params.page as string) || 1;
            const limit = parseInt(req.params.limit as string) || 10;
            const status = req.params.status;
            const result = await this.challengeService.getAllChallenges(page, limit, status);
            res.status(200).json(result);
        } catch (error){
            next(error)
        }

    }

    updateChallengeById= async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Getting the params.
            const {challengeId} = req.params;

            const updatedChallenge = await this.challengeService.updateChallengeById(challengeId, req.body);

            res.status(200).json({ message: "Challenge is being updated successfully", data: updatedChallenge });
        } catch (error){
            next(error)
        }
    }

    deleteChallengeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {challengeId} = req.params;
            await this.challengeService.deleteChallengeById(challengeId);
            res.status(200).json({ message: "Challenge was deleted successfully"})
        } catch (error){
            next(error)
        }
    }
}
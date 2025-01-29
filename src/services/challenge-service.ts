import {CreateChallengeDto, UpdateChallengeDto} from "@dtos/challenge-dtos";
import {isEmpty} from "@utils/is-empty";
import HttpException from "@exceptions/http-exception";
import ChallengeModel from "@models/challenge-model"
import {isValidObjectId, Types} from "mongoose";
import {removeScheduledCompletion, rescheduleChallengeCompletion, scheduleChallengeCompletion} from "@utils/scheduler";

export default class ChallengeService {

    public async createChallenge(challengeRequest: CreateChallengeDto, createdBy: string){
        if(isEmpty(challengeRequest)) throw new HttpException(400, "Challenge request is empty");
        const challenge = await ChallengeModel.create({...challengeRequest, createdBy})
        await scheduleChallengeCompletion(challenge._id as string, challenge.deadline)
        return challenge
    }

    public async getAllChallenges(){
        return ChallengeModel.find();
    }

    public async getChallenge(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty")

        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        const challengeFromDb = await ChallengeModel.findById(challengeId);

        if(!challengeFromDb) throw new HttpException(400, "Challenge does not exist");

        return challengeFromDb
    }

    public async updateChallengeById(challengeId: string, updateChallengeDto: UpdateChallengeDto){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");

        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        const challengeFromDb = await ChallengeModel.findById(challengeId);

        if(!challengeFromDb) throw new HttpException(400, "Challenge does not exist");

        // Update the challenge
        const updatedChallenge = await ChallengeModel.findByIdAndUpdate(challengeId, {
            $set: {
                ...updateChallengeDto,
            }
        }, {new: true});

        //
        await rescheduleChallengeCompletion(challengeFromDb._id as string, updatedChallenge.deadline)
        return updatedChallenge
    }

    public async deleteChallengeById(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");

        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        const deletedChallenge = await ChallengeModel.findByIdAndDelete(challengeId)
        await removeScheduledCompletion(deletedChallenge._id as string)
        return deletedChallenge
    }

    public async startChallenge(challengeId: string, participantId: string){
        if(!isValidObjectId(challengeId) || !isValidObjectId(participantId))
            throw new HttpException(400, "Invalid participant or challengeIds.")

        const challenge = await ChallengeModel.findById(challengeId);
        if(!challenge) throw new HttpException(400, "Challenge does not exist");

        // Checking whether the challenge has ended.
        if(challenge.status === 'completed')
            throw new HttpException(400, "The challenge has already ended.")

        // @ts-ignore
        if(challenge.participants.includes(participantId)){
            throw new HttpException(400, "You have already joined the challenge.");
        }

        const isFirstParticipant = challenge.participants.length === 0
        const update: {
            $addToSet: {participants: string},
            $set?: {status: 'open' | 'ongoing' | 'completed'}
        } = {$addToSet: {participants: participantId}}
        if(isFirstParticipant){
            update.$set = {status: "ongoing"};
        }

        return ChallengeModel.findByIdAndUpdate(
            challengeId,
            update,
            {new: true}
        );
    }
}
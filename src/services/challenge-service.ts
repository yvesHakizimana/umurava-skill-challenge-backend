import {CreateChallengeDto, UpdateChallengeDto} from "@dtos/challenge-dtos";
import {isEmpty} from "@utils/is-empty";
import HttpException from "@exceptions/http-exception";
import ChallengeModel, {IChallenge} from "@models/challenge-model"

export default class ChallengeService {

    public async createChallenge(challengeRequest: CreateChallengeDto){
        if(isEmpty(challengeRequest)) throw new HttpException(400, "Challenge request is empty");

        return ChallengeModel.create({...challengeRequest});
    }

    public async getAllChallenges(){
        return ChallengeModel.find();
    }

    public async getChallenge(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");

        const challengeFromDb = await ChallengeModel.findById(challengeId);

        if(!challengeFromDb) throw new HttpException(400, "Challenge does not exist");

        return challengeFromDb
    }

    public async updateChallengeById(challengeId: string, updateChallengeDto: UpdateChallengeDto){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");

        const challengeFromDb = await ChallengeModel.findById(challengeId);

        // Update the challenge
        const updatedChallenge = await ChallengeModel.findByIdAndUpdate(challengeId, {
            $set: {
                ...updateChallengeDto,
            }
        }, {new: true})


        if(!challengeFromDb) throw new HttpException(400, "Challenge does not exist");

        return updatedChallenge


    }

    public async deleteChallengeById(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");

        return ChallengeModel.findByIdAndDelete(challengeId)
    }
}
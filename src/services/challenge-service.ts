import {CreateChallengeDto} from "@dtos/challenge-dtos";
import {isEmpty} from "@utils/is-empty";
import HttpException from "@exceptions/http-exception";
import ChallengeModel from "@models/challenge-model"

export default class ChallengeService {

    public async createChallenge(challengeRequest: CreateChallengeDto){
        if(isEmpty(challengeRequest)) throw new HttpException(400, "Challenge request is empty");

        return ChallengeModel.create(challengeRequest)
    }

    public async getChallenge(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");
        return ChallengeModel.findById(challengeId)
    }

    public async getAllChallenges(){
        return ChallengeModel.find();
    }
}
import {CreateChallengeDto, UpdateChallengeDto} from "@dtos/challenge-dtos";
import {isEmpty} from "@utils/is-empty";
import HttpException from "@exceptions/http-exception";
import ChallengeModel from "@models/challenge-model"
import {isValidObjectId} from "mongoose";

export default class ChallengeService {

    /*

    the challengeService level

    * todo.2:: Getting all challenges created by a certain admin
    * todo.3:: Getting all challenges without the one who created them
    * todo.4:: How can I track the one who clicked on the challenge so as to
               keep the one who is currently participating on the challenge.
               so as to view the one challenge and also the currently active
               participants of the challenge.

    * todo.5:: Maintaining real-time data statistics
    * */

    public async createChallenge(challengeRequest: CreateChallengeDto, createdBy: string){
        if(isEmpty(challengeRequest)) throw new HttpException(400, "Challenge request is empty");

        return ChallengeModel.create({...challengeRequest, createdBy});
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

        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        return ChallengeModel.findByIdAndDelete(challengeId)
    }
}
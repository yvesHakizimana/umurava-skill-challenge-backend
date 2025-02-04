import {CreateChallengeDto, UpdateChallengeDto} from "@dtos/challenge-dtos";
import {isEmpty} from "@utils/is-empty";
import HttpException from "@exceptions/http-exception";
import ChallengeModel from "@models/challenge-model"
import {isValidObjectId, Types} from "mongoose";
import {removeScheduledCompletion, rescheduleChallengeCompletion, scheduleChallengeCompletion} from "@utils/challenge-completion-scheduler";
import {aggregateStats, ChallengeStat, DateRange, getDateRanges} from "@models/statistics-model";
import {logger} from "@utils/logger";

export default class ChallengeService {

    public async createChallenge(challengeRequest: CreateChallengeDto, createdBy: string){
        if(isEmpty(challengeRequest)) throw new HttpException(400, "Challenge request is empty");
        const challenge = await ChallengeModel.create({...challengeRequest, createdBy})

        try {
            await scheduleChallengeCompletion(challenge._id as string, challenge.deadline)
        } catch (error){
            logger.error(`reschedule challenge completion failed for ${ challenge._id as string }`, error);
        }
        return challenge
    }

    public async getAllChallenges(page: number = 1, limit: number = 6, status?: string){
        // Validation of the page and limit
        if(page < 1) throw new HttpException(400, "Page must be greater than 0.")
        if(limit < 1) throw new HttpException(400, "Limit must be greater than 0.")

        // Build the query
        const query: any = {}
        if(status)
            query.status = status;

        // The skip value.
        const skip = (page - 1) * limit;

        const challenges = await ChallengeModel
            .find(query)
            .sort({deadline: 1})
            .skip(skip)
            .limit(limit)
            .exec()

        const totalChallenges = await ChallengeModel.countDocuments(query)

        return {
            data: challenges,
            pagination: {
                page,
                limit,
                totalChallenges,
                totalPages: Math.ceil(totalChallenges / limit),
            }
        }
    }

    public async getChallenge(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty")

        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        const challengeFromDb = await ChallengeModel.findById(challengeId);

        if(!challengeFromDb) throw new HttpException(400, "Challenge does not exist");

        return challengeFromDb
    }

    public async updateChallengeById(challengeId: string, updateChallengeDto: Partial<UpdateChallengeDto>){
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
        try {
            await rescheduleChallengeCompletion(challengeFromDb._id as string, updatedChallenge.deadline)
        } catch (error){
            logger.error(`reschedule challenge completion failed for ${ challengeId }`, error);
        }
        return updatedChallenge
    }

    public async deleteChallengeById(challengeId: string){
        if(isEmpty(challengeId)) throw new HttpException(400, "ChallengeId is empty");

        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        const deletedChallenge = await ChallengeModel.findByIdAndDelete(challengeId);

        if(!deletedChallenge)
            throw new HttpException(404, `Challenge ${challengeId} not found.`);

        try {
            await removeScheduledCompletion(deletedChallenge._id as string)
        } catch (error){
            logger.error(`Cleanup failed for ${ challengeId }`, error);
        }
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

    public async getParticipantDetails(challengeId: string, page: number = 1, limit: number = 6){
        if(!isValidObjectId(challengeId)) throw new HttpException(400, "Invalid challengeId format")

        if (page < 1) throw new HttpException(400, "Invalid page number")
        if (limit < 1) throw new HttpException(400, "Invalid limit number")

        return ChallengeModel.aggregate([
            { $match: { _id: new Types.ObjectId(challengeId) }},
            { $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participantsData',
                }},
            { $project: {
                    _id: 1,
                    participants: {
                        $slice: [
                            { $map: {
                                    input: '$participantsData',
                                    as: 'participant',
                                    in: {
                                        fullName: { $concat: ['$$participant.firstName', ' ', '$$participant.lastName'] },
                                        email: '$$participant.email'
                                    }
                                }},
                            (page - 1) * limit,
                            limit
                        ]
                    },
                    totalParticipants: { $size: '$participantsData' },
                }}
        ]);
    }

    public async getChallengeStats(filter: string){
        // Get the date ranges.
        const {current, previous } = getDateRanges(filter);

        const [currentStats, previousStats] = await Promise.all([
            this.getCombinedStats(current),
            this.getCombinedStats(previous),
        ])

        return this.calculateStatsResponse(currentStats, previousStats)
    }

    public async getTalentStatistics(talentId: string){
        if(!isValidObjectId(talentId)) throw new HttpException(400, "Invalid talent id format")

        const openChallenges = await ChallengeModel.countDocuments({
            status: 'open',
            participants: {$size: 0}
        })

        const ongoingChallenges = await ChallengeModel.countDocuments({
            status: 'ongoing',
            participants: talentId,
            deadline: {$gte: new Date()},
        })

        const completedChallenges = await ChallengeModel.countDocuments({
            participants: talentId,
            deadline: {$lte: new Date()},
        })

        const allChallenges = openChallenges + ongoingChallenges + completedChallenges

        return {
            allChallenges,
            openChallenges,
            ongoingChallenges,
            completedChallenges,
        }
    }

    public async checkParticipationStatus(challengeId: string, participantId: string){
        let isParticipating = false
        if(!isValidObjectId(challengeId) || !isValidObjectId(participantId))
            throw new HttpException(400, "Invalid participant or challengeIds.")

        const challenge = await ChallengeModel.findById(challengeId);
        if(!challenge) throw new HttpException(400, "Challenge does not exist");

        // @ts-ignore
        if(challenge.participants.includes(participantId)){
            isParticipating = true
        }
        return isParticipating
    }

    private async getCombinedStats(range: DateRange){
        try {
            const precomputed = await ChallengeStat.findOne({
                periodStart: { $lte: range.start },
                periodEnd: { $lte: range.end },
            })

            if(precomputed)
                return precomputed.toObject()

            // Fallback to real-time aggregation.
            const [realTimeStats] = await aggregateStats(range);
            return realTimeStats || this.getEmptyStats()
        } catch (error){
            throw new HttpException(500, "Error retrieving the statistics.");
        }
    }

    private calculateStatsResponse(current: any, previous: any){
        return {
            totalChallenges: this.calculateMetric("totalChallenges", current, previous),
            totalParticipants: this.calculateMetric("totalParticipants", current, previous),
            completedChallenges: this.calculateMetric("completedChallenges", current, previous),
            openChallenges: this.calculateMetric("openChallenges", current, previous),
            onGoingChallenges: this.calculateMetric("onGoingChallenges", current, previous),
        }
    }

    private calculateMetric(metric: string, current: any, previous: any){
        const currentVal = current[metric] || 0
        const previousVal = previous[metric] || 0

        return {
            current: currentVal,
            previous: previousVal,
            changePercent: this.calculatePercentage(currentVal, previousVal),
        }
    }

    private calculatePercentage(current: number, previous: number){
        if (previous === 0) return current > 0 ? 100 : 0
        return Number(((current - previous) /  previous * 100)).toFixed(2)
    }

    private getEmptyStats(){
        return {
            totalChallenges: 0,
            completedChallenges: 0,
            openChallenges: 0,
            onGoingChallenges: 0,
            totalParticipants: 0
        }
    }
}
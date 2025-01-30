import {Document, model, Schema} from 'mongoose'
import ChallengeModel from "@models/challenge-model";

export interface DateRange {
    start: Date
    end: Date
}

interface StatDocument extends  Document {
    periodStart: Date
    periodEnd: Date
    totalChallenges: number
    completedChallenges: number
    openChallenges: number
    onGoingChallenges: number
    totalParticipants: number
}

const StatSchema = new Schema<StatDocument>({
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    totalChallenges: { type: Number, required: true },
    completedChallenges: { type: Number, required: true },
    openChallenges: { type: Number, required: true },
    onGoingChallenges: { type: Number, required: true },
    totalParticipants: { type: Number, required: true },
})

export const ChallengeStat = model<StatDocument>('ChallengeStats', StatSchema)

const getWeekRange = (date: Date) : DateRange => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    return {start, end}
}

export function getDateRanges(filter: string): {current: DateRange, previous: DateRange} {
    const now = new Date()

    switch (filter) {
        case 'this_week':
            return {
                current: getWeekRange(now),
                previous: getWeekRange(new Date(now.setDate(now.getDate() - 7)))
            }
        case 'last_30_days':
            return {
                current: { start: new Date(now.setDate(now.getDate() - 30)), end: new Date()},
                previous: { start: new Date(now.setDate(now.getDate() - 60)), end: new Date(now.setDate(now.getDate() - 30))},
            }
    }
}

export async function aggregateStats(range: DateRange) {
    return ChallengeModel.aggregate([
        {
            $match: {
                createdAt: { $gte: range.start, $lte: range.end }
            }
        },
        {
            $facet: {
                totalChallenges: [{ $count: "count" }],
                completedChallenges: [{ $match: { status: 'completed' } }, { $count: "count" }],
                openChallenges: [{ $match: { status: 'open' } }, { $count: "count" }],
                onGoingChallenges: [{ $match: { status: 'ongoing' } }, { $count: "count" }],
                totalParticipants: [
                    { $group: { _id: null, uniqueParticipants: { $addToSet: "$participants" } } },
                    { $project: { total: { $size: "$uniqueParticipants" } } }
                ]
            }
        },
        {
            $project: {
                totalChallenges: { $arrayElemAt: ["$totalChallenges.count", 0] },
                completedChallenges: { $arrayElemAt: ["$completedChallenges.count", 0] },
                openChallenges: { $arrayElemAt: ["$openChallenges.count", 0] },
                onGoingChallenges: { $arrayElemAt: ["$onGoingChallenges.count", 0] },
                totalParticipants: { $arrayElemAt: ["$totalParticipants.total", 0] }
            }
        }
    ]);
}


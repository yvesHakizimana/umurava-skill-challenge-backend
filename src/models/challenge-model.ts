import {Schema, model,Document, Types} from "mongoose";

export type SeniorityLevel = 'junior' | 'intermediate' | 'senior';

export interface IChallenge extends Document{
    title: string
    deadline: Date
    moneyPrize: string
    contactEmail: string
    projectBrief: string
    projectDescription: string[]
    projectRequirements: string[]
    deliverables: string[],
    createdBy: Types.ObjectId,
    seniorityLevel: SeniorityLevel[],
    skillsNeeded: string[]
}

const ChallengeSchema = new Schema<IChallenge>(
    {
        title: {type: String, required: true},
        deadline: {type: Date, required: true},
        moneyPrize: {type: String, required: true},
        contactEmail: {type: String, required: true},
        projectBrief: {type: String, required: true},
        projectDescription: [{type: String, required: true}],
        projectRequirements: [{type: String, required: true}],
        deliverables: [{type: String, required: true}],
        createdBy: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        seniorityLevel: {
            type: [String],
            required: true,
            enum: ['junior', 'intermediate', 'senior'] as SeniorityLevel[],
        },
        skillsNeeded: [{
            type: String,
            required: true,
        }]
    },
    {
        timestamps: true
    }
)

export default model<IChallenge>("Challenge", ChallengeSchema);
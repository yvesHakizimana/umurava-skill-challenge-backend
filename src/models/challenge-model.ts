import {Document, model, Schema, Types} from "mongoose";

export type SeniorityLevel = 'junior' | 'intermediate' | 'senior';

export type status = 'open' | 'ongoing' |'completed';

export type category = 'design' | 'fronted' | 'backend' | 'fullstack';

export interface IChallenge extends Document{
    title: string
    deadline: Date
    moneyPrize: string
    contactEmail: string
    projectBrief: string
    projectDescription: string[]
    projectRequirements: string[]
    deliverables: string[]
    createdBy: Types.ObjectId
    seniorityLevel: SeniorityLevel[]
    skillsNeeded: string[]
    participants: Types.ObjectId[]
    status: status
    category: category
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
        status: {
            type: String,
            required: false,
            enum: ['open', 'ongoing', 'completed'],
            default: 'open'
        },
        category: {
            type: String,
            required: true,
            enum: ['design','fronted', 'backend','fullstack'],
        },
        seniorityLevel: {
            type: [String],
            required: true,
            enum: ['junior', 'intermediate', 'senior'] as SeniorityLevel[],
        },
        skillsNeeded: [{
            type: String,
            required: true,
        }],
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        }]
    },
    {
        timestamps: true
    }
)

// Index for adding making the queries more performant.
ChallengeSchema.index({ deadline: 1 , status: 1, createdBy: 1 })

export default model<IChallenge>("Challenge", ChallengeSchema);
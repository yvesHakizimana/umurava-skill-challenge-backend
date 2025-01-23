import {Schema, model,Document, Types} from "mongoose";

export interface IChallenge extends Document{
    title: string
    deadline: Date
    moneyPrize: string
    contactEmail: string
    projectBrief: string
    projectDescription: string[]
    projectRequirements: string[]
    deliverables: string[],
    createdBy: Types.ObjectId
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
    },
    {
        timestamps: true
    }
)

export default model<IChallenge>("Challenge", ChallengeSchema);
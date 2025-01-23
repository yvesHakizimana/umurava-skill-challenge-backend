import {model, Schema, Document} from "mongoose";

export interface IUser extends Document {
    firstName: string
    lastName: string
    email: string
    password: string
    isAdmin: boolean
}

const UserSchema = new Schema(
    {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, default: false},
    },
    {
        timestamps: true
    }
)

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
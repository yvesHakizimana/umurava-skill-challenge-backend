import {AuthenticateUserDto, RegisterUserDto} from "@dtos/auth-dtos";
import {isEmpty} from "@utils/is-empty";
import HttpException from "@exceptions/http-exception";
import UserModel from "@models/user-model";
import {compare, hash} from "bcrypt";
import {sign} from "jsonwebtoken";
import {ACCESS_TOKEN_SECRET_KEY} from "@config";

export default class AuthService {
    public async signup(userRequest: RegisterUserDto){
        if(isEmpty(userRequest)) throw new HttpException(400, "User request is empty.");

        const foundUser = await UserModel.findOne({email: userRequest.email});
        if(foundUser) throw new HttpException(400, "The email is already in use.")

        const hashedPassword = await hash(userRequest.password, 10);
        return UserModel.create({...userRequest, password: hashedPassword});
    }

    public async authenticateUser(userRequest: AuthenticateUserDto){
        if(isEmpty(userRequest)) throw new HttpException(400, "User request is empty.");

        const foundUser = await UserModel.findOne({email: userRequest.email});
        if(!foundUser) throw new HttpException(400, "Invalid email or password");

        const isPasswordMatching = await compare(userRequest.password, foundUser.password);
        if(!isPasswordMatching) throw new HttpException(400, "Invalid email or password.");

        const dataStoredInToken: {userId: string, isAdmin: boolean} = {
            userId: foundUser._id as string,
            isAdmin: foundUser.isAdmin
        }

        return {
            token: sign(dataStoredInToken, ACCESS_TOKEN_SECRET_KEY, {expiresIn: "1h"}),
            isAdmin: dataStoredInToken.isAdmin
        }
    }
}
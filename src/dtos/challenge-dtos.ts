import {IsString, IsNotEmpty, IsDate, IsEmail, MaxLength} from "class-validator";

export class CreateChallengeDto {
    @IsString()
    @IsNotEmpty()
    public title: string

    @IsDate()
    public deadline: Date

    @IsString()
    public moneyPrize: string

    @IsEmail()
    public contactEmail: string

    @IsString()
    projectBrief: string

    @MaxLength(20, {each: true})
    projectDescription: string[]

    @MaxLength(20, {each: true})
    projectRequirements: string[]

    @MaxLength(20, {each: true})
    deliverables: string[]
}
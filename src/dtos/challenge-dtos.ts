import {IsEmail, IsNotEmpty, IsString, MaxLength} from "class-validator";

export class CreateChallengeDto {
    @IsString()
    @IsNotEmpty()
    public title: string

    @IsNotEmpty()
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

export class UpdateChallengeDto {
    @IsString()
    title? : string

    @IsNotEmpty()
    deadline? : string

    @IsNotEmpty()
    @IsString()
    moneyPrize? : string

    @IsEmail()
    contactEmail? : string

    @IsString()
    projectBrief?: string

    @MaxLength(20, {each: true})
    projectDescription?: string[]

    @MaxLength(20, {each: true})
    projectRequirements?: string[]

    @MaxLength(20, {each: true})
    deliverables?: string[]
}


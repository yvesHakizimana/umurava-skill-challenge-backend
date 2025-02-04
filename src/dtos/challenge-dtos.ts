import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional, IsPositive,
    IsString,
    MaxLength
} from "class-validator";
import {IsObjectId} from "class-validator-mongo-object-id";

export enum SeniorityLevel {
    JUNIOR='junior',
    INTERMEDIATE='intermediate',
    SENIOR='senior'
}

export enum Status {
    OPEN='open',
    ONGOING='ongoing',
    COMPLETED='completed'
}

export enum StatsFilter {
    THIS_WEEK='this_week',
    LAST_30_DAYS='last_30_days',
}

export enum Category {
    DESIGN='design',
    FRONTEND='frontend',
    BACKEND='backend',
    FULLSTACK='fullstack'
}

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

    @IsArray()
    @MaxLength(255, {each: true})
    projectDescription: string[]

    @IsArray()
    @MaxLength(255, {each: true})
    projectRequirements: string[]

    @IsArray()
    @MaxLength(255, {each: true})
    deliverables: string[]

    @IsArray()
    @ArrayMinSize(1) // Ensure that at least one seniority level is provided.
    @ArrayMaxSize(3) // Ensure no more than three seniority levels are provided.
    @IsEnum(SeniorityLevel, {each: true}) // Validate each value in the array
    public seniorityLevel: SeniorityLevel[] // Must be a set of valid values

    @IsEnum(Category)
    public category: Category

    @IsArray()
    @IsString({each: true})
    @ArrayMinSize(1)
    skillsNeeded: string[]

}

export class UpdateChallengeDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public title: string

    @IsOptional()
    @IsNotEmpty()
    public deadline: Date

    @IsOptional()
    @IsString()
    public moneyPrize: string

    @IsOptional()
    @IsEmail()
    public contactEmail: string

    @IsOptional()
    @IsString()
    projectBrief: string

    @IsOptional()
    @IsArray()
    @MaxLength(255, {each: true})
    projectDescription: string[]

    @IsOptional()
    @IsArray()
    @MaxLength(255, {each: true})
    projectRequirements: string[]

    @IsOptional()
    @IsArray()
    @MaxLength(255, {each: true})
    deliverables: string[]

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1) // Ensure that at least one seniority level is provided.
    @ArrayMaxSize(3) // Ensure no more than three seniority levels are provided.
    @IsEnum(SeniorityLevel, {each: true}) // Validate each value in the array
    public seniorityLevel: SeniorityLevel[] // Must be a set of valid values

    @IsOptional()
    @IsEnum(Category)
    public category: Category

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @ArrayMinSize(1)
    skillsNeeded: string[]
}

export class ParticipateToChallengeDto {
    @IsObjectId()
    challengeId: string
}

export class ChallengePaginationData {
    @IsOptional()
    @IsPositive()
    public page: number = 1

    @IsOptional()
    @IsPositive()
    public limit: number = 6

    @IsOptional()
    @IsEnum(Status)
    public status: 'open' | 'ongoing' | 'completed' = 'open'
}

export class StatsQueryData {
    @IsOptional()
    @IsEnum(StatsFilter)
    public filter: string = "this_week"
}

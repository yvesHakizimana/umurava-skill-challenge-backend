import {IsString, IsNotEmpty, IsEmail, MinLength} from "class-validator";

class UserDto {
    @IsEmail()
    public email: string;

    @IsString()
    @IsNotEmpty({ message: "Password should not be empty."})
    @MinLength(8, {message: "Password should be at least 8 characters."})
    public password: string;
}

export class RegisterUserDto extends UserDto {
    @IsString()
    @IsNotEmpty()
    public firstName: string;

    @IsString()
    @IsNotEmpty()
    public lastName: string
}

export class AuthenticateUserDto extends UserDto {
}
import {afterAll, beforeAll, describe, expect, it} from "vitest";
import {GenericContainer} from "testcontainers";
import AuthService from "@services/auth-service";
import mongoose from "mongoose";
import UserModel from "@models/user-model";
import {AuthenticateUserDto, RegisterUserDto} from "@dtos/auth-dtos";
import HttpException from "@exceptions/http-exception";
import {verify} from "jsonwebtoken"

describe("Authentication service integration tests.", () => {
    let container: Awaited<ReturnType<GenericContainer["start"]>>
    let authService: AuthService

    beforeAll(async () => {
        container = await new GenericContainer("mongo:latest").withExposedPorts(27017).start();
        const uri = `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/test`;
        await mongoose.connect(uri)


        authService = new AuthService()
    }, 120000)

    afterAll(async () => {
        await mongoose.disconnect()
        await container.stop()
    })

    beforeAll(async () => {
        await UserModel.deleteMany({})
    })


    describe("signup", () => {
        const userData: RegisterUserDto = {
            email: "test@example.com",
            password: "password123",
            firstName: "FirstName",
            lastName: "LastName",
        }

        it("creates a new user with the hashed password", async () => {
            const user = await authService.signup(userData);

            expect(user.email).toBe(userData.email);
            expect(user.firstName).toBe(userData.firstName);
            expect(user.isAdmin).toBe(false)

            const dbUser = await UserModel.findById(user._id).exec()
            expect(dbUser).not.toBeNull()
            expect(dbUser?.password).not.toBe(userData.password);
        })

        it("throws an error for emptyRequest", async () => {
           await expect(authService.signup({} as RegisterUserDto)).rejects.toThrow(
               new HttpException(400, "User request is empty.")
           )
        })

        it("throws an error for the duplicate email", async () => {
            await expect(authService.signup(userData)).rejects.toThrow(
                new HttpException(400, "The email is already in use.")
            )
        })
    })

    describe("authenticateUser", () => {
        const userData: RegisterUserDto = {
            email: "test@example.com",
            password: "password123",
            firstName: "FirstName",
            lastName: "LastName",
        }


        it("should return a valid token for correct credentials", async () => {
            const authDto: AuthenticateUserDto = {
                email: userData.email,
                password: userData.password,
            }

            const {token} = await authService.authenticateUser(authDto);

            const payload = verify(token, process.env.ACCESS_TOKEN_SECRET_KEY) as {
                userId: string;
                isAdmin: boolean;
            }

            const user = await UserModel.findOne({email: userData.email});
            expect(payload.userId).toBe(user?._id.toString());
            expect(payload.isAdmin).toBe(false);
        })

        it("throws an error for invalid credentials", async () => {
            const authDto: AuthenticateUserDto = {
                email: userData.email,
                password: "somewrongpassword",
            }

            await expect(authService.authenticateUser(authDto)).rejects.toThrow(
                new HttpException(400, "Invalid email or password.")
            )
        })

        it("throws an error for non-existent email", async () => {
            const authDto: AuthenticateUserDto = {
                email: "missing@test.com",
                password: "anypassword",
            }

            await expect(authService.authenticateUser(authDto)).rejects.toThrow(
                new HttpException(400, "Invalid email or password")
            )
        })

        it("throws an error for empty request", async () => {
            await expect(authService.authenticateUser({} as AuthenticateUserDto)).rejects.toThrow(
                new HttpException(400, "User request is empty.")
            )
        })
    })
})


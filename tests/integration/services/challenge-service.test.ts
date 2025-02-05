import {GenericContainer} from "testcontainers";
import mongoose, {Types} from "mongoose";
import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from "vitest";
// @ts-ignore
import ChallengeService from "@services/challenge-service"
// @ts-ignore
import ChallengeModel from "@models/challenge-model";
// @ts-ignore
import {ChallengeStat} from "@models/statistics-model";
// @ts-ignore
import {rescheduleChallengeCompletion, scheduleChallengeCompletion} from "@utils/challenge-completion-scheduler";
// @ts-ignore
import {Category, SeniorityLevel, UpdateChallengeDto} from "@dtos/challenge-dtos";
// @ts-ignore
import UserModel from "@models/user-model";

// Mock scheduling utilities
vi.mock("@utils/challenge-completion-scheduler", () => ({
    scheduleChallengeCompletion: vi.fn(),
    rescheduleChallengeCompletion: vi.fn(),
    removeScheduledCompletion: vi.fn(),
}));

// Mock statistics aggregation (if needed)
vi.mock("@models/statistics-model", async (importOriginal) => {
    const mod = await importOriginal() as any;
    return {
        ...mod,
        aggregateStats: vi.fn().mockResolvedValue([{
            totalChallenges: 0,
            completedChallenges: 0,
            openChallenges: 0,
            onGoingChallenges: 0,
            totalParticipants: 0
        }]),
        getDateRanges: vi.fn().mockReturnValue({
            current: { start: new Date(), end: new Date() },
            previous: { start: new Date(), end: new Date() }
        })
    };
});

describe("ChallengeService Integration Tests", () => {
    let container: Awaited<ReturnType<GenericContainer["start"]>>;
    let challengeService: ChallengeService;
    const mockUserId = new Types.ObjectId().toString();
    const challengeData = {
        "title": "Mobile App UI/UX Design",
        "deadline": new Date(Date.now() + 360000),
        "moneyPrize": "$5,000",
        "contactEmail": "admin@challengeplatform.com",
        "projectBrief": "Design a modern and user-friendly UI/UX for a mobile banking application.",
        "projectDescription": [
            "Create high-fidelity wireframes and interactive prototypes.",
            "Ensure a seamless and intuitive user experience.",
            "Design must be mobile-responsive and accessible."
        ],
        "projectRequirements": [
            "Wireframes in Figma or Adobe XD.",
            "Color palette and typography guidelines.",
            "Interactive prototype for user testing."
        ],
        "deliverables": [
            "Final Figma/Adobe XD file with all screens.",
            "Design documentation and style guide."
        ],
        "seniorityLevel": [
            SeniorityLevel.JUNIOR, SeniorityLevel.INTERMEDIATE
        ],
        "category": Category.DESIGN,
        "skillsNeeded": [
            "UI/UX Design",
            "Figma",
            "Adobe XD",
            "Prototyping"
        ],
    }
    const challengeDataWithCreatedBy = {...challengeData, createdBy: mockUserId}

    beforeAll(async () => {
        container = await new GenericContainer("mongo:latest")
            .withExposedPorts(27017)
            .start();

        const uri = `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/test`;
        await mongoose.connect(uri);

        challengeService = new ChallengeService();
    }, 30000);

    afterAll(async () => {
        await mongoose.disconnect();
        await container.stop();
    });

    beforeEach(async () => {
        await ChallengeModel.deleteMany({});
        await ChallengeStat.deleteMany({});
        await UserModel.deleteMany({});
        vi.clearAllMocks();
    });

    describe("createChallenge", () => {

        it("creates a new challenge and schedules completion", async () => {
            const challenge = await challengeService.createChallenge(challengeData, mockUserId);

            expect(challenge.title).toBe(challengeData.title);
            expect(challenge.createdBy.toString()).toBe(mockUserId);

            const dbChallenge = await ChallengeModel.findById(challenge._id);
            expect(dbChallenge).toBeDefined();
            expect(scheduleChallengeCompletion).toHaveBeenCalledWith(
                challenge._id,
                challenge.deadline
            );
        });
    });

    describe("getAllChallenges", () => {
        it("returns paginated challenges with correct structure", async () => {
            await ChallengeModel.insertMany([challengeDataWithCreatedBy, challengeDataWithCreatedBy]);

            const result = await challengeService.getAllChallenges(1, 2);

            expect(result.data.length).toBe(2);
            expect(result.pagination.totalChallenges).toBe(2);
            expect(result.pagination.totalPages).toBe(1);
        });
    });

    describe("updateChallengeById", () => {
        it("updates challenge and reschedules completion", async () => {
            const challenge = await ChallengeModel.create(challengeDataWithCreatedBy);

            const updateData: Partial<UpdateChallengeDto> = { title: "Updated Challenge", deadline: new Date(Date.now() + 172800000) };
            const updated = await challengeService.updateChallengeById(challenge._id.toString(), updateData);

            expect(updated?.title).toBe("Updated Challenge");
            expect(rescheduleChallengeCompletion).toHaveBeenCalledWith(
                challenge._id,
                updated?.deadline
            );
        });
    });

    describe("startChallenge", () => {
        it("adds participant and updates status to ongoing", async () => {
            const challenge = await ChallengeModel.create(challengeDataWithCreatedBy);

            const updated = await challengeService.startChallenge(challenge._id.toString(), new Types.ObjectId().toString());

            expect(updated?.participants.length).toBe(1);
            expect(updated?.status).toBe("ongoing");
        });
    });

    describe("getParticipantDetails", () => {
        it("should return the paginated participant details with the user data.", async () => {
            const users = await UserModel.insertMany([
                { firstName: "John", lastName: "Doe", email: "john@test.com", password: "passwd1" },
                { firstName: "Jane", lastName: "Smith", email: "jane@test.com", password: "passwd2" },
                { firstName: "Bob", lastName: "Brown", email: "bob@test.com", password: "passwd3" },
            ])

            const participantIds = users.map(u =>u._id);
            const challenge = await ChallengeModel.create({
                ...challengeDataWithCreatedBy,
                participants: participantIds,
            })

            const result = await challengeService.getParticipantDetails(
                challenge._id.toString(),
                1, 2
            )

            expect(result[0].participants).toHaveLength(2)
            expect(result[0].totalParticipants).toBe(3)

            const firstParticipant = result[0].participants[0];
            expect(firstParticipant).toMatchObject({
                fullName: expect.stringMatching(/John Doe/),
                email: expect.stringContaining("@test.com")
            })

        });
    });

    describe("getChallengeStats", () => {
        it("returns challenge statistics with comparison data", async () => {
            await ChallengeModel.insertMany([
                {...challengeDataWithCreatedBy, status: "ongoing"},
                {...challengeDataWithCreatedBy, status: "completed"},
            ]);

            const stats = await challengeService.getChallengeStats("this_week");

            expect(stats.totalChallenges.current).toBe(0);
            expect(stats.completedChallenges.current).toBe(0);
        });
    });

    describe("getTalentStatistics", () => {
        it("returns correct challenge counts for talent", async () => {
            const users = await UserModel.insertMany([
                { firstName: "John", lastName: "Doe", email: "john@test.com", password: "passwd1" },
                { firstName: "Jane", lastName: "Smith", email: "jane@test.com", password: "passwd2" },
                { firstName: "Bob", lastName: "Brown", email: "bob@test.com", password: "passwd3" },
            ])

            const participantIds = users.map(u =>u._id);
            await ChallengeModel.insertMany([
                {
                ...challengeDataWithCreatedBy, status: "ongoing", deadline: new Date(Date.now() + 86400000),
                participants: participantIds,
                },
                {
                    ...challengeDataWithCreatedBy, status: "completed", deadline: new Date(Date.now() - 86400000),
                    participants: participantIds,
                }
            ])


            const stats = await challengeService.getTalentStatistics(participantIds[0].toString());

            expect(stats.ongoingChallenges).toBe(1);
            expect(stats.completedChallenges).toBe(1);
        });
    });
});
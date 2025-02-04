// stats-scheduler.test.ts

import { GenericContainer } from "testcontainers";
import mongoose from "mongoose";
import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import AuthService from "@services/auth-service"; // Adjust the import path as necessary
import { initializeStatsScheduler, statsQueue } from "@utils/stats-computation-scheduler";
import { ChallengeStat } from "@models/statistics-model";

let container: Awaited<ReturnType<GenericContainer["start"]>>;
let authService: AuthService;


beforeAll(async () => {

    container = await new GenericContainer("mongo:latest")
        .withExposedPorts(27017)
        .start();


    const uri = `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/test`;
    await mongoose.connect(uri);


    authService = new AuthService();
}, 120000)

afterAll(async () => {
    await mongoose.disconnect();
    await container.stop();
});

describe("Statistics Scheduler", () => {
    // Before each test, clear the stats queue and the ChallengeStat collection
    beforeEach(async () => {
        await statsQueue.obliterate({ force: true });
        await ChallengeStat.deleteMany({});
    });

    it("should generate daily stats", async () => {
        // Initialize the scheduler that is responsible for computing statistics
        await initializeStatsScheduler();

        // Manually trigger a stats job by adding an empty payload (if your job does not require additional parameters)
        await statsQueue.add({});

        // Wait for the job to complete by listening for the "completed" event.
        // The promise resolves when the job processing is finished.
        await new Promise<void>((resolve) => {
            statsQueue.on("completed", resolve);
        });

        // Retrieve computed statistics from the database
        const stats = await ChallengeStat.find({});

        // Assert that one statistics document has been created
        expect(stats.length).toBe(1);
    }, 120000);
});

import Queue from "bull";
import {aggregateStats, ChallengeStat, getDateRanges} from "@models/statistics-model";
import {logger} from "@utils/logger";

// Create a new queue for statistics
export const statsQueue = new Queue("statistics-queue");

// Daily stats generation scheduler
export async function scheduleDailyStats() {
    // Schedule job to run every day at midnight UTC
    await statsQueue.add(
        {},
        {
            repeat: { cron: "0 0 * * *" }, // Cron syntax for midnight daily
            removeOnComplete: true,
            removeOnFail: true
        }
    );

    logger.info("Daily statistics aggregation job scheduled");
}

// Process the statistics generation job
statsQueue.process(async () => {
    try {
        const { current: dateRange } = getDateRanges("last_30_days");

        // Check if stats already exist for this period
        const existingStats = await ChallengeStat.findOne({
            periodStart: dateRange.start,
            periodEnd: dateRange.end
        });

        if (existingStats) {
            logger.info("Statistics already exist for this period. Skipping aggregation.");
            return;
        }

        // Aggregate statistics
        const [stats] = await aggregateStats(dateRange);

        // Create new statistics document
        const newStats = new ChallengeStat({
            periodStart: dateRange.start,
            periodEnd: dateRange.end,
            totalChallenges: stats?.totalChallenges || 0,
            completedChallenges: stats?.completedChallenges || 0,
            openChallenges: stats?.openChallenges || 0,
            onGoingChallenges: stats?.onGoingChallenges || 0,
            totalParticipants: stats?.totalParticipants || 0
        });

        await newStats.save();
        logger.info(`Successfully saved statistics for ${dateRange.start.toISOString()} - ${dateRange.end.toISOString()}`);

    } catch (error) {
        logger.error("Failed to generate daily statistics:", error);
        throw error;
    }
});

// Add error handling
statsQueue.on("failed", (job, err) => {
    logger.error(`Statistics job ${job.id} failed:`, err);
});

// Initialize the scheduler when your app starts
export async function initializeStatsScheduler() {
    await scheduleDailyStats();
}
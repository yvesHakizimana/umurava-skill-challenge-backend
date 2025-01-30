import Queue from "bull"
import ChallengeModel from "@models/challenge-model";

const challengeQueue = new Queue("challenge-queue")

export async function scheduleChallengeCompletion(challengeId: string, deadline: Date){
    const delay = deadline.getTime() - Date.now();
    if (delay > 0)
        await challengeQueue.add(
            {challengeId},
            {delay}
        )
}

// When the challenge is deleted, as well as we have also to delete its job.
export const removeScheduledCompletion = async (challengeId: string) => {
    const jobs = await challengeQueue.getJobs(['delayed'])
    for (const job of jobs) {
        if (job.data.challengeId === challengeId) {
            await job.remove()
        }
    }
}

// it may happen that, they can update the deadline of the challenge.
export const rescheduleChallengeCompletion = async (challengeId: string, newDeadline: Date) => {
    await removeScheduledCompletion(challengeId)
    await scheduleChallengeCompletion(challengeId, newDeadline)
}

challengeQueue.process(async (job) => {
    const { challengeId } = job.data
    await ChallengeModel.updateMany(
        challengeId,
        { $set: { status: 'completed'}},
        {new: true}
    )
})

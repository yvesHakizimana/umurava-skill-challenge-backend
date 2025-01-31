import mongoose from "mongoose";
import {DB_DATABASE, DB_PASSWORD, DB_USERNAME} from "@config";
import UserModel from "@models/user-model";
import ChallengeModel from "@models/challenge-model";
import {hashSync} from "bcrypt";

async function seedDatabase(){
    try {
        await mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@umurava-cluster.v5zrt.mongodb.net/${DB_DATABASE}`)
        // Clear existing data
        await UserModel.deleteMany({});
        await ChallengeModel.deleteMany({});

        // Create Users
        const users = [];
        for (let i = 0; i < 587; i++) {
            users.push({
                firstName: `User${i}`,
                lastName: `Doe${i}`,
                email: `user${i}@example.com`,
                password: hashSync(`password${i}`, 10),
                isAdmin: i === 586  // The Last user is admin
            });
        }

        const createdUsers = await UserModel.insertMany(users);
        const adminUser = createdUsers[createdUsers.length - 1];
        const allUserIds = createdUsers.map(user => user._id);

        // Create Challenges
        const challenges = [];
        const now = new Date();

        for (let i = 0; i < 10; i++) {
            const isPast = i < 3;  // First 3 challenges have past deadlines
            const hasParticipants = Math.random() > 0.3;  // 70% chance of having participants

            const deadline = new Date(now);
            if (isPast) {
                deadline.setDate(deadline.getDate() - 7);
            } else {
                deadline.setDate(deadline.getDate() + 14);
            }

            let participants: mongoose.Types.ObjectId[] = [];
            if (hasParticipants && !isPast) {
                const participantCount = Math.floor(Math.random() * 50) + 10;
                participants = allUserIds
                    .sort(() => 0.5 - Math.random())
                    .slice(0, participantCount);
            }

            let status: 'open' | 'ongoing' | 'completed' = 'open';
            if (deadline < now) {
                status = 'completed';
            } else if (participants.length > 0) {
                status = 'ongoing';
            }

            challenges.push({
                title: `Challenge ${i + 1}`,
                deadline,
                moneyPrize: `$${(Math.random() * 5000 + 1000).toFixed(2)}`,
                contactEmail: adminUser.email,
                projectBrief: `Project brief for challenge ${i + 1}`,
                projectDescription: [
                    `Description 1 for challenge ${i + 1}`,
                    `Description 2 for challenge ${i + 1}`
                ],
                projectRequirements: [
                    `Requirement 1 for challenge ${i + 1}`,
                    `Requirement 2 for challenge ${i + 1}`
                ],
                deliverables: [
                    `Deliverable 1 for challenge ${i + 1}`,
                    `Deliverable 2 for challenge ${i + 1}`
                ],
                createdBy: adminUser._id,
                seniorityLevel: ['junior', 'intermediate', 'senior'].slice(
                    0, Math.floor(Math.random() * 3) + 1
                ) as ('junior' | 'intermediate' | 'senior')[],
                skillsNeeded: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript']
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3),
                participants,
                status,
                category: ['design', 'fronted', 'backend', 'fullstack'][i % 4] as
                    'design' | 'fronted' | 'backend' | 'fullstack'
            });
        }

        await ChallengeModel.insertMany(challenges);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
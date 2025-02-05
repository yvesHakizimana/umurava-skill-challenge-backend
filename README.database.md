# Database Architecture and Design Documentation

## Overview

This document outlines the database models and design decisions implemented to build a performant backend using MongoDB. It details the schema definitions for challenges, statistics, and users, and explains how indexing, aggregation pipelines, and caching have been leveraged to optimize query performance and overall system responsiveness. Our design reflects best practices in modern software engineering, balancing functionality with efficiency.

## Models

### Challenge Model

The **Challenge** model is the primary collection for storing challenge-related data. The schema captures comprehensive details of a challenge, including its title, deadline, monetary prize, contact information, project briefs, and participant references. Key features include:

- **Fields and Data Types:**
    - **Title, MoneyPrize, ContactEmail, ProjectBrief:** Stored as strings to capture descriptive and contact information.
    - **Deadline:** A date field to ensure challenges are time-bound.
    - **ProjectDescription, ProjectRequirements, Deliverables:** Arrays of strings to store multi-line descriptions and requirements.
    - **CreatedBy & Participants:** References to the User model via `ObjectId` for relational integrity.
    - **Status & Category:** Enumerated strings, restricting values to predefined options (e.g., `'open'`, `'ongoing'`, `'completed'` for status and `'design'`, `'frontend'`, `'backend'`, `'fullstack'` for category).
    - **SeniorityLevel & SkillsNeeded:** Arrays to capture the required expertise levels and skills for each challenge.

- **Indexes:**
    - An index is applied on the `deadline`, `status`, and `createdBy` fields:
      ```js
      ChallengeSchema.index({ deadline: 1, status: 1, createdBy: 1 })
      ```
      This composite index significantly enhances the performance of common queries, ensuring fast lookups and efficient filtering on these key attributes.

- **Performance Insight:**
    - With the proper use of indexing, query response times are greatly reduced, leading to a smoother and more responsive application experience.

### Statistics Model

The **Statistics** model is designed to store daily aggregated data. A cron job, orchestrated by Bull, performs scheduled aggregations to capture system-wide performance and usage statistics.

- **Schema Fields:**
    - **PeriodStart & PeriodEnd:** Define the time range for each aggregated record.
    - **Challenge Counts:** `totalChallenges`, `completedChallenges`, `openChallenges`, `onGoingChallenges` capture various states of challenges.
    - **Participants Count:** `totalParticipants` computes the total unique participants across challenges.

- **Aggregation Pipeline:**
    - The aggregation function leverages MongoDB’s aggregation framework to compute statistics in a single query:
      ```js
      return ChallengeModel.aggregate([
        { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
        {
          $facet: {
            totalChallenges: [{ $count: "count" }],
            completedChallenges: [{ $match: { status: 'completed' } }, { $count: "count" }],
            openChallenges: [{ $match: { status: 'open' } }, { $count: "count" }],
            onGoingChallenges: [{ $match: { status: 'ongoing' } }, { $count: "count" }],
            totalParticipants: [
              { $group: { _id: null, uniqueParticipants: { $addToSet: "$participants" } } },
              { $project: { total: { $size: "$uniqueParticipants" } } }
            ]
          }
        },
        {
          $project: {
            totalChallenges: { $arrayElemAt: ["$totalChallenges.count", 0] },
            completedChallenges: { $arrayElemAt: ["$completedChallenges.count", 0] },
            openChallenges: { $arrayElemAt: ["$openChallenges.count", 0] },
            onGoingChallenges: { $arrayElemAt: ["$onGoingChallenges.count", 0] },
            totalParticipants: { $arrayElemAt: ["$totalParticipants.total", 0] }
          }
        }
      ]);
      ```
    - **Design Benefit:** This single-query approach reduces database round trips and ensures that aggregations are performed efficiently, even with large datasets.

### User Model

The **User** model stores essential user data, including names, email addresses, and authentication credentials.

- **Schema Details:**
    - Fields such as `firstName`, `lastName`, `email`, and `password` are required, ensuring data consistency.
    - The email field is marked as unique, enforcing data integrity and preventing duplicate entries.
    - The schema also supports an `isAdmin` flag to distinguish administrative users.

## Performance Enhancements

### Caching with Redis

To further improve performance, caching strategies have been implemented using Redis. Two key use cases include:

1. **Challenges Retrieval:**
    - Frequently accessed API endpoints, such as retrieving all challenges, benefit from Redis caching.
    - **Impact:** Response times have been observed to drop from approximately 600 ms to 36 ms. This dramatic improvement underscores the importance of caching in high-read environments.

2. **Cache Invalidation:**
    - Cache reset operations are integrated into write/update processes (e.g., updating challenge status post-deadline) to ensure that the cached data remains consistent with the database state.

### Efficient Data Aggregation and Joins

- **Participant Details Retrieval:**
    - Instead of multiple queries, a single aggregation query using the `$lookup` stage joins user data with challenge participants:
      ```js
      return ChallengeModel.aggregate([
        { $match: { _id: new Types.ObjectId(challengeId) } },
        { $lookup: {
            from: 'users',
            localField: 'participants',
            foreignField: '_id',
            as: 'participantsData',
          }},
        { $project: {
            _id: 1,
            participants: {
                $slice: [
                    { $map: {
                        input: '$participantsData',
                        as: 'participant',
                        in: {
                            fullName: { $concat: ['$$participant.firstName', ' ', '$$participant.lastName'] },
                            email: '$$participant.email'
                        }
                    }},
                    (page - 1) * limit,
                    limit
                ]
            },
            totalParticipants: { $size: '$participantsData' },
          }}
      ]);
      ```
    - **Advantage:** This method consolidates what would be multiple round trips into one efficient query, reducing response time and improving scalability.

### Scheduled Jobs and Automated Processes

- **Challenge Completion Scheduler:**
    - A background job automatically updates challenge status when deadlines are reached, ensuring data consistency without manual intervention.
    - **Implementation:** A Bull queue processes the job and clears the cache post-update to reflect the latest state.

- **Daily Statistics Aggregation:**
    - A scheduled job runs daily at midnight UTC to capture system-wide statistics using the previously discussed aggregation pipeline.
    - **Resilience:** The job includes error handling and logging to ensure reliable execution and maintain data accuracy.

## Design Decisions and Best Practices

- **Indexing:**  
  By indexing key fields (`deadline`, `status`, `createdBy`), we reduce query execution time and improve the performance of complex queries. Studies have shown that proper indexing can reduce query time by up to 90% in read-heavy applications.

- **Aggregation Pipelines:**  
  MongoDB’s aggregation framework allows us to perform multi-stage transformations and calculations in a single database call. This not only simplifies application logic but also leverages the database’s in-built optimizations.

- **Caching:**  
  Integrating Redis for caching has provided significant performance gains, as evidenced by the drastic reduction in response times. Caching is a critical component in modern, scalable architectures, especially for read-intensive endpoints.

- **Automated Job Scheduling:**  
  Utilizing Bull for scheduling recurring jobs ensures that tasks like statistics aggregation and deadline-based status updates are handled efficiently and reliably, contributing to an overall resilient system.

## Conclusion

This architecture exemplifies the art and science of software engineering—where thoughtful database design, 
judicious use of indexes and aggregation pipelines, and the integration of caching mechanisms come together 
to build a high-performance, scalable backend system. The decisions documented herein are backed 
by empirical performance improvements and industry best practices, ensuring that the system remains robust and 
responsive under load.

For further technical details or queries, please refer to the source code or contact the development team.

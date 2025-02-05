import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';

// Configuration
export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<1000'],
    },
};

// Auth configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';


// Shared state (if needed)
let challenges = new SharedArray('challenges', function () {
    return []; // Initialized empty to avoid setup issues
});

export function setup() {

    const adminLoginPayload = JSON.stringify({
        email: 'user586@example.com',
        password: 'password586',
    });
    const adminLoginRes = http.post(`${BASE_URL}/auth/login`, adminLoginPayload, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(adminLoginRes, {
        'Admin login successful': (r) => r.status === 200,
        'Received admin token': (r) => !!r.json('data.token'),
    });
    const adminToken = adminLoginRes.json('data.token');

    // Use the obtained token in admin parameters
    const adminParams = {
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
        },
    };

    const created = [];
    for (let i = 0; i < 5; i++) {
        const payload = JSON.stringify({
            "title": "Creative Design Challenge",
            "deadline": new Date(Date.now() + 86400000).toISOString(),
            "moneyPrize": "5000",
            "contactEmail": "designer@example.com",
            "projectBrief": "Design a modern, user-friendly interface for a new mobile application.",
            "projectDescription": [
                "The project involves creating an intuitive UI that aligns with current design trends.",
                "Focus on a clean, minimalist aesthetic while ensuring accessibility."
            ],
            "projectRequirements": [
                "Proficiency in mobile design tools such as Sketch or Figma.",
                "Ability to collaborate with developers to ensure design feasibility."
            ],
            "deliverables": [
                "Initial wireframes",
                "High-fidelity mockups",
                "Interactive prototype"
            ],
            "seniorityLevel": ["junior"],
            "category": "design",
            "skillsNeeded": [
                "UI/UX Design",
                "Visual Communication",
                "Prototyping"
            ]
        });
        const res = http.post(`${BASE_URL}/challenges`, payload, adminParams);
        if (res.status === 201) {
            created.push(res.json('challenge._id'));
        }
    }
    return { challenges: created, adminToken };
}

export default function (data) {
    // Use the token from the setup for admin operations
    const ADMIN_PARAMS = {
        headers: {
            'Authorization': `Bearer ${data.adminToken}`,
            'Content-Type': 'application/json',
        },
    };

    // For user operations, you could use a separate login flow or a fixed token
    const USER_PARAMS = {
        headers: {
            'Authorization': `Bearer YOUR_USER_TOKEN_HERE`,
            'Content-Type': 'application/json',
        },
    };

    group('Public endpoints', () => {
        // GET /challenges
        const allRes = http.get(`${BASE_URL}/challenges?page=1&limit=5`);
        check(allRes, {
            'GET /challenges status 200': (r) => r.status === 200,
            'has pagination data': (r) => !!r.json('pagination'),
        });
    });

    group('Admin operations', () => {
        // Corrected: use 'payload' instead of undefined 'createPayload'
        const payload = JSON.stringify({
            "title": "Creative Design Challenge",
            "deadline": new Date(Date.now() + 86400000).toISOString(),
            "moneyPrize": "5000",
            "contactEmail": "designer@example.com",
            "projectBrief": "Design a modern, user-friendly interface for a new mobile application.",
            "projectDescription": [
                "The project involves creating an intuitive UI that aligns with current design trends.",
                "Focus on a clean, minimalist aesthetic while ensuring accessibility."
            ],
            "projectRequirements": [
                "Proficiency in mobile design tools such as Sketch or Figma.",
                "Ability to collaborate with developers to ensure design feasibility."
            ],
            "deliverables": [
                "Initial wireframes",
                "High-fidelity mockups",
                "Interactive prototype"
            ],
            "seniorityLevel": ["junior"],
            "category": "design",
            "skillsNeeded": [
                "UI/UX Design",
                "Visual Communication",
                "Prototyping"
            ]
        });
        const createRes = http.post(`${BASE_URL}/challenges`, payload, ADMIN_PARAMS);
        check(createRes, {
            'POST /challenges status 201': (r) => r.status === 201,
        });
        const challengeId = createRes.json('challenge._id');

        if (challengeId) {
            // PUT /challenges/:challengeId
            const updatePayload = JSON.stringify({
                title: `Updated ${Date.now()}`,
                description: 'Updated description',
            });
            const updateRes = http.put(`${BASE_URL}/challenges/${challengeId}`, updatePayload, ADMIN_PARAMS);
            check(updateRes, {
                'PUT /challenges/:id status 200': (r) => r.status === 200,
            });

            // GET /challenges/:challengeId/participants
            const participantsRes = http.get(`${BASE_URL}/challenges/${challengeId}/participants?page=1&limit=5`, ADMIN_PARAMS);
            check(participantsRes, {
                'GET /challenges/:id/participants status 200': (r) => r.status === 200,
            });

            // DELETE /challenges/:challengeId
            const delRes = http.del(`${BASE_URL}/challenges/${challengeId}`, null, ADMIN_PARAMS);
            check(delRes, {
                'DELETE /challenges/:id status 200': (r) => r.status === 200,
            });
        }
    });

    group('User operations', () => {
        // GET /challenges/talent/stats
        const statsRes = http.get(`${BASE_URL}/challenges/talent/stats`, USER_PARAMS);
        check(statsRes, {
            'GET /challenges/talent/stats status 200': (r) => r.status === 200,
        });

        // PATCH /challenges/:challengeId/participate
        if (data.challenges.length > 0) {
            const challengeId = data.challenges[Math.floor(Math.random() * data.challenges.length)];
            const participateRes = http.patch(`${BASE_URL}/challenges/${challengeId}/participate`, null, USER_PARAMS);
            check(participateRes, {
                'PATCH /challenges/:id/participate status 200': (r) => r.status === 200,
            });
        }

        // GET /challenges/:challengeId
        if (data.challenges.length > 0) {
            const challengeId = data.challenges[Math.floor(Math.random() * data.challenges.length)];
            const getRes = http.get(`${BASE_URL}/challenges/${challengeId}`, USER_PARAMS);
            check(getRes, {
                'GET /challenges/:id status 200': (r) => r.status === 200,
            });
        }
    });

    sleep(1);
}

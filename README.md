# Umurava Skill Challenge Backend (https://umurava-skill-challenge--alm5u95.gamma.site/)

**Version:** 1.0.0

---

## Table of Contents

- [Overview](#overview)
- [Project Description](#project-description)
- [Key Features](#key-features)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Monitoring & Logging](#monitoring--logging)
- [Contributing](#contributing)
- [Contact](#contact)

---

## Overview

The **Umurava Skill Challenge Backend** is a high-performance, scalable Node.js application built using TypeScript and Express.js. Designed to support a project-based learning platform, the backend powers a system where youth can participate in skills challenges, contests, hackathons, and more. This platform aims to help young talents build their portfolios and gain real-world experience while collaborating with educational institutions across Africa.

---

## Project Description

The project serves as the backend for a platform that:
- **Empowers Youth:** Provides a space for youth to work on real-world projects, contests, and hackathons.
- **Portfolio Development:** Enables participants to build and showcase their work portfolio and experiences.
- **Educational Integration:** Works with educational institutions to enhance technical skill mastery, preparing students for the job market.
- **Scalability & Performance:** Is designed to scale and meet a projected user base of over 60,000 users across 10 African countries within two years.

The application emphasizes optimized, clean, and efficient code practices, ensuring high performance and future scalability.

---

## Key Features

- **Optimized Backend:** Developed with Node.js and TypeScript using Express.js, ensuring a fast and responsive API.
- **Scalable Folder Structure:** Adheres to the separation of concerns and single responsibility principle.
- **Comprehensive Testing:**
    - *Integration Tests:* Tests for authentication and challenge services.
    - *End-to-End Tests:* Verifies the complete flow between client and server.
    - *Performance Tests:* Utilizes k6 to simulate load and gather performance statistics.
- **Monitoring & Logging:**
    - Integrated with Grafana and Prometheus for real-time monitoring.
    - Robust logging implemented using Winston, with daily rotation.
- **Security & Best Practices:**
    - Uses Helmet, HPP, and CORS for secure HTTP headers and cross-origin resource sharing.
    - Implements rate limiting and error handling for a robust API.
- **API Documentation:** Swagger documentation available for comprehensive API exploration.

---

## Architecture & Technology Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Testing:** Vitest for unit tests, integration tests, and end-to-end tests; k6 for performance/load testing.
- **Monitoring:** Prometheus and Grafana
- **Containerization & Deployment:** Docker, Docker Compose, PM2, and Nginx.
- **Instrumentation:** OpenTelemetry for tracing and monitoring.

---

## Folder Structure

The repository is organized to promote scalability and maintainability:

```
.
├── dist/                         # Compiled resources
├── tests/                        # Testing directory
│   ├── integration/              # Integration tests for authentication and challenge services
│   │   ├── auth-service.test.ts
│   │   └── challenge-service.test.ts
│   └── performance/              # k6 scripts for performance testing
│       └── auth-load-test.js
        |__ challenge-load-test.js
├── monitoring/                   # Grafana and Prometheus configuration files
├── src/                          # Main source code
│   ├── config/                   # Environment and project configurations
│   ├── controllers/              # Application controllers
│   │   ├── authentication-controller.ts
│   │   └── challenge-controller.ts
│   ├── databases/                # Database configuration (MongoDB)
│   ├── dtos/                     # Data Transfer Objects (DTOs)
│   │   ├── auth-dtos.ts
│   │   └── challenge-dtos.ts
│   ├── exceptions/               # Custom exception handling
│   │   └── http-exception.ts
│   ├── logs/                     # Runtime logs storage
│   ├── middlewares/              # Express middlewares
│   │   ├── auth-middleware.ts
│   │   ├── error-middleware.ts
│   │   ├── isadmin-middleware.ts
│   │   └── validation-middleware.ts
│   ├── models/                   # Mongoose models/schemas
│   │   ├── challenge-model.ts
│   │   ├── statistics-model.ts
│   │   └── user-model.ts
│   ├── routes/                   # API route definitions
│   │   ├── admin-router.ts
│   │   ├── auth-router.ts
│   │   ├── challenge-router.ts
│   │   └── router-interface.ts
│   ├── services/                 # Business logic layer
│   │   ├── auth-service.ts
│   │   └── challenge-service.ts
│   ├── utils/                    # Utility functions and helpers
│   │   ├── logger.ts             # Global logging
│   │   ├── challenge-completion-scheduler.ts          # Scheduler for automatic challenge completions
│   │   ├── is-empty.ts           # Utility for handling empty requests/responses
│   │   └── seed.ts               # Database seeding utility
│   ├── app.ts                    # Express app initialization
│   └── server.ts                 # Server configuration and startup
├── .env.development.local        # Development environment variables
├── .env.production.local         # Production environment variables
├── .swcrc                        # SWC configuration
├── docker-compose.yaml           # Docker Compose configuration
├── Dockerfile                    # Docker container definition
├── ecosystem.config.js           # PM2 configuration for process management
├── instrumentation.ts            # OpenTelemetry instrumentation
├── nginx.conf                    # Nginx reverse proxy configuration
├── nodemon.json                  # Nodemon configuration for development
├── package.json                  # Project metadata and dependencies
├── vitest.config.json            # Vitest configuration
└── swagger.yaml                  # Swagger API documentation
```

---

## Installation & Setup

### Prerequisites

- **Node.js:** v14 or later
- **npm/yarn:** Latest version recommended
- **MongoDB:** Running instance or Docker container
- **Docker:** For containerized deployment (optional)
- **PM2:** For process management in production (optional)

### Local Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yvesHakizimana/umurava-skill-challenge-backend
   cd umurava-skill-challenge-backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**

   Create or update your `.env.development.local` file with the required environment variables (e.g., PORT, NODE_ENV, mongoDbConnection.url, ORIGIN, etc.).

4. **Run Database Seeding (Optional):**

   ```bash
   npm run seed
   ```

5. **Start the Application in Development Mode:**

   ```bash
   npm run dev
   ```

   The server will start on the configured port (default is 3000). You should see a log message indicating that the application is running.

---

## Environment Configuration

The project uses multiple environment configuration files:

- `.env.development.local` – for development environment settings.
- `.env.production.local` – for production environment settings.

Ensure that you configure all necessary variables such as:

- `PORT`
- `NODE_ENV`
- `mongoDbConnection.url`
- `ORIGIN`
- `CREDENTIALS`
- Any other specific configuration required by your services

For improved security and configuration validation, consider using libraries like [envalid](https://github.com/af/envalid).

---

## Testing

The project includes a robust testing suite covering integration, end-to-end, and performance tests:

- **Integration Tests:**

  Located under `tests/integration/`. Run these tests using:

  ```bash
  npm run test:coverage
  # or
  npm run test:ui
  ```

- **End-to-End Tests:**

  Ensure the entire system works as expected by running your complete test suite.

- **Performance Tests:**

  k6 scripts are located in `tests/performance/`. Run performance tests with:

  ```bash
  npm run performance:test
  ```

These tests help ensure that every line of code is optimized, and the application can handle increased loads as user numbers grow.

---

## Deployment

### Build & Deploy

1. **Build the Application:**

   ```bash
   npm run build
   ```

2. **Start the Server:**

   ```bash
   npm run deploy
   ```

3. **Deploy with PM2 (for Production):**

   ```bash
   npm run deploy:server
   ```

### Containerized Deployment

For Docker deployments, use the provided `Dockerfile` and `docker-compose.yaml` to containerize the application. This approach ensures consistency across development, testing, and production environments.

---

## API Documentation

The API is documented using Swagger. After starting the application, you can access the documentation at:

```
http://localhost:3000/api-docs
```

This documentation provides detailed information on each endpoint, including request/response formats and authentication requirements.

---

## Monitoring & Logging

- **Logging:**  
  The application uses Winston with daily log rotation to ensure robust and scalable logging. The logs are stored in the `logs/` directory.

- **Monitoring:**  
  Integrated with Prometheus and Grafana, the monitoring setup collects real-time performance and usage statistics, aiding in proactive performance tuning and troubleshooting.

- **Instrumentation:**  
  OpenTelemetry is used for distributed tracing and metrics collection, ensuring end-to-end visibility across services.

---

## Contributing

Contributions are welcome. Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch:**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**
4. **Push to Your Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Create a Pull Request**

Ensure that your code follows the project’s coding standards and includes tests for any new functionality.

---

## Contact

For any inquiries or feedback, please reach out to:

- **Backend developer:** Yves HAKIZIMANA
- **Email:** yvhakizimana123@gmail.com
- **GitHub:** yvesHakizimana(https://github.com/yvesHakizimana)

---

## Expert Tips & Insights

- **Performance Optimization:**  
  Data from k6 performance tests indicates that proactive load testing is essential for maintaining scalability. Regularly review performance metrics and optimize database queries and middleware logic.

- **Code Maintainability:**  
  Adhering to the single responsibility principle and organizing the project into distinct modules (controllers, services, middlewares) makes the codebase more maintainable and easier to extend.

- **Monitoring Best Practices:**  
  Integrating monitoring tools such as Prometheus and Grafana can reduce downtime by providing early warnings on performance degradation. Data-backed monitoring ensures that you can identify bottlenecks before they impact user experience.

- **Testing Strategy:**  
  A layered testing approach (unit, integration, e2e, and performance) is proven to catch bugs at different levels of the application. This strategy enhances overall code quality and reliability.

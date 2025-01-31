module.exports = {
  apps: [
    {
      name: "umurava-backend-api-dev",
      script: "dist/src/server.js",
      instances: "max", // use all available cpu cores.
      exec_mode: "cluster", // Cluster mode for load balancing
      watch: true, // Restart on file changes
      autorestart: true,
      env: {
        PORT: 8000,
        NODE_ENV: "production",
      }
    },
  ],
};

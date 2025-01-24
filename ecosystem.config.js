module.exports = {
    apps: [
        {
            name: 'prod',
            script: './dist/index.js', // Ensure this path is correct
            exec_mode: 'cluster',
            instance_var: 'INSTANCE_ID',
            instances: 2,
            autorestart: true,
            watch: false,
            ignore_watch: ['node_modules', 'logs'],
            max_memory_restart: '1G',
            merge_logs: true,
            output: './logs/prod_access.log',
            error: './logs/prod_error.log',
            env: {
                PORT: 3000,
                NODE_ENV: 'production',
            }
        },
        {
            name: 'dev',
            script: 'ts-node-dev',
            args: '-r tsconfig-paths/register --transpile-only src/server.ts',
            instance_var: 'INSTANCE_ID',
            instances: 1, // Use a single instance for development
            autorestart: true,
            watch: ['src'],
            ignore_watch: ['node_modules', 'logs'],
            merge_logs: true,
            output: './logs/dev_access.log',
            error: './logs/dev_error.log',
            env: {
                PORT: 3000,
                NODE_ENV: 'development',
            }
        }
    ],
    deploy: {
        production: {
            user: 'node',
            host: 'your-server',
            ref: 'origin/main',
            repo: 'git@github.com:your/repo.git',
            path: '/var/www/your-app',
            'post-deploy':
                'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
        }
    }
};

module.exports = {
    apps: [
        {
            name: 'codehubx-api',
            script: 'src/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            env_production: {
                NODE_ENV: 'production',
            }
        }
    ]
};

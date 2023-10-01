module.exports = {
    name: 'Launch API',
    script: './js/index.js',
    env: {
        // These ENV variables are unused, as pm2 isn't used for development
        // These are present of a better understanding of the functionality
        PORT: 80,
        HTTPS_PORT: 443,
        NODE_ENV: 'development',
        BASE_URL: 'launch',
        MEMCACHED_SERVERS: ['127.0.0.1:11211']
    },
    env_production: {
        PORT: 82,
        HTTPS_PORT: 445,
        NODE_ENV: 'production',
        BASE_URL: '',
        MEMCACHED_SERVERS: ['127.0.0.1:11211']
    },
    env_development: {
        PORT: 4000,
        HTTPS_PORT: undefined,
        NODE_ENV: 'development',
        BASE_URL: 'launch',
        MEMCACHED_SERVERS: undefined
    }
};

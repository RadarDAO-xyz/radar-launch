module.exports = {
    name: 'Launch API',
    script: './js/index.js',
    env: {
        PORT: 80,
        HTTPS_PORT: 443,
        NODE_ENV: 'development',
        BASE_URL: '/launch'
    },
    env_production: {
        PORT: 82,
        HTTPS_PORT: 445,
        NODE_ENV: 'production'
    }
};

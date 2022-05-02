const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = async (phase, { defaultConfig }) => {
    /**
     * @type {import('next').NextConfig}
     */

    const nextConfig = {

        env: {
            // #Min and Max data for login
            NEXT_PUBLIC_MIN_LENGTH_LOGIN: '4',
            NEXT_PUBLIC_MAX_LENGTH_LOGIN: '30',

            // #Min and Max data for email
            NEXT_PUBLIC_MIN_LENGTH_EMAIL: '3',
            NEXT_PUBLIC_MAX_LENGTH_EMAIL: '320',

            // #Min and Max data for password
            NEXT_PUBLIC_MIN_LENGTH_PASSWORD: '4',
            NEXT_PUBLIC_MAX_LENGTH_PASSWORD: '30',
        }

    }

    if (phase === PHASE_DEVELOPMENT_SERVER) {

        nextConfig.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
        nextConfig.env.NEXT_PUBLIC_CLIENT_URL = 'http://localhost:3000';

    } else {

        nextConfig.env.NEXT_PUBLIC_API_URL = 'https://dashboard-mtmdashboard.vercel.app';
        nextConfig.env.NEXT_PUBLIC_CLIENT_URL = 'https://dashboard-mtmdashboard.vercel.app';

    }

    nextConfig.headers = async() => {
        return [
            {
                source: '/:slug*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: nextConfig.env.NEXT_PUBLIC_CLIENT_URL,
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                ],
            },
        ]
    }

    return nextConfig;

}
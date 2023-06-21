const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = async (phase, { defaultConfig }) => {
    /**
     * @type {import('next').NextConfig}
     */

    const nextConfig = {

        env: {
            // #Min and Max data for text input
            NEXT_PUBLIC_MIN_LENGTH_INITIALS: '1',
            NEXT_PUBLIC_MAX_LENGTH_INITIALS: '30',

            // #Min and Max data for number input for guard posts
            NEXT_PUBLIC_MIN_LENGTH_GUARD_POST_NUMBER_INPUT: '100',
            NEXT_PUBLIC_MAX_LENGTH_GUARD_POST_NUMBER_INPUT: '999',

            // #Min and Max data for number input for guard posts
            NEXT_PUBLIC_MIN_LENGTH_PROTECTED_OBJECT_NUMBER_INPUT: '1',
            NEXT_PUBLIC_MAX_LENGTH_PROTECTED_OBJECT_NUMBER_INPUT: '100000',

            // #Min and Max data for number input
            NEXT_PUBLIC_MIN_LENGTH_TELEPHONE_INPUT: '10',
            NEXT_PUBLIC_MAX_LENGTH_TELEPHONE_INPUT: '16',

            // #Min and Max data for email
            NEXT_PUBLIC_MIN_LENGTH_EMAIL: '3',
            NEXT_PUBLIC_MAX_LENGTH_EMAIL: '320',

            // #Min and Max data for password
            NEXT_PUBLIC_MIN_LENGTH_PASSWORD: '4',
            NEXT_PUBLIC_MAX_LENGTH_PASSWORD: '30',

            // #Min and Max data for number rate
            NEXT_PUBLIC_MIN_LENGTH_RATE_INPUT: '1',
            NEXT_PUBLIC_MAX_LENGTH_RATE_INPUT: '1000000',

            // #over rate calc
            NEXT_PUBLIC_OVER_RATE_CALC: 10000,

            // #Max count for shifts
            NEXT_PUBLIC_MAX_COUNT_SHIFTS: '20',
            
            // #Mail options for send activate link
            NEXT_PUBLIC_MAIL_ACTIVATE_LINK_SMTP_HOST: 'smtp-relay.sendinblue.com',
            NEXT_PUBLIC_MAIL_ACTIVATE_LINK_SMTP_PORT: '587',

            // #JWT config for Generate token
            NEXT_PUBLIC_JWT_ACCESS_EXPIRES_IN: '30s',
            NEXT_PUBLIC_JWT_REFRESH_EXPIRES_IN: '15d',

            // #JWT config for redirect auth token
            NEXT_PUBLIC_JWT_REDIRECT_AUTH_EXPIRES_IN: '5m',
            
            // #Google Drive info for image
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_DASHBOARD: '1s2KFHjOhXQ9kQ8QcGGofR47PeFNwhD2j',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_USERS: '1oWbuTn70nfV9UMQ90KrIKO4yKbmm4nH0',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDPOSTS: '16VCgeX_BbwS5UpWdhO0o8loLSPafBPCL',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_PROTECTEDOBJECTS: '1zEUDiK63E7YGHHAV5onX75b2FcDxfA2L',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_GUARDS: '1efI0RWRTXHfz4pMz5Nvjna4HFc4ULlmq',

            // #Google Drive info for excel
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_DAY: '1QpNbsuqoSXogZOopyOCRhOPLTU380oHj',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_MONTH_PART: '1w81XJFdlgtqpTH6Dj9FjcPLI63chEQR9',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_MONTH_FULL: '13nNbh8tsyo-MHAbcLFfdEveO6MW-Dt7r',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_TIMESHEET_PRINT_FOR_MONTH_BUH: '1Tiqp50Yt2a5KTgdFeG4wClsP9hvA1gxR',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_REPORT_PRINT_FOR_ALL_GUARD_POSTS: '1KaF67tYa7oEMcU-gaBM0mPsi5W39F3BG',
            NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID_TUMAR_REPORT_PRINT_FOR_ALL_PROTECTED_OBJECTS: '1RVLbfkZFipIEZ_b-VRJr81PoQyFBPVMs',
        },

        images: {
            domains: ['drive.google.com', 'ui-avatars.com', '**googleusercontent.com'],
          }

    }

    if (phase === PHASE_DEVELOPMENT_SERVER) {

        nextConfig.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
        nextConfig.env.NEXT_PUBLIC_CLIENT_URL = 'http://localhost:3000';

    } else {

        nextConfig.env.NEXT_PUBLIC_API_URL = 'https://tumar-dashboard.vercel.app';
        nextConfig.env.NEXT_PUBLIC_CLIENT_URL = 'https://tumar-dashboard.vercel.app';

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
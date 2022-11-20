import e from 'cors';
import * as positions from '../levelZ_variable/FPositionItemList';

export const FDashboardAccessRules = [
    { url: /^\/dashboard\/profile$/, access: [] },
    {
        url: /^\/dashboard\/users$/, access: [
            positions.FPositionDIR,
            positions.FPositionZDIR,
            positions.FPositionHRM,
        ]
    },
    {
        url: /^\/dashboard\/guardPosts$/, access: [
            positions.FPositionDIR,
            positions.FPositionZDIR,
            positions.FPositionHRM,
            positions.FPositionBUH,
            positions.FPositionNSO,
        ]
    },
    {
        url: /^\/dashboard\/guardPosts(?=.)/, access: [
            positions.FPositionDIR,
            positions.FPositionZDIR,
            positions.FPositionHRM,
            positions.FPositionBUH,
            positions.FPositionNSO,
        ]
    },
    {
        url: /^\/dashboard\/guards$/, access: [
            positions.FPositionDIR,
            positions.FPositionZDIR,
            positions.FPositionHRM,
            positions.FPositionNSO,
            positions.FPositionBUH,
        ]
    }
];

export const FApiMethodAccessRules = [
    
    // Guard methods
    {
        url: '/api/method/guard/createGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },
    {
        url: '/api/method/guard/editGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },
    {
        url: '/api/method/guard/deleteGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },

    // GuardPost methods
    {
        url: '/api/method/guardPost/createGuardPost', access: [
            { position: positions.FPositionZDIR },
        ]
    },
    {
        url: '/api/method/guardPost/editGuardPost', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionNSO, editBlock: ['rate', 'manager'], userCompare: ['manager']  }
        ]
    },
    {
        url: '/api/method/guardPost/deleteGuardPost', access: [
            { position: positions.FPositionZDIR }
        ]
    },

    // Timesheet methods
    {
        url: '/api/method/timesheet/changeTimesheet', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM, editBlock: ['rate', 'manager'] },
            { position: positions.FPositionNSO, editBlock: ['rate', 'manager'], userCompare: ['manager'] }
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheet', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO, userCompare: ['manager'] }
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrint', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO },
            { position: positions.FPositionBUH }
        ]
    },

    // User methods
    {
        url: '/api/method/user/changeUser', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: '', editBlock: ['positions'], userCompare: ['id'] }
        ]
    },
    {
        url: '/api/method/user/changeUserPassword', access: [
            { position: '', userCompare: ['id'] }
        ]
    },
    {
        url: '/api/method/user/deleteUser', access: [
            { position: positions.FPositionZDIR }
        ]
    },
    
    // UserHard methods
    {
        url: '/api/method/userHard/createUserHard', access: [
            { position: positions.FPositionZDIR, userCompare: ['idHard'] },
            { position: positions.FPositionHRM, userCompare: ['idHard'] }
        ]
    },
    {
        url: '/api/method/userHard/editUserHard', access: [
            { position: positions.FPositionZDIR, userCompare: ['idHard'] },
            { position: positions.FPositionHRM, userCompare: ['idHard'] }
        ]
    },
    {
        url: '/api/method/userHard/deleteUserHard', access: [
            { position: positions.FPositionZDIR, userCompare: ['idHard'] }
        ]
    },
    {
        url: '/api/method/userHard/activateUserHard', access: [
            { position: positions.FPositionZDIR, userCompare: ['idHard'] },
            { position: positions.FPositionHRM, userCompare: ['idHard'] }
        ]
    },
    {
        url: '/api/method/userHard/resetUserPasswordHard', access: [
            { position: positions.FPositionZDIR, userCompare: ['idHard'] },
            { position: positions.FPositionHRM, userCompare: ['idHard'] }
        ]
    },
];

export async function getApiMethodAccess(req, userData) {
    const findedRule = FApiMethodAccessRules.find((rule) => req.nextUrl.pathname.search(rule.url) > -1);

    if (findedRule) {

        if (!userData.positions || userData.positions.length === 0){
            userData.positions=[''];
        }

        for (const access of findedRule.access ) {

            if( !access.position || userData.positions.includes( access.position ) ){

                if( access.editBlock || access.userCompare ){

                    const requestJson = await req.json();

                    if( access.userCompare ){
                        for (const userIdKey of access.userCompare) {
                            if(requestJson[userIdKey] != userData.id){
                                return 'Вам отказано в доступе к выполняемой операции';
                            }else{
                                delete requestJson[userIdKey];
                            }
                        }
                    }

                    if( access.editBlock ){
                        for (const editRule of access.editBlock) {
                            if(requestJson[editRule]){
                                return `Отсутсвует право доступа на редкатирование поля "${editRule}"`;
                            }else{
                                delete requestJson[editRule];
                            }
                        }
                    }

                }

                return null;

            } 
        }

    }

    return 'Отсуствует правило доступа к ресурсу';

}

export function getApiMethodAccesRules(positions) {
    
    const regExp = RegExp([
        '/api/method/guard/',
        '/api/method/guardPost/',
        '/api/method/timesheet/',
        '/api/method/user/',
        '/api/method/userHard/',
    ].join('|'), 'ig');

    return [...new Set(FApiMethodAccessRules.reduce((result, value) => {

        let accessName = value.url.toString().replace(regExp, '');

        for (const access of value.access ) {

            if(!access.position || positions?.includes( access.position ) ){

                Object.keys(access).forEach((key) => {
                    
                    if(key != 'position'){

                        for (const rule of access[key]) {
                            result.push(
                                accessName + '/' + key + '/' + rule
                            );
                            
                        }

                    }
                });

                result.push(accessName);

                break;
            } 
        }

        return result;

    }, []))];
}
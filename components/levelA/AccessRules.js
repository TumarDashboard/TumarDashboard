import * as positions from '../levelZ_variable/FPositionItemList';

export const FApiMethodAccessRules = [

    // Guard methods
    {
        url: '/dashboard/guards', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO },
        ]
    },
    {
        url: '/dashboard/guards/archive', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },
    {
        url: '/api/method/guard/createGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            // { position: positions.FPositionNSO }
        ]
    },
    {
        url: '/api/method/guard/editGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            // { position: positions.FPositionNSO }
        ]
    },
    {
        url: '/api/method/guard/deleteGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            // { position: positions.FPositionNSO }
        ]
    },
    {
        url: '/api/method/guard/recoverGuard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            // { position: positions.FPositionNSO }
        ]
    },

    // GuardPost methods
    {
        url: '/dashboard/guardPosts\$', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO },
            { position: positions.FPositionOPR }
        ]
    },
    {
        url: '/dashboard/guardPosts/archive\$', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR }
        ]
    },
    {
        url: /^\/dashboard\/guardPosts(?=.)/, access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO },
        ]
    },
    {
        url: '/api/method/guardPost/createGuardPost', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
        ]
    },
    {
        url: '/api/method/guardPost/editGuardPost', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO, apiBlock: ['rate', 'manager'], userCompare: ['manager'] }
        ]
    },
    {
        url: '/api/method/guardPost/deleteGuardPost', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
        ]
    },
    {
        url: '/api/method/guardPost/recoverGuardPost', access: [
            { position: positions.FPositionZDIR }
        ]
    },
    {
        url: '/api/method/guardPost/reportGuardPosts', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH},
        ]
    },

    // ProtectedObject methods
    {
        url: '/dashboard/protectedObjects\$', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionING },
            { position: positions.FPositionTHN },
        ]
    },
    {
        url: '/dashboard/protectedObjects/archive\$', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionING },
            { position: positions.FPositionTHN },
        ]
    },
    {
        url: /^\/dashboard\/protectedObjects(?=.)/, access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionING },
            { position: positions.FPositionTHN },
        ]
    },
    {
        url: '/api/method/protectedObject/createProtectedObject', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/protectedObject/editProtectedObject', access: [
            { position: positions.FPositionZDIR }, 
            { position: positions.FPositionING },
            { position: positions.FPositionHRM },
            { position: positions.FPositionTHN, apiBlock: ['number', 'name', 'address', 'photo', 'description'] },
        ]
    },
    // {
    //     url: '/api/method/protectedObject/getProtectedObject', access: [
    //         { position: positions.FPositionZDIR },
    //         { position: positions.FPositionING },
    //     ]
    // },
    {
        url: '/api/method/protectedObject/deleteProtectedObject', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/protectedObject/recoverProtectedObject', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/protectedObject/searchProtectedObject', access: [
            { position: positions.FPositionZDIR }, 
            { position: positions.FPositionHRM },
            { position: positions.FPositionING },
            { position: positions.FPositionTHN },
        ]
    },
    {
        url: '/api/method/protectedObject/reportProtectedObjects', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/protectedObject/uploadJsonProtectedObjects', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/protectedObject/uploadFinishProtectedObjects', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },

    // SimCard methods
    {
        url: '/dashboard/simCards\$', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/dashboard/simCards/archive\$', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: /^\/dashboard\/simCards(?=.)/, access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/createSimCard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/editSimCard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    // {
    //     url: '/api/method/simCard/getSimCard', access: [
    //         { position: positions.FPositionZDIR },
    //         { position: positions.FPositionING },
    //     ]
    // },
    {
        url: '/api/method/simCard/deleteSimCard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/recoverSimCard', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/reportSimCards', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/uploadJsonSimCards', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/uploadExcellSimCards', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },
    {
        url: '/api/method/simCard/uploadFinishSimCards', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
        ]
    },

    // Timesheet methods
    {
        url: '/api/method/timesheet/changeTimesheet', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM, apiBlock: ['manager'] },
            { position: positions.FPositionNSO, apiBlock: ['rate', 'manager'], userCompare: ['guardPostManager'] }
        ]
    },
    {
        url: '/api/method/timesheet/changeTimesheetToday', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionOPR },
            { position: positions.FPositionNSO, userCompare: ['guardPostManagers'] },
        ]
    },
    {
        url: '/api/method/timesheet/changeTimesheetToday2', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionOPR },
            { position: positions.FPositionNSO, userCompare: ['guardPostManager'] },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetToday', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO },
            { position: positions.FPositionOPR }
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheet', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO, userCompare: ['guardPostManager'] }
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrint', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrintForMonthHours', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrintForDay', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionOPR },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrintForMonthPart', access: [
            { position: positions.FPositionNSO, userCompare: ['guardPostManager'] },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrintForMonthFull', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrintForMonthFullSplit', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
        ]
    },
    {
        url: '/api/method/timesheet/getTimesheetPrintForMonthBuh', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionBUH },
        ]
    },

    // User methods
    {
        url: '/dashboard\$', access: []
    },
    {
        url: '/dashboard/profile', access: []
    },
    {
        url: '/api/method/user/changeUser', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: '', apiBlock: ['positions'], userCompare: ['id'] }
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
        url: '/dashboard/users', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
        ]
    },
    {
        url: '/dashboard/users/archive', access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
        ]
    },
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
    {
        url: '/api/method/userHard/recoverUserHard', access: [
            { position: positions.FPositionZDIR }
        ]
    },

    // Modal methods
    {
        url: '/api/method/modal/getGuardEditForm', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
        ]
    },
    {
        url: '/api/method/modal/getProtectedObjectEditForm', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionING },
            { position: positions.FPositionTHN },
        ]
    },
    {
        url: '/api/method/modal/getSimCardFindForm', access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionING },
            { position: positions.FPositionTHN },
        ]
    },
];

export async function getApiMethodAccess(req, userData) {

    const findedRule = FApiMethodAccessRules.find((rule) => {
        return req.nextUrl.pathname.search(rule.url + '\$') > -1
    });

    if (findedRule) {

        if (!userData.positions || userData.positions.length === 0) {
            userData.positions = [''];
        }

        // console.log(findedRule, userData.positions);

        for (const access of findedRule.access) {

            if (!access.position || userData.positions.includes(access.position)) {

                const result = {};
                
                if (access.apiBlock || access.userCompare) {

                    const requestJson = await req.json();
                    var userCompare = {};

                    if (access.userCompare) {
                        for (const userIdKey of access.userCompare) {

                            if (Array.isArray(requestJson[userIdKey])) {

                                if (requestJson[userIdKey].length == 0)
                                    return {error: 'Вам отказано в доступе к выполняемой операции'};

                                if (requestJson[userIdKey].filter(element => element != userData.id).length > 0)
                                    return {error: 'Вам отказано в доступе к выполняемой операции'};

                            } else if (requestJson[userIdKey] != userData.id) {
                                return {error: 'Вам отказано в доступе к выполняемой операции'};
                            }

                            userCompare[userIdKey] = true;

                        }
                    }

                    if (access.apiBlock) {
                        for (const editRule of access.apiBlock) {
                            if (requestJson[editRule] && !userCompare[editRule]) {
                                return {error: `Отсутсвует право доступа на редкатирование поля "${editRule}"`};
                            } else {
                                delete requestJson[editRule];
                            }
                        }

                        result.apiBlock = access.apiBlock.join(' ');

                    }

                }

                return result;

            }
        }

        return {error: 'Вашей должности отказано в праве доступа к операции'};

    }

    return {error: 'Отсуствует правило доступа к ресурсу'};

}

export function getApiMethodAccesRules(positions) {

    const regExp = RegExp([
        '/api/method/guard/',
        '/api/method/guardPost/',
        '/api/method/protectedObject/',
        '/api/method/simCard/',
        '/api/method/timesheet/',
        '/api/method/user/',
        '/api/method/userHard/',
        '/dashboard/',
        '/\\^\\\\/dashboard\\\\/',
    ].join('|'), 'ig');

    return [...new Set(FApiMethodAccessRules.reduce((result, value) => {

        let accessName = value.url.toString().replace(regExp, '');

        for (const access of value.access) {

            if (!access.position || positions?.includes(access.position)) {

                Object.keys(access).forEach((key) => {

                    if (key != 'position') {

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
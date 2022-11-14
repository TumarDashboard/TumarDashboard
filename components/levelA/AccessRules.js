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
    {
        url: /^\/api\/method\/changeTimesheet$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM, editBlock: ['rate', 'manager'] },
            { position: positions.FPositionNSO, editBlock: ['rate', 'manager'], userCompare: ['manager'] }
        ]
    },
    {
        url: /^\/api\/method\/changeUser$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: '', editBlock: ['positions'], userCompare: ['id'] }
        ]
    },
    {
        url: /^\/api\/method\/createGuard$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },
    {
        url: /^\/api\/method\/createGuardPost$/, access: [
            { position: positions.FPositionZDIR },
            // { position: positions.FPositionHRM, editBlock: ['rate'] },
            // { position: positions.FPositionNSO, editBlock: ['rate'] }
        ]
    },
    {
        url: /^\/api\/method\/createUserHard$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM }
        ]
    },
    {
        url: /^\/api\/method\/deleteGuard$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },
    {
        url: /^\/api\/method\/deleteGuardPost$/, access: [
            { position: positions.FPositionZDIR }
        ]
    },
    {
        url: /^\/api\/method\/deleteUser$/, access: [
            { position: positions.FPositionZDIR }
        ]
    },
    {
        url: /^\/api\/method\/deleteUserHard$/, access: [
            { position: positions.FPositionZDIR }
        ]
    },
    {
        url: /^\/api\/method\/editGuard$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO }
        ]
    },
    {
        url: /^\/api\/method\/editGuardPost$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionNSO, editBlock: ['rate', 'manager'], userCompare: ['manager']  }
        ]
    },
    {
        url: /^\/api\/method\/editUserHard$/, access: [
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM }
        ]
    },
    {
        url: /^\/api\/method\/getTimesheet$/, access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionBUH },
            { position: positions.FPositionNSO, userCompare: ['manager'] }
        ]
    },
    {
        url: /^\/api\/method\/getTimesheetPrint$/, access: [
            { position: positions.FPositionDIR },
            { position: positions.FPositionZDIR },
            { position: positions.FPositionHRM },
            { position: positions.FPositionNSO },
            { position: positions.FPositionBUH }
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
                                return 'Вы не являетесь правообладателем данных для редактирования';
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

                console.log('access.userCompare %O',access, findedRule);
                return null;

            } 
        }

    }

    return 'Отсуствует правило доступа к ресурсу';

}

export function getApiMethodAccesRules(positions) {
    return [...new Set(FApiMethodAccessRules.reduce((result, value) => {
        try {
            
            let accessName = value.url.toString().replaceAll(/\/\^\\\/api\\\/method\\\/|\$\//ig, '');

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

        } catch (error) {
            console.log('getApiMethodAccesRules error', value);
        }

        return result;

    }, []))];
}
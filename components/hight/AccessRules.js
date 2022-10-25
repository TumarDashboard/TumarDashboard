import * as positions from '../variable/FPositionItemList';

export const FDashboardAccessRules = [
    { url: /\/dashboard\/profile/, access:[] },
    { url: /\/dashboard\/users/, access:[
        positions.FPositionDIR,
        positions.FPositionZDIR,
        positions.FPositionHRM,
    ] },
    { url: /\/dashboard\/guardPosts(?!.)/, access:[
        positions.FPositionDIR,
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
        positions.FPositionBUH,
    ] },
    { url: /\/dashboard\/guardPosts(?=.)/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
    ] },
    { url: /\/dashboard\/guards/, access:[
        positions.FPositionDIR,
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
        positions.FPositionBUH,
    ]  }
];

export const FApiMethodAccessRules = [
    { url: /\/api\/method\/changeTimesheet/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/changeUser/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
    ], accessForUserSelf: true },
    { url: /\/api\/method\/createGuard/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/createGuardPost/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/createUserHard/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/deleteGuard/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/deleteGuardPost/, access:[
        positions.FPositionZDIR,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/deleteUser/, access:[
        positions.FPositionZDIR,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/deleteUserHard/, access:[
        positions.FPositionZDIR,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/editGuard/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/editGuardPost/, access:[
        positions.FPositionZDIR,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/editUserHard/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/getTimesheet/, access:[
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
    ], accessForUserSelf: false },
    { url: /\/api\/method\/getTimesheetPrint/, access:[
        positions.FPositionDIR,
        positions.FPositionZDIR,
        positions.FPositionHRM,
        positions.FPositionNSO,
        positions.FPositionBUH
    ] },
];



import { UsersIcon, UserCircleIcon, BuildingOfficeIcon, UserGroupIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { intersectArraysPositions } from '../../src/utils/arrayUtils';
import { FApiMethodAccessRules } from '../levelA/AccessRules';

const FDashboardItemList = [
    { id: 1, text: 'Профиль', url: '/dashboard/profile', icon: <UserCircleIcon className="h-6 w-6" /> },
    { id: 2, text: 'Пользователи', url: '/dashboard/users', icon: <UsersIcon className="h-6 w-6" /> },
    { id: 3, text: 'Физ. посты', url: '/dashboard/guardPosts', icon: <BuildingOfficeIcon className="h-6 w-6" /> },
    { id: 4, text: 'Охранники', url: '/dashboard/guards', icon: <UserGroupIcon className="h-6 w-6" /> },
    { id: 5, text: 'Пультовые объекты', url: '/dashboard/protectedObjects', icon: <BuildingStorefrontIcon className="h-6 w-6" /> },
    { id: 5, text: 'Сим-карты', url: '/dashboard/simCards', icon: <BuildingStorefrontIcon className="h-6 w-6" /> },
];

const getDashboardItemList = (positions) => {
    // console.log('getDashboardItemList %O', positions.length);
    return FDashboardItemList.filter( ( value ) => {
        const findedRule = FApiMethodAccessRules.find( (rule) => value.url.search(rule.url) > -1 );
        if ( !findedRule ) return false;
        if ( findedRule.access.length == 0 ) return true;
        if ( !positions || positions.length == 0 ) return false;
        return intersectArraysPositions( findedRule.access, positions );
    });
}

export default getDashboardItemList;
import { UsersIcon, UserCircleIcon, OfficeBuildingIcon, UserGroupIcon } from '@heroicons/react/solid';
import { intersectArrays } from '../../src/utils/arrayUtils';
import { FDashboardAccessRules } from '../hight/AccessRules';

const FDashboardItemList = [
    { id: 1, text: 'Профиль', url: '/dashboard/profile', icon: <UserCircleIcon className="h-6 w-6" /> },
    { id: 2, text: 'Пользователи', url: '/dashboard/users', icon: <UsersIcon className="h-6 w-6" /> },
    { id: 3, text: 'Физ. посты', url: '/dashboard/guardPosts', icon: <OfficeBuildingIcon className="h-6 w-6" /> },
    { id: 4, text: 'Охранники', url: '/dashboard/guards', icon: <UserGroupIcon className="h-6 w-6" /> }
];

const getDashboardItemList = (positions) => {
    return FDashboardItemList.filter( ( value ) => {
        const findedRule = FDashboardAccessRules.find( (rule) => value.url.search(rule.url) > -1 );
        if ( findedRule.access.length == 0 ) return true;
        if ( !positions || positions.length == 0 ) return false;
        return intersectArrays( findedRule.access, positions );
    });
}

export default getDashboardItemList;
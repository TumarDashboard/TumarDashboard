import { UsersIcon, UserCircleIcon, OfficeBuildingIcon, UserGroupIcon } from '@heroicons/react/solid';

const FDashboardItemList = [
    { id: 1, text: 'Профиль', url: '/dashboard/profile', icon: <UserCircleIcon className="h-6 w-6" /> },
    // { id: 2, text: 'Пользователи', url: '/dashboard/users', icon: <UsersIcon className="h-6 w-6" /> },
    { id: 3, text: 'Физ. посты', url: '/dashboard/guardPosts', icon: <OfficeBuildingIcon className="h-6 w-6" /> },
    { id: 4, text: 'Охранники', url: '/dashboard/guards', icon: <UserGroupIcon className="h-6 w-6" /> }
];

export default FDashboardItemList;
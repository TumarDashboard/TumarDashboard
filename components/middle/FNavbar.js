import { useStore } from "../hight/StoreProvider";
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { UsersIcon, HomeIcon, UserCircleIcon } from '@heroicons/react/solid';
import FNavbarProfile from '../low/FNavbarProfile';
import FNextLink from '../low/FNextLink';
import FMenuToggle from "../low/FMenuToggle";
import { motion, useCycle } from "framer-motion";
import Link from 'next/link';

const blackBox = {
    visible: {
        height: "100vh",
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: [0.6, -0.05, 0.01, 0.99],
            // when: "beforeChildren",
            staggerChildren: 0.2
        },
    },
    hidden: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.7,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
};

const itemList = [
    { id: 1, text: 'Профиль', url: '/dashboard/profile', icon: <UserCircleIcon className="h-6 w-6" /> },
    { id: 2, text: 'Пользователи', url: '/dashboard/users', icon: <UsersIcon className="h-6 w-6" /> }
];

const itemMotion = {
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
    hidden: {
        x: '100%',
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
};

const FNavbar = observer(function FNavbar() {

    const router = useRouter();

    const user = useStore().MOBXuser;

    const [isSidebar, setSidebar] = useCycle('hidden', 'visible');

    const toggle = () => {
        setSidebar();
    }

    const logout = async (event) => {

        event.preventDefault()

        await user.logout();

        router.push('/');

    }

    return (

        // ${isSidebar ? 'h-20' : 'h-screen md:h-20'}
        
        <nav
            className="fixed z-40 w-full"
            id="FNavbar"
            animate={isSidebar}
            variants={blackBox}
        >
            {/* Кнопка меню */}
            {user?.isAuth ? (
                <FMenuToggle
                    toggle={toggle}
                    open={isSidebar}
                    className="absolute z-30 block md:hidden ml-4 mt-5"
                />
            ) : null}

            {/* md:flex md:items-center md:justify-center */}
            <div className={`fixed w-full h-20 bg-color_A grid grid-cols-3 px-2 sm:px-6 lg:px-8 ${user?.isAuth ? 'xl:pr-28 2xl:pr-80' : 'xl:px-28 2xl:px-80'}`}>

                <div
                    className="flex items-center justify-center
                                row-start-1 col-start-2
                                md:pr-3 md:col-start-1 md:justify-self-start"
                >
                    {/* Логотип */}
                    <img
                        className="block h-16 w-auto"
                        src='/logo.png'
                        alt="Workflow"
                    />

                    {/* Дашборд */}
                    {user?.isAuth ? (
                        <FNextLink
                            href="/dashboard/profile"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md
                                        hidden md:block'
                        >
                            <p className="text-color_G text-2xl font-bold font-font_B">Dashboard</p>
                        </FNextLink>
                    ) : null}

                </div>

                {/* Ссылки */}
                <div className="flex items-center
                                row-start-1 col-start-3 justify-self-end">

                    {/* Ссылка на главную */}
                    {router.pathname != "/" &&
                        <FNextLink
                            href="/"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
                        >
                            <HomeIcon className="h-8 w-8 block md:hidden" />
                            <p className="text-color_G hidden md:block">На главную</p>
                        </FNextLink>
                    }

                    {/* Ссылки на авторизацию */}
                    {user?.isAuth ?
                        <FNavbarProfile
                            userInitials={user?.user?.login}
                            logout={logout}
                        />
                        : router.pathname != "/authorization/login" && router.pathname != "/authorization/registration" &&
                        <FNextLink
                            href="/authorization/login"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
                        >
                            <UserCircleIcon className="h-8 w-8 block md:hidden" />
                            <p className="text-color_G hidden md:block">Войти</p>
                        </FNextLink>
                    }

                </div>

            </div>

            {user?.isAuth ? (
                <motion.div
                    className='absolute z-35 w-full bg-color_A overflow-hidden block md:hidden'
                    key='FNavbarSidebar'
                    initial={false}
                    animate={isSidebar}
                    variants={blackBox}
                >

                    <motion.div
                        initial={false}
                        variants={itemMotion}
                    >
                        <p className="text-color_G text-2xl font-bold font-font_B ml-20 mt-6">Dashboard</p>
                    </motion.div>

                    {itemList.map((item) => {
                        return (
                            <motion.div
                                initial={false}
                                variants={itemMotion}
                                key={`navItem${item.id}`}
                            >
                                <Link
                                    href={item.url}
                                    key={`navItem${item.id}`}
                                >
                                    <a
                                        onClick={toggle}
                                        className={`flex items-center mt-4 py-2 px-4 bg-color_B text-color_F
                                        ${router.pathname == item.url ? '' : 'bg-opacity-25'}`}
                                        key={`navItem${item.id}`}
                                    >
                                        {item.icon}
                                        <p className="mx-3">{item.text}</p>
                                    </a>
                                </Link>
                            </motion.div>
                        )
                    })}

                </motion.div>
            ) : null}

        </nav>

    );

});


export default FNavbar;
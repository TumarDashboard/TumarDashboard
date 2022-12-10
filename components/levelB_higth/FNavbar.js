import { useStore } from "../levelA/StoreProvider";
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { HomeIcon, UserCircleIcon } from '@heroicons/react/solid';
import FNavbarProfile from '../levelE_low/FNavbarProfile';
import FNextLink from '../levelE_low/FNextLink';
import FMenuToggle from "../levelE_low/FMenuToggle";
import { motion, useCycle } from "framer-motion";
import Link from 'next/link';
import Image from "next/legacy/image";
import getDashboardItemList from "../levelZ_variable/FDashboardItemList";

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

const FNavbar = observer( function FNavbar() {

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
            className="block lg:fixed z-40 w-full"
            id="FNavbar"
            animate={isSidebar}
            variants={blackBox}
        >
            {/* Кнопка меню */}
            {user?.isAuth ? (
                <FMenuToggle
                    toggle={toggle}
                    open={isSidebar}
                    className="absolute z-30 block lg:hidden ml-4 mt-5"
                />
            ) : null}

            {/* md:flex md:items-center md:justify-center */}
            <div className={`w-full h-20 bg-color_A grid grid-cols-3 px-2 sm:px-6 lg:px-8 ${user?.isAuth ? 'xl:pr-28 2xl:pr-80' : 'xl:px-28 2xl:px-80'}`}>

                
                <div
                    className="flex items-center justify-center
                                row-start-1 col-start-2
                                lg:pr-3 lg:col-start-1 lg:justify-self-start"
                >
                    {/* Логотип */}
                    <Image
                        className="block h-16 w-auto"
                        width={64} 
                        height={64}
                        src='/logo.png'
                        alt="Workflow"
                    />

                    {/* Дашборд */}
                    {user?.isAuth && 
                    <FNextLink
                        href="/dashboard/profile"
                        className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md
                                    hidden md:block'
                    >
                        {isSidebar=='hidden' && 
                        <p className="text-color_G text-2xl font-bold font-font_B lg:hidden">Dashboard</p>}
                        <p className="text-color_G text-2xl font-bold font-font_B hidden lg:block">Dashboard</p>
                    </FNextLink>}

                </div>
                
                {/* Ссылки */}
                {isSidebar=='hidden' && 
                <div className="flex items-center
                                row-start-1 col-start-3 justify-self-end lg:hidden">

                    {/* Ссылка на главную */}
                    {router.pathname != "/" &&
                        <FNextLink
                            href="/"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
                        >
                            <HomeIcon className="h-8 w-8" />
                        </FNextLink>
                    }

                    {/* Ссылки на авторизацию */}
                    {user?.isAuth ?
                        <FNavbarProfile
                            uiAvatarsSrc={user?.avatar}
                            logout={logout}
                        />
                        : router.pathname != "/authorization/login" && router.pathname != "/authorization/registration" &&
                        <FNextLink
                            href="/authorization/login"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
                        >
                            <UserCircleIcon className="h-8 w-8" />
                        </FNextLink>
                    }
                </div>}
                
                {/* Ссылки */}
                <div className=" items-center
                                row-start-1 col-start-3 justify-self-end hidden lg:flex">

                    {/* Ссылка на главную */}
                    {router.pathname != "/" &&
                        <FNextLink
                            href="/"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
                        >
                            <p className="text-color_G">На главную</p>
                        </FNextLink>
                    }

                    {/* Ссылки на авторизацию */}
                    {user?.isAuth ?
                        <FNavbarProfile
                            uiAvatarsSrc={user?.avatar}
                            logout={logout}
                        />
                        : router.pathname != "/authorization/login" && router.pathname != "/authorization/registration" &&
                        <FNextLink
                            href="/authorization/login"
                            className='text-color_C hover:bg-color_C hover:text-color_G px-3 py-2 rounded-md text-sm font-bold font-font_B'
                        >
                            <p className="text-color_G">Войти</p>
                        </FNextLink>
                    }
                </div>

            </div>

            {user?.isAuth ? (
                <motion.div
                    className='absolute top-20 z-50 w-full bg-color_A block lg:hidden overflow-hidden'
                    key='FNavbarSidebar'
                    initial={false}
                    animate={isSidebar}
                    variants={blackBox}      
                    onAnimationStart={(variant) => {
                        if( variant == 'visible' ){
                            document.body.classList.add("overflow-hidden")
                        }else{
                            document.body.classList.remove("overflow-hidden")
                        }
                    }}
                >
                    <div className='h-full flex flex-col overflow-y-auto'>
                        { getDashboardItemList( user?.positions ).map((item) => {

                            return (
                                <motion.div
                                    initial={false}
                                    variants={itemMotion}
                                    key={`navItem${item.id}`}
                                >
                                    <Link
                                        href={item.url}
                                        key={`navItem${item.id}`}
                                        onClick={toggle}
                                        className={`flex items-center mt-4 py-2 px-4 bg-color_B text-color_F
                                        ${router.pathname.includes(item.url) ? '' : 'bg-opacity-25'}`}
                                        legacyBehavior>
                                        {item.icon}
                                        <p className="mx-3">{item.text}</p>
                                    </Link>
                                </motion.div>
                            );
                        }) }
                    </div>

                </motion.div>
            ) : null}

        </nav>
    );

});


export default FNavbar;
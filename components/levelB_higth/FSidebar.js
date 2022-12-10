import Link from 'next/link';
import { useStore } from "../levelA/StoreProvider";
import { observer } from 'mobx-react-lite';
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import getDashboardItemList from "../levelZ_variable/FDashboardItemList";

const background = {
    initial: {
        x: '-16em',
        opacity: 0
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: [0.6, -0.05, 0.01, 0.99],
            when: "beforeChildren",
            staggerChildren: 0.5
        },
    },
    exit: {
        x: '-16em',
        opacity: 0
    },
};

const itemMotion = {
    initial: {
        y: -20,
        opacity: 0
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: [0.6, -0.05, 0.01, 0.99],
        },
    },
};

const FSidebar = observer( function FSidebar() {

    const user = useStore().MOBXuser;

    const router = useRouter();

    return (

        <aside
            id="sidebar"
            className="fixed hidden z-20 lg:flex h-full pt-20"
            aria-label="Sidebar"
        >
            <motion.nav
                initial="initial"
                animate="animate"
                exit="exit"
                key='FSidebar'
                variants={background}
                className="flex flex-col w-64 bg-color_A min-h-full pt-2"
            >
                {getDashboardItemList( user?.positions ).map((item) => {
                    return (
                        <motion.div
                            variants={itemMotion}
                            key={`navItem${item.id}`}
                        >
                            <Link
                                href={item.url}
                                key={`navItem${item.id}`}
                                className={`flex items-center mt-4 py-2 px-4 bg-color_C text-color_F
                                ${router.pathname.includes(item.url) ? '' : 'bg-opacity-25'}`}
                            >
                                {item.icon}
                                <p className="mx-3">{item.text}</p>
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.nav>
        </aside>
    );

});

export default FSidebar;
import Link from 'next/link';
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import FDashboardItemList from '../variable/FDashboardItemList';

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

export default function FSidebar() {

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
                className="flex flex-col w-64 bg-color_A min-h-full"
            >
                {FDashboardItemList.map((item) => {
                    return (
                        <motion.div
                            variants={itemMotion}
                            key={`navItem${item.id}`}
                        >
                            <Link
                                href={item.url}
                                key={`navItem${item.id}`}
                            >
                                <a
                                    className={`flex items-center mt-4 py-2 px-4 bg-color_C text-color_F
                                    ${router.pathname.includes(item.url) ? '' : 'bg-opacity-25'}`}
                                    key={`navItem${item.id}`}
                                >
                                    {item.icon}
                                    <p className="mx-3">{item.text}</p>
                                </a>
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.nav>
        </aside>
    );

}
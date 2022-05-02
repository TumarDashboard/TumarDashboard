import { motion } from "framer-motion";
import { FSplitWord } from "../../low/FSplitWord";

const img = {
    initial: {
        y: '50%',
        borderTopRightRadius: 0,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        borderTopRightRadius: '15rem',
        transition: {
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    },
    exit: {
        y: '-50%',
        opacity: 0,
        borderTopRightRadius: 0,
        transition: {
            delay: 0.3,
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    }
}

const circle = {
    initial: {
        scale: 0
    },
    animate: {
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    },
    exit: {
        scale: 0,
        transition: {
            delay: 0.3,
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    }
}

const text = {
    initial: i => ({
        opacity: 0,
    }),
    animate: i => ({
        opacity: 1,
        transition: {
            delay: 0.3,
            duration: Math.random(),
            ease: [0.87, 0, 0.83, 1]
        }
    }),
    exit: i => ({
        opacity: 0,
        transition: {
            duration: Math.random() / 3,
            ease: [0.87, 0, 0.83, 1]
        }
    })
}

const icon = {
    initial: i => ({
        opacity: 0,
        rotate: 50 - i * 5
    }),
    animate: i => ({
        opacity: 1,
        rotate: -90 + i * 15,
        transition: {
            delay: 0.1 * i,
            duration: 0.6,
            ease: [0.87, 0, 0.83, 1]
        }
    }),
    exit: i => ({
        opacity: 0,
        rotate: -110,
        transition: {
            delay: 0.1 * i,
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    })
}

const icons = [
    { icon: '/TechnologyIcons/next.svg', href: 'https://nextjs.org/', tooltip: 'Next' },
    { icon: '/TechnologyIcons/mongo.svg', href: 'https://angular.io/', tooltip: 'Angular' },
    { icon: '/TechnologyIcons/cube.svg', href: 'https://cube.dev/', tooltip: 'Cube' },
    { icon: '/TechnologyIcons/postgresql.svg', href: 'https://ru.wikipedia.org/wiki/JavaScript', tooltip: 'Javascript' },
    { icon: '/TechnologyIcons/java.svg', href: 'https://ru.wikipedia.org/wiki/Java', tooltip: 'Java' },
    { icon: '/TechnologyIcons/apachpoi.svg', href: 'https://www.typescriptlang.org/', tooltip: 'Typescript' },
]

const info = [
    { text: 'Ну тут всё очень кратко и просто. Авторизация этого сайта – это', style: 'text-black' },
    { text: 'Next', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'JWT', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'MongoDB', style: 'font-extrabold text-color_C' },
    { text: '. Изучая', style: 'text-black' },
    { text: 'Cube', style: 'font-extrabold text-color_C' },
    { text: 'приходилось поднимать', style: 'text-black' },
    { text: 'PostgreSQL', style: 'font-extrabold text-color_C' },
    { text: 'на облаке', style: 'text-black' },
    { text: 'AWS', style: 'font-extrabold text-color_C' },
    { text: '. И естественно мои симпатии не на стороне реляционных БД. Это я Вам официально заявляю - как человек, никогда не погружавшийся в', style: 'text-black' },
    { text: 'Data Science', style: 'font-extrabold text-color_C' },
    { text: '. Из остальных моих знаний в этой области – это', style: 'text-black' },
    { text: 'java', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'apache POI', style: 'font-extrabold text-color_C' },
    { text: 'для обработки документов', style: 'text-black' },
    { text: 'Microsoft Office', style: 'font-extrabold text-color_C' },
    { text: '. Ну и общие знания о многопоточности и асинхронности этого языка.', style: 'text-black' },
]

export default function FAboutBackend() {
    return (

        <div
            className="relative
            grid grid-cols-6 grid-rows-6
            mx-5
            justify-items-end
            "
        >

            <div
                className="
                h-[18rem] lg:h-[24rem] 2xl:h-[30rem] 
                w-[36rem] lg:w-[48rem] 2xl:w-[60rem]
                col-start-1 col-span-5 row-start-2 row-span-5
                ">

                <motion.img
                    key='FAboutBackend'
                    src='/AboutBackend.png'
                    className="w-full h-full"
                    alt="Self image"
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={img}
                />

            </div>

            <div
                className="absolute overflow-hidden w-full h-full
                    col-start-1 col-span-6 row-start-1 row-span-6
                    "
            >
                <motion.div
                    className="absolute rounded-full bg-white w-[100vh] h-[100vh]
                    -bottom-[85vh]
                    -right-[5vh]
                    "
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={circle}
                >

                </motion.div>

            </div>

            {icons.map((value, i) => {
                return (
                    <motion.div
                        key={value.icon + i}
                        className="col-start-4 col-span-1 row-start-5 row-span-1"
                        initial='initial'
                        animate='animate'
                        exit='exit'
                        variants={icon}
                        custom={i}
                    >
                        <div
                            className='group 
                            translate-x-56 lg:translate-x-72 2xl:translate-x-96'
                        >
                            <a
                                href={value.href}
                                rel='noopener noreferrer'
                                target="_blank"
                            >
                                <div>
                                    <motion.img
                                        src={value.icon}
                                        className='w-10 h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16'
                                        animate={{ rotate: `${90 - i * 15}deg` }}
                                        whileHover={{ scale: 1.2 }}
                                        alt={value.icon}    
                                    />
                                    <span className='hidden group-hover:block
                                    absolute top-0 z-10 p-2 -mt-1 
                                    text-sm font-extrabold text-white 
                                    bg-orange-500 rounded-lg shadow-lg'
                                        style={{ transform: `translate(-100%, 100%) rotate(${90 - i * 15}deg)` }}
                                    >
                                        {value.tooltip}
                                    </span>
                                </div>
                            </a>
                        </div>
                    </motion.div>
                )

            })}

            <div
                className="absolute col-start-1 col-span-6 row-start-6 row-span-1
                w-[70vh]"
            >
                <div
                    className="flex flex-wrap space-x-1 justify-center w-full"
                >
                    {info.map((value, i) => {

                        let words = value.text.split(' ');

                        return words.map((word, i) => {
                            return (
                                <div key={word + i} className=''>
                                    <FSplitWord
                                        className={`text-sm lg:text-sm xl:text-sm 2xl:text-sm fl:text-sm font-font_B ${value.style}`}
                                        initial='initial'
                                        animate='animate'
                                        exit='exit'
                                        variants={text}
                                    >
                                        {word}
                                    </FSplitWord>
                                </div>
                            )
                        })

                    })}

                </div>

            </div>

        </div >
    );
};
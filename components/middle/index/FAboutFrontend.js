import { motion } from "framer-motion";
import { FSplitWord } from "../../low/FSplitWord";

const img = {
    initial: {
        x: '50%',
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    },
    exit: {
        x: '-50%',
        opacity: 0,
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
        rotate: 330 - i * 5
    }),
    animate: i => ({
        opacity: 1,
        rotate: 430 - i * 15,
        transition: {
            delay: 0.1 * i,
            duration: 0.6,
            ease: [0.87, 0, 0.83, 1]
        }
    }),
    exit: i => ({
        opacity: 0,
        rotate: 450,
        transition: {
            delay: 0.1 * i,
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    })
}

const icons = [
    { icon: '/TechnologyIcons/angular.svg', href: 'https://angular.io/', tooltip: 'Angular' },
    { icon: '/TechnologyIcons/chart.svg', href: 'https://www.chartjs.org/', tooltip: 'Chart' },
    { icon: '/TechnologyIcons/cube.svg', href: 'https://cube.dev/', tooltip: 'Cube' },
    { icon: '/TechnologyIcons/javascript.svg', href: 'https://ru.wikipedia.org/wiki/JavaScript', tooltip: 'Javascript' },
    { icon: '/TechnologyIcons/mobx.svg', href: 'https://mobx.js.org/README.html', tooltip: 'MobX' },
    { icon: '/TechnologyIcons/next.svg', href: 'https://nextjs.org/', tooltip: 'Next' },
    { icon: '/TechnologyIcons/typescript.svg', href: 'https://www.typescriptlang.org/', tooltip: 'Typescript' },
]


const info = [
    { text: 'Мои знания', style: 'text-black' },
    { text: 'javascript', style: 'font-extrabold text-color_C' },
    { text: 'скорее на среднем уровне. Для сборки этого сайта используются', style: 'text-black' },
    { text: 'React', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'Next', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'MobX', style: 'font-extrabold text-color_C' },
    { text: ', но я так же изучал', style: 'text-black' },
    { text: 'Angular', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'Chart', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'Сube', style: 'font-extrabold text-color_C' },
    { text: '- но только на уровне «Getting Starting with Cube». Опять же, сырой', style: 'text-black' },
    { text: 'js', style: 'font-extrabold text-color_C' },
    { text: 'мне понравился больше', style: 'text-black' },
    { text: 'TypeScript’а', style: 'font-extrabold text-color_C' },
    { text: ', но при необходимости – я не вижу проблем в изучении второго.', style: 'text-black' },
]

export default function FAboutFrontend() {
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
                    key='FAboutFrontend'
                    src='/AboutFrontend.png'
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
                    -top-[70vh] lg:-top-[70vh] xl:-top-[70vh] fl:-top-[70vh] 2fl:-top-[80vh] 
                    left-[10vh] lg:left-[30vh] xl:left-[30vh] fl:left-[40vh] 2fl:left-[20vh]
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
                        className="col-start-4 col-span-1 row-start-4 fl:row-start-3 2fl:row-start-4 row-span-1"
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
                                        animate={{ rotate: `${i * 15 + 290}deg` }}
                                        whileHover={{ scale: 1.2 }}
                                        alt={value.icon}
                                    />
                                    <span className='hidden group-hover:block
                                    absolute top-0 z-10 p-2 -mt-1 
                                    text-sm font-extrabold text-white 
                                    bg-orange-500 rounded-lg shadow-lg'
                                        style={{ transform: `translate(-100%, 100%) rotate(${i * 15 + 290}deg)` }}
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
                className="absolute col-start-4 col-span-2 row-start-1 row-span-1
                w-[35vh]"
            >
                <div
                    className="flex flex-wrap space-x-1 justify-end mt-5"
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
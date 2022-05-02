import { motion } from "framer-motion";
import { FSplitWord } from "../../low/FSplitWord";

const img = {
    initial: {
        x: '-40%',
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
        x: '40%',
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
        rotate: 135 - i * 5
    }),
    animate: i => ({
        opacity: 1,
        rotate: 235 - i * 20,
        transition: {
            delay: 0.1 * i,
            duration: 0.6,
            ease: [0.87, 0, 0.83, 1]
        }
    }),
    exit: i => ({
        opacity: 0,
        rotate: 270,
        transition: {
            delay: 0.1 * i,
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    })
}

const icons = [
    { icon: '/TechnologyIcons/html.svg', href: 'https://ru.wikipedia.org/wiki/HTML5', tooltip: 'HTML' },
    { icon: '/TechnologyIcons/css.svg', href: 'https://ru.wikipedia.org/wiki/CSS', tooltip: 'CSS' },
    { icon: '/TechnologyIcons/bootstrap.svg', href: 'https://getbootstrap.com/', tooltip: 'Bootstrap' },
    { icon: '/TechnologyIcons/tailwind.svg', href: 'https://tailwindcss.com/', tooltip: 'Tailwind' },
    { icon: '/TechnologyIcons/framer.svg', href: 'https://www.framer.com/', tooltip: 'Framer' },
    { icon: '/TechnologyIcons/phaser.png', href: 'http://phaser.io/', tooltip: 'Phaser' },
]

const info = [
    { text: 'У меня есть начальные знания о работе с ', style: 'text-black' },
    { text: 'HTML ', style: 'font-extrabold text-color_C' },
    { text: 'и ', style: 'text-black' },
    { text: 'CSS', style: 'font-extrabold text-color_C' },
    { text: ', которые в основном складываются на изучении адаптивности дизайна в ', style: 'text-black' },
    { text: 'Adobe Dreamweaver', style: 'font-extrabold text-color_C' },
    { text: '. Здесь мне действительно проще работать с сырыми ', style: 'text-black' },
    { text: 'bootstrap ', style: 'font-extrabold text-color_C' },
    { text: 'или ', style: 'text-black' },
    { text: 'tailwindcss', style: 'font-extrabold text-color_C' },
    { text: '. Для анимации компонентов на этом сайте используется ', style: 'text-black' },
    { text: 'framer-motion', style: 'font-extrabold text-color_C' },
    { text: ', но если будет нужно - можно вспомнить основы ', style: 'text-black' },
    { text: 'HTML5', style: 'font-extrabold text-color_C' },
    { text: ', и подключить ', style: 'text-black' },
    { text: 'Phaser', style: 'font-extrabold text-color_C' },
    { text: '. А если очень нужно – то вспомнить ', style: 'text-black' },
    { text: 'actionscript ', style: 'font-extrabold text-color_C' },
    { text: 'и перекатиться в ', style: 'text-black' },
    { text: 'Adobe Animate', style: 'font-extrabold text-color_C' },
    { text: '.', style: 'text-black' },
]

export default function FAboutPageProofs() {
    return (

        <div
            className="relative
            grid grid-cols-6 grid-rows-6
            mx-5
            "
        >

            <div
                className="
                h-[18rem] lg:h-[24rem] 2xl:h-[30rem] 
                w-[36rem] lg:w-[48rem] 2xl:w-[60rem]
                col-start-2 col-span-5 row-start-1 row-span-5
                ">

                <motion.img
                    key='FAboutPageProofs'
                    src='/AboutPageProofs.png'
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
                    col-start-1 col-span-6 row-start-3 row-span-4
                    "
            >

                <motion.div
                    className="absolute rounded-full bg-white w-[100vh] h-[100vh]
                    top-0 -left-[25vh] fl:-left-[20vh] 2fl:-left-[25vh]
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
                        className="col-start-2 col-span-1 row-start-4 row-span-1"
                        initial='initial'
                        animate='animate'
                        exit='exit'
                        variants={icon}
                        custom={i}
                    >
                        <div
                            className='group 
                            translate-x-48 lg:translate-x-64 2xl:translate-x-96'
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
                                        animate={{ rotate: `${i * 20 + 125}deg` }}
                                        whileHover={{ scale: 1.2 }}
                                        alt={value.icon}
                                    />
                                    <span className='hidden group-hover:block
                                    absolute top-0 z-10 p-2 -mt-1 
                                    text-sm font-extrabold text-white 
                                    bg-orange-500 rounded-lg shadow-lg'
                                        style={{ transform: `translate(-100%, 100%) rotate(${i * 20 + 125}deg)` }}
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
                className="absolute col-start-2 col-span-1 row-start-4 row-span-1
                w-[35vh]"
            >
                <div
                    className="flex flex-wrap space-x-1 justify-start"
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
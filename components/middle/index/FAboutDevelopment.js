import { motion } from "framer-motion";
import { FSplitWord } from "../../low/FSplitWord";

const img = {
    initial: {
        y: '50%',
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    },
    exit: {
        y: '-50%',
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
        rotate: -45 - i * 5
    }),
    animate: i => ({
        opacity: 1,
        rotate: -110 + i * 15,
        transition: {
            delay: 0.1 * i,
            duration: 0.6,
            ease: [0.87, 0, 0.83, 1]
        }
    }),
    exit: i => ({
        opacity: 0,
        rotate: -150,
        transition: {
            delay: 0.1 * i,
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    })
}

const icons = [
    { icon: '/TechnologyIcons/java.svg', href: 'https://ru.wikipedia.org/wiki/Java', tooltip: 'Java' },
    { icon: '/TechnologyIcons/delphi.png', href: 'https://www.embarcadero.com/ru/products/delphi', tooltip: 'Delphi' },
]

const info = [
    { text: 'Для оптимизации небольших операционных задач, или разработки решений в каких-либо периферийных целях можно предложить', style: 'text-black' },
    { text: 'Java', style: 'font-extrabold text-color_C' },
    { text: ', ну или если нужна продвинутая визуализация', style: 'text-black' },
    { text: 'Delphi', style: 'font-extrabold text-color_C' },
    { text: '+', style: 'text-black' },
    { text: 'DirectX', style: 'font-extrabold text-color_C' },
    { text: '. Я писал несколько небольших приложений, одно из которых было на', style: 'text-black' },
    { text: 'java', style: 'font-extrabold text-color_C' },
    { text: '– формирование десятка различных сопроводительных документов на основании вводимых реквизитов Заказчика (акты ввода в эксплуатацию), а другое – это стенд для демонстрации сеансов показа и цен в кинотеатре Арсенал – на', style: 'text-black' },
    { text: 'delphi', style: 'font-extrabold text-color_C' },
    { text: '.', style: 'text-black' },
]

export default function FAboutDevelopment() {
    return (

        <div
            className="relative
            grid grid-cols-6 grid-rows-6
            mx-5
            justify-items-end
            place-items-center
            "
        >

            <div
                className="
                h-[18rem] lg:h-[24rem] 2xl:h-[30rem] 
                w-[36rem] lg:w-[48rem] 2xl:w-[60rem]
                col-start-1 col-span-5 row-start-1 row-span-5
                ">

                <motion.img
                    key='FAboutDevelopment'
                    src='/AboutDevelopment.png'
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
                    col-start-1 lg:col-start-2 col-span-6 row-start-2 lg:row-start-3 row-span-6
                    "
            >
                <motion.div
                    className="absolute rounded-[50%] bg-white w-[200vh] h-[40vh]
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
                        className="col-start-5 col-span-1 row-start-6 row-span-1"
                        initial='initial'
                        animate='animate'
                        exit='exit'
                        variants={icon}
                        custom={i}
                    >
                        <div
                            className='group 
                            translate-x-56 lg:translate-x-64 2xl:translate-x-72'
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
                                        animate={{ rotate: `${110 - i * 15}deg` }}
                                        whileHover={{ scale: 1.2 }}
                                        alt={value.icon}    
                                    />
                                    <span className='hidden group-hover:block
                                    absolute top-0 z-10 p-2 -mt-1 
                                    text-sm font-extrabold text-white 
                                    bg-orange-500 rounded-lg shadow-lg'
                                        style={{ transform: `translate(120%, 150%) rotate(${110 - i * 15}deg)` }}
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
                className="absolute col-start-6 col-span-6 row-start-3 row-span-4
                w-[70vh]"
            >
                <div
                    className="flex flex-wrap space-x-1 justify-end w-full"
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
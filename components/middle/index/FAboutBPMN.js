import { motion } from "framer-motion";
import { FSplitWord } from "../../low/FSplitWord";

const img = {
    initial: {
        y: '-50%',
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
        y: '50%',
        opacity: 0,
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
    initial: {
        opacity: 0,
        scale: 1.2,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.87, 0, 0.83, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 2,
        transition: {
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    }
}

const info = [
    { text: 'Некоторое время я работал с автоматизацией бизнес процессов на системе', style: 'text-black' },
    { text: 'SimBase', style: 'font-extrabold text-color_C' },
    { text: ', где и получил навыки работы с нотацией моделирования бизнес процессов, а также общие сведения о принципах и целях бизнес-аналитики.', style: 'text-black' },
]

export default function FAboutBPMN() {
    return (

        <div
            className="relative
            grid grid-cols-6 grid-rows-6
            mx-5
            place-items-center
            justify-items-center
            "
        >

            <div
                className="
                h-[18rem] lg:h-[24rem] 2xl:h-[30rem] 
                w-[28rem] lg:w-[40rem] 2xl:w-[50rem]
                col-start-3 col-span-4 row-start-1 row-span-6
                ">

                <motion.img
                    key='FAboutBPMN'
                    src='/AboutBPMN.png'
                    className="w-full h-full"
                    alt="Self image"
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={img}
                />

            </div>


            <div
                className='group 
                col-start-1 col-span-2 row-start-1 row-span-1'
            >
                <a
                    href='https://www.simourg.com/'
                    rel='noopener noreferrer'
                    target="_blank"
                >
                    <div>
                        <motion.img
                            src='/TechnologyIcons/simbase.png'
                            className='w-full'
                            alt='/TechnologyIcons/simbase.png'   
                            whileHover={{ scale: 1.2 }}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            variants={icon}
                        />
                    </div>
                </a>
            </div>

            <div
                className="absolute col-start-1 col-span-2 row-start-2 row-span-5
                p-2"
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
                                        className={`text-sm lg:text-xl xl:text-xl 2xl:text-3xl fl:text-3xl font-font_B ${value.style}`}
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
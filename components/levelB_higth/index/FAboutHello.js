import { motion } from "framer-motion";
import { FSplitWord } from "../../levelE_low/FSplitWord";

const img = {
    initial: {
        opacity: 0,
        scale: 1
    },
    animate: {
        opacity: 1,
        scale: [1, 1.05, 1],
        transition: {
            duration: 1,
            ease: [0.87, 0, 0.83, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 3,
        transition: {
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
            duration: Math.random(),
            ease: [0.87, 0, 0.83, 1]
        }
    }),
    exit: i => ({
        opacity: 0,
        // scale: 10,
        transition: {
            duration: 0.3,
            ease: [0.87, 0, 0.83, 1]
        }
    })
}

const info = [
    {text:'О Х Р А Н Н О Е', style:'font-bold'},
    // {text:'К О М П А Н И Я', style:''},
    {text:'А Г Е Н С Т В О', style:'font-bold'}
]

export default function FAboutHello() {
    return (
        <div
        className="select-none">

            <motion.img
                key='FHeadSelf'
                className="mx-auto w-40"
                src='/imageSelf.png'
                alt="Self image"
                initial='initial'
                animate='animate'
                exit='exit'
                variants={img}
            />

            <div
                className="flex flex-wrap justify-center p-5 lg:p-10 mm:space-x-8"
            >
                {info.map((value) => {
                    return <div key={value.text}>
                        <FSplitWord
                            className={`text-2xl sm:text-4xl text-color_E font-font_A text-center ${value.style}`}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            variants={text}
                        >
                            {value.text}
                        </FSplitWord>
                    </div>
                })}

            </div>

        </div >
    );
};
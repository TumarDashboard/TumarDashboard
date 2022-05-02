import { motion } from "framer-motion";
import { FSplitWord } from "../../low/FSplitWord";

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
    {text:'П Р И В Е Т, ', style:'font-bold'},
    {text:'Я  Т А Л Г А Т, ', style:'font-bold'},
    {text:'И  Я  П Р О Г Р А М М И С Т', style:''}
]

export default function FAboutHello() {
    return (
        <div>

            <motion.img
                key='FHeadSelf'
                className="mx-auto"
                src='/imageSelf.png'
                alt="Self image"
                initial='initial'
                animate='animate'
                exit='exit'
                variants={img}
            />

            <div
                className="flex flex-wrap justify-center p-10 mm:space-x-8"
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
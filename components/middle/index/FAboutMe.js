import { FSplitWord } from "../../low/FSplitWord";

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

const info = [
    { text: 'Моя основная специальность – Строительство гражданских зданий и сооружений. По своей основной профессии – я прошёл путь от разнорабочего до руководителя среднего звена в частной охранной фирме, где вёл работу отдела по монтажу и обслуживанию охранно-пожарной сигнализации и систем видеонаблюдения. В это же время мне удавалось уделять немного времени своему хобби – программированию. Сейчас, я готов начать с позиции', style: 'text-black' },
    { text: 'junior', style: 'font-extrabold text-color_C' },
    { text: '-программиста. ', style: 'text-black' },
]

export default function FAboutMe() {
    return (

        <div
            className="grid grid-cols-2 grid-rows-4 
            w-full 
            px-2 sm:px-6 lg:px-8 xl:px-28 2xl:px-80
            place-items-center
            justify-items-center
            "
        >
            <div
                className="col-start-1 col-span-2 row-start-1 row-span-2
                flex flex-wrap space-x-1 justify-center w-full"
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

            <a
                href='https://wa.me/77004547327'
                rel='noopener noreferrer'
                target="_blank"
                className="col-start-1 col-span-1 row-start-4 row-span-1
                flex flex-wrap space-x-1 justify-center"
            >
                <FSplitWord
                    className={`text-sm lg:text-xl xl:text-xl 2xl:text-3xl fl:text-3xl font-font_B font-extrabold text-color_C`}
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={text}
                >
                    +77004547327
                </FSplitWord>
            </a>

            <a
                href='https://hh.kz/resume/2701625dff087ec6f40039ed1f31516e346d69'
                rel='noopener noreferrer'
                target="_blank"
                className="col-start-2 col-span-1 row-start-4 row-span-1
                flex flex-wrap space-x-1 justify-center"
            >
                <FSplitWord
                    className={`text-sm lg:text-xl xl:text-xl 2xl:text-3xl fl:text-3xl font-font_B font-extrabold text-color_C`}
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={text}
                >
                    Резюме
                </FSplitWord>
            </a>

        </div>
    );
};
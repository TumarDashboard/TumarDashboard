import Head from 'next/head'
import Link from 'next/link'
import { motion } from "framer-motion";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 2 : 0.5,
    },
  },
});

const title = {
  initial: { y: -100, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

const text = {
  initial: { y: -20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

export default function Custom404({ isFirstMount }) {
  
  return (
    <div className="m-auto">
      <Head>
        <title>Ошибка</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.section exit={{ opacity: 0 }}>

        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="text-center"
        >

          <motion.h1 variants={title} className="text-color_B text-6xl sm:text-9xl font-font_B">
            404
          </motion.h1>

          <motion.h2 variants={text} className="text-color_B text-2xl sm:text-3xl font-font_B">
            Страница не найдена
          </motion.h2>

          <Link href="/">
            <motion.a variants={text} className='text-color_B hover:text-color_E py-2 font-bold font-font_B underline'>
              Вернуться на главную
            </motion.a>
          </Link>

        </motion.div>

      </motion.section>
    </div>
  )
}
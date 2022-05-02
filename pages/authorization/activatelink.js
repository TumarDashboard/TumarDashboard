import Head from 'next/head'
import FFormActivateLink from '../../components/middle/FFormActivateLink';
import { motion } from "framer-motion";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function ActivateLink({ isFirstMount }) {
  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Активация</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
        >
          <FFormActivateLink />
        </motion.div>
      </motion.section>
    </div>
  )
}
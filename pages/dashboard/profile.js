import Head from 'next/head'
import { motion } from "framer-motion";
import FSidebar from '../../components/middle/FSidebar';
import FFormProfile from '../../components/middle/FFormProfile';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Profile({ isFirstMount }) {
  return (
    <>
      <Head>
        <title>Профиль</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex overflow-hidden"
        >
          {/* <FSidebar /> */}
          <FFormProfile/>
        </motion.div>
      </motion.section>
    </>
  )
}

Profile.onSidebar = true;

export async function getStaticProps(context) {
  return {
    props: { initialState: { checkAuth: true } },
  }
}
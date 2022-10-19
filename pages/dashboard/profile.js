import Head from 'next/head'
import { motion } from "framer-motion";
import FFormProfile from '../../components/middle/FFormProfile';
import catchAuthServer from '../../middleware/authServer';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Profile({ userData, isFirstMount }) {

  return (
    <div
      className="flex-1 bg-color_C"
    >
      <Head>
        <title>Профиль</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section
        exit={{ opacity: 0 }}
        className="grow"
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex overflow-hidden"
        >
           <FFormProfile
            userData={userData}
           />
        </motion.div>
      </motion.section>
    </div>
  )
}

Profile.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;

  if( userData ){
    userData.id = userData.id.toString();
    if( userData.manager ){
      userData.manager._id = userData.manager._id.toString();
    }
  }

  return {
    props: { userData, initialState: { checkAuth: true } }
  }

})
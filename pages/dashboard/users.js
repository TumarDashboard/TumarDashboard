import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FSidebar from '../../components/middle/FSidebar';
import FFormUsers from '../../components/middle/FFormUsers';
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import DTOUser from "../../src/auth/dtos/dtoUser";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Users({ isFirstMount, users }) {
  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Пользователи</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex overflow-hidden"
        >
          {/* <FSidebar /> */}
          <FFormUsers
            users={users}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

Users.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  await mongoConnect();

  const responce = await mongoUserModel.find({},
    {
      password: 0,
      activationLink: 0,
      __v: 0
    });

  const users = responce.map((user) => {
    return {
      login: user.login,
      email: user.email,
      isActivated: user.isActivated,
      id: JSON.stringify(user._id)
    }
  })

  return {
    props: { users: users }
  }

})
import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormUsers from '../../components/levelB_higth/FFormUsers';
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { getPositionWithCodeList } from '../../components/levelZ_variable/FPositionItemList';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Users({ isFirstMount, accessRules, userData, users }) {
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
          <FFormUsers
            accessRules={accessRules}
            userData={userData}
            users={users}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

Users.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;
  const accessRules = context.accessRules;

  await mongoConnect();

  const users = await mongoUserModel.find({},'-password -activationLink -__v').lean();

  users.forEach(value=>{
    value._id = value._id.toString();
    if(value.positions){
      value.positionsText = getPositionWithCodeList(value.positions);
    }
  })

  return {
    props: { accessRules, userData, users: users }
  }

})
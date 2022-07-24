import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormGuardPosts from '../../components/middle/FFormGuardPosts';
import mongoGuardPostsModel from "../../src/mongo/models/mongoGuardPostsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function GuardPosts({ isFirstMount, ...props }) {
  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Физические посты</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex overflow-hidden"
        >
          <FFormGuardPosts
            guardPosts={props.guardPosts}
            users={props.users}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

GuardPosts.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {
  await mongoConnect();

  const guardPosts = await mongoGuardPostsModel.find().populate('manager', 'surname firstName').lean();
  
  guardPosts.sort((a,b)=>{
    return (a.number === undefined || a.number === null) - (b.number === undefined || b.number === null) ||
    a.number - b.number ||
    a.address.localeCompare(b.address)
  }).forEach(value=>{
    value._id = value._id.toString();
    if( value.manager ){
      value.manager._id = value.manager._id.toString();
    }
  })
  
  const users = await mongoUserModel.find({},'surname firstName').lean();

  users.forEach(value=>{
    value._id = value._id.toString();
  })

  return {
    props: { guardPosts, users, initialState: { checkAuth: true } }
  }

})
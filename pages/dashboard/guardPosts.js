import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormGuardPosts from '../../components/levelB_higth/FFormGuardPosts';
import mongoGuardPostsModel from "../../src/mongo/models/mongoGuardPostsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function GuardPosts({ isFirstMount, accessRules, guardPosts, users }) {
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
            accessRules={accessRules}
            guardPosts={guardPosts}
            users={users}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

GuardPosts.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const accessRules = context.accessRules;
  
  await mongoConnect();

  const guardPosts = await mongoGuardPostsModel.find({}, null, {sort: {'manager': 1, 'number': 1}}).populate('manager', 'surname firstName').lean();
  
  // guardPosts.sort((a,b)=>{    
  //   return (a.manager === undefined || a.manager === null) - (b.manager === undefined || b.manager === null)||
  //   a.manager.surname.localeCompare(b.manager.surname) ||
  //   a.number - b.number 
  //   // return (a.number === undefined || a.number === null) - (b.number === undefined || b.number === null) ||
  //   // a.number - b.number ||
  //   // a.callsign.localeCompare(b.callsign)
  // })
  guardPosts.forEach(value=>{
    value._id = value._id.toString();
    if( value.manager ){
      value.manager._id = value.manager._id.toString();
    }
  })
  
  const users = await mongoUserModel.find({positions: FPositionNSO},'surname firstName').lean();

  users.forEach(value=>{
    value._id = value._id.toString();
  })

  return {
    props: { accessRules, guardPosts, users, initialState: { checkAuth: true } }
  }

})
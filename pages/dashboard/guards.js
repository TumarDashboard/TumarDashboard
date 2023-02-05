import Head from 'next/head'
import { AnimatePresence, motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormGuards from '../../components/levelB_higth/FFormGuards';
import mongoGuardsModel from "../../src/mongo/models/mongoGuardsModel";
import mongoGuardPostsModel from "../../src/mongo/models/mongoGuardPostsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';
import FFormGuardPostsArchive from '../../components/levelB_higth/guardPosts/FFormGuardPostsArchive';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Guards({ isFirstMount, accessRules, userData, guards, guardPosts, users }) {

  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Физические посты</title>
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
          <FFormGuards
            accessRules={accessRules}
            userData={userData}
            guards={guards}
            guardPosts={guardPosts}
            users={users}
          />
        </motion.div>

      </motion.section>
    </div>
  )
}

Guards.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;
  const accessRules = context.accessRules;

  await mongoConnect();

  const guards = await mongoGuardsModel.find({}, null, { sort: { 'manager': 1, 'surname': 1, 'firstName': 1, } }).populate('manager', 'surname firstName').populate('guardPosts', 'id').lean();

  guards.forEach(value => {
    value._id = value._id.toString();
    if (value.manager) {
      value.manager._id = value.manager._id.toString();
    } else {
      value.manager = { _id: "EMPTY" }
    }
    if (value.guardPosts) {
      value.guardPosts = value.guardPosts.map((value) => value._id.toString());
    }
  })

  const guardPosts = await mongoGuardPostsModel.find().populate('manager', 'surname firstName').lean();

  guardPosts.sort((a, b) => {
    return (a.number === undefined || a.number === null) - (b.number === undefined || b.number === null) ||
      a.number - b.number ||
      a.callsign.localeCompare(b.callsign)
  }).forEach(value => {
    value._id = value._id.toString();
    if (value.manager) {
      value.manager._id = value.manager._id.toString();
    }
  })

  const users = await mongoUserModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

  users.forEach(value => {
    value._id = value._id.toString();
  })

  return {
    props: { accessRules, userData, guards, guardPosts, users, initialState: { checkAuth: true } }
  }

})
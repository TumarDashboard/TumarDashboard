import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../../middleware/authServer';
import FFormGuardPostID from '../../../components/levelB_higth/guardPosts/FFormGuardPostID';
import mongoGuardPostsModel from "../../../src/mongo/models/mongoGuardPostsModel";
import mongoGuardsModel from "../../../src/mongo/models/mongoGuardsModel";
import mongoUserModel from "../../../src/mongo/models/mongoUserModel";
import mongoUserArchiveModel from "../../../src/mongo/models/mongoUserArchiveModel";
import mongoConnect from "../../../src/mongo/mongoConnect";
import { ApiError } from '../../../middleware/exceptions';
import mongoose from 'mongoose'
import { FPositionNSO } from '../../../components/levelZ_variable/FPositionItemList';
import mongoGuardPostsArchiveModel from '../../../src/mongo/models/mongoGuardPostsArchiveModel';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function GuardPostID({ isFirstMount, accessRules, userData, guardPost, guardPosts, guards, users, usersAll }) {
  const pageName = [guardPost?.number, guardPost?.callsign].filter(Boolean).join('-');
  const pageIcon = guardPost?.photo;
  return (
    <div
      className="flex-1 flex w-full"
    >
      <Head>
        <title>{pageName ? pageName : "Физ. пост"}</title>
        <link rel="icon" href={pageIcon ? pageIcon : "/favicon.ico"} />
      </Head>
      <motion.section
        className="flex-1 flex w-full"
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex w-full overflow-hidden"
        >
          <FFormGuardPostID
            accessRules={accessRules}
            userData={userData}
            guardPost={guardPost}
            guardPosts={guardPosts}
            guardsData={guards}
            users={users}
            usersAll={usersAll}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

GuardPostID.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;
  const accessRules = context.accessRules;

  // Проверка id физ. поста
  const queryPath = context?.query?.guardPostID;

  if (!queryPath || !queryPath[0].match(/^[0-9a-fA-F]{24}$/) || !mongoose.Types.ObjectId.isValid(queryPath[0])) {
    throw ApiError.BadRequest('Неккоректный ID физ. поста');
  }

  // Подключение базы данных
  await mongoConnect();

  // Охранники
  const guards = await mongoGuardsModel.find({}, '-createdAt -updatedAt', { sort: { 'surname': 1, 'firstName': 1, } }).populate('guardPosts', 'id').lean();

  guards.forEach(value => {
    value._id = value._id.toString();
    if (value.guardPosts) {
      value.guardPosts = value.guardPosts.map((value) => value._id.toString());
    }
  })

  // НСО
  const users = await mongoUserModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

  users.forEach(value => {
    value._id = value._id.toString();
  })

  // удаленные НСО
  const usersArchive = await mongoUserArchiveModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

  usersArchive.forEach(value => {
    value._id = value._id.toString();
  })

  const usersAll = users.concat(usersArchive);

  // Физ пост
  var guardPost;
  const guardPosts = await mongoGuardPostsModel.find({}, '-createdAt -updatedAt').populate('manager', 'surname firstName').lean();
  guardPosts.sort((a, b) => {
    return (a.number === undefined || a.number === null) - (b.number === undefined || b.number === null) ||
      a.number - b.number ||
      a.callsign.localeCompare(b.callsign)
  }).forEach(value => {
    value._id = value._id.toString();
    if (!guardPost && queryPath[0] === value._id) {
      guardPost = value;
      if (guardPost.manager) {
        guardPost.manager._id = guardPost.manager._id.toString();
        let index = usersAll.findIndex(x => x._id == guardPost.manager._id);
        if (index === -1) {
          usersAll.unshift(guardPost.manager)
        }
      }
    } else if (value.manager) {
      value.manager._id = value.manager._id.toString();
    }
  })

  // Проверка существования физ поста по ID
  if (!guardPost) {

    throw ApiError.BadRequest('Физ. пост с указанным ID не найден');

    // guardPost = await mongoGuardPostsArchiveModel.findOne({}, '-createdAt -updatedAt')
    //   .populate('manager', 'surname firstName')
    //   .populate('userPerfomed', 'surname firstName')
    //   .lean();

    // if (!guardPost) {
    //   throw ApiError.BadRequest('Физ. пост с указанным ID не найден');
    // }

    // guardPost._id = guardPost._id.toString();

    // if (guardPost.manager) {
    //   guardPost.manager._id = guardPost.manager._id.toString();
    // }

    // if (guardPost.userPerfomed) {
    //   guardPost.userPerfomed._id = guardPost.userPerfomed._id.toString();
    // }
  }

  // Передача данных
  console.log(guards);
  return {
    props: { accessRules, userData, guardPost, guardPosts, guards, users, usersAll, initialState: { checkAuth: true } }
  }

})
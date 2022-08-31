import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../../middleware/authServer';
import FFormGuardPostID from '../../../components/middle/FFormGuardPostID';
import mongoGuardPostsModel from "../../../src/mongo/models/mongoGuardPostsModel";
import mongoGuardsModel from "../../../src/mongo/models/mongoGuardsModel";
import mongoUserModel from "../../../src/mongo/models/mongoUserModel";
import mongoUserArchiveModel from "../../../src/mongo/models/mongoUserArchiveModel";
import mongoConnect from "../../../src/mongo/mongoConnect";
import { ApiError } from '../../../middleware/exceptions';
import mongoose from 'mongoose'
import { FPositionNSO } from '../../../components/variable/FPositionItemList';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function GuardPostID({ isFirstMount, ...props }) {
  const pageName = [props.guardPost?.number, props.guardPost?.callsign].filter(Boolean).join('-');
  const pageIcon = props.guardPost?.photo;
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
            guardPost={props.guardPost}
            guards={props.guards}
            users={props.users}
            usersAll={props.usersAll}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

GuardPostID.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  // Проверка id физ. поста
  const queryPath = context?.query?.guardPostID;

  if (!queryPath || !queryPath[0].match(/^[0-9a-fA-F]{24}$/) || !mongoose.Types.ObjectId.isValid(queryPath[0])) {
    throw ApiError.BadRequest('Неккоректный ID физ. поста');
  }

  // Подключение базы данных
  await mongoConnect();

  // Охранники
  const guards = await mongoGuardsModel.find().populate('manager', 'surname firstName').populate('guardPosts', 'id').lean();

  guards.sort((a, b) => {
    return a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)
  }).forEach(value => {
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

  // НСО
  const users = await mongoUserModel.find({positions: FPositionNSO}, 'surname firstName').lean();

  users.forEach(value => {
    value._id = value._id.toString();
  })  
  
  // удаленные НСО
  const usersArchive = await mongoUserArchiveModel.find({positions: FPositionNSO}, 'surname firstName').lean();

  usersArchive.forEach(value => {
    value._id = value._id.toString();
  })

  const usersAll = users.concat( usersArchive );

  // Физ пост
  const guardPost = await mongoGuardPostsModel.findById(queryPath[0]).populate('manager', 'surname firstName').lean();

  if (!guardPost) {
    throw ApiError.BadRequest('Физ. пост с указанным ID не найден');
  }

  guardPost._id = guardPost._id.toString();

  if (guardPost.manager) {
    guardPost.manager._id = guardPost.manager._id.toString();
    let index = usersAll.findIndex(x => x._id==guardPost.manager._id); 
    if( index === -1 ){
      usersAll.unshift(guardPost.manager)
    }
  }

  // Передача данных
  return {
    props: { guardPost, guards, users, usersAll, initialState: { checkAuth: true } }
  }

})
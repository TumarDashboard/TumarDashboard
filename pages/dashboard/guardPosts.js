import Head from 'next/head'
import { motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormGuardPosts from '../../components/levelB_higth/FFormGuardPosts';
import mongoGuardPostsModel from "../../src/mongo/models/mongoGuardPostsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';
import mongoGuardsModel from '../../src/mongo/models/mongoGuardsModel';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function GuardPosts({ isFirstMount, accessRules, userData, guardPosts, guards, users }) {
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
            userData={userData}
            guardPosts={guardPosts}
            guardsData={guards}
            users={users}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

GuardPosts.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  // Определение данных контекста
  const userData = context.userData;
  var accessRules = context.accessRules;

  // Подключение к базе данных
  await mongoConnect();

  // Выборка данных о физ. постах
  const guardPosts = await mongoGuardPostsModel.find({}, null, { sort: { 'manager': 1, 'number': 1 } }).populate('manager', 'surname firstName').lean();

  let userIsNotManager = true;

  guardPosts.forEach(value => {
    value._id = value._id.toString();
    if (value.manager) {
      value.manager._id = value.manager._id.toString();
      if (value.manager._id === userData.id) {
        userIsNotManager = false;
      }
    }
  })

  // Корректировка прав доступа в случае если НСО не имеет физ. поста
  if (userIsNotManager) {

    if (accessRules.includes('editGuardPost') &&
      accessRules.includes('editGuardPost/userCompare/manager')) {
      accessRules = accessRules.filter(element => element.search('editGuardPost'));
    }

    if (accessRules.includes('changeTimesheetToday') &&
      accessRules.includes('changeTimesheetToday/userCompare/guardPostManager')) {
      accessRules = accessRules.filter(element => element.search('changeTimesheetToday'));
    }

  }

  // Выборка данных об НСО
  const users = await mongoUserModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

  users.forEach(value => {
    value._id = value._id.toString();
  })

  // Выборка данных об охранниках
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

  return {
    props: { accessRules, userData, guardPosts, guards, users, initialState: { checkAuth: true } }
  }

})
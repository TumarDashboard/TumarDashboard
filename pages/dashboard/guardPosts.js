import Head from 'next/head'
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormGuardPosts from '../../components/levelB_higth/guardPosts/FFormGuardPosts';
import mongoGuardPostsModel from "../../src/mongo/models/mongoGuardPostsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';
import mongoGuardsModel from '../../src/mongo/models/mongoGuardsModel';
import mongoTimesheetsGuardsModel from '../../src/mongo/models/mongoTimesheetsGuardsModel';
import { getCurrentMonth } from '../../src/utils/dateUtils';
import FFormGuardPostsArchive from '../../components/levelB_higth/guardPosts/FFormGuardPostsArchive';
import mongoGuardPostsArchiveModel from '../../src/mongo/models/mongoGuardPostsArchiveModel';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function GuardPosts({ isFirstMount, accessRules, userData, guardPosts, guardPostsArchive, guards, users }) {

  const ARgetGuardPostsArchive = accessRules.includes('guardPosts/archive$');

  const tabs = [
    {
      label: "База", component:
        <FFormGuardPosts
          key='FFormGuardPosts'
          accessRules={accessRules}
          userData={userData}
          guardPosts={guardPosts}
          guardsData={guards}
          users={users}
        />
    },
    ARgetGuardPostsArchive ? {
      label: "Архив", component:
        <FFormGuardPostsArchive
          key='FFormGuardPostsArchive'
          accessRules={accessRules}
          userData={userData}
          guardPostsArchive={guardPostsArchive}
          guardsData={guards}
          users={users}
        />
    } : null,
  ].filter(Boolean);

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Физические посты</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>

        {tabs.length > 1 && <nav>
          <ul className='flex flex-row space-x-1'>
            {tabs.map((item) => {
              return <li
                key={item.label}
                className={`relative cursor-pointer px-1
              text-sm md:text-base text-color_G font-font_B 
              ${item.label === selectedTab.label ? "selected bg-color_A" : ""}`}
                onClick={() => setSelectedTab(item)}
              >
                {item.label}
                {item.label === selectedTab.label ? (
                  <motion.div
                    className="underline absolute -bottom-[2px] left-0 right-0 h-[3px] bg-color_G rounded"
                    layoutId="underline"
                  />
                ) : null}
              </li>
            })}
          </ul>
        </nav>}

        <AnimatePresence mode="wait">
          <motion.div
            initial="initial"
            animate="animate"
            variants={content(isFirstMount)}
            className="flex overflow-hidden"
          >
            {selectedTab.component}
          </motion.div>
        </AnimatePresence>

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

  const month = new Date(getCurrentMonth());
  const day = (new Date()).getDate() - 1;

  //Запустить агрегат на посты, месяц и день
  const guardsToday = await mongoTimesheetsGuardsModel.aggregate([
    {
      $match: {
        month: month,
        timesheetDays: day
      }
    },
    {
      $project: {
        guardPost: 1,
        guard: 1,
      }
    },
    {
      $group: {
        _id: '$guardPost',
        today: {
          $push: "$guard"
        }
      }
    },
  ]).then(responce => responce.map(element => {

    //Результат - все посты имеющие охранников за сегодня
    return {
      _id: element._id.toString(),
      today: element.today.map(value => value.toString()),
    }
  }));

  // Выборка данных об охранниках
  const guards = await mongoGuardsModel.find({}, '-createdAt -updatedAt').populate('manager', 'surname firstName').populate('guardPosts', 'id').lean();

  guards.sort((a, b) => {
    return a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName)
  }).forEach(value => {
    // Преобразование ID в строки
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

  // Выборка данных о физ. постах
  const guardPosts = await mongoGuardPostsModel.find({}, '-createdAt -updatedAt', { sort: { 'manager': 1, 'number': 1 } }).populate('manager', 'surname firstName').lean();

  let userIsNotManager = true;

  guardPosts.forEach(value => {

    // Преобразование ID в строки
    value._id = value._id.toString();

    if (value.manager) {
      value.manager._id = value.manager._id.toString();
      if (value.manager._id === userData.id) {
        userIsNotManager = false;
      }
    }

    // Просмотр физ постов с имеющимися сегодня охранниками
    const indexGuardsToday = guardsToday.findIndex(element => element._id === value._id);

    // Если есть охранники сегодня у физ поста - запись их в переменную guardsToday
    if (indexGuardsToday > -1) {

      value.guardsToday = guards.filter(element => guardsToday[indexGuardsToday].today.includes(element._id));

      value.guardsToday = value.guardsToday.map(element => {
        element.label = [element.surname, element.firstName, element.telephone].join(' ');
        element.lower = element.label.toLowerCase().replace(/\s/g, '');;
        return element;
      })

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

  // Выборка данных о физ. постах в Архиве
  var guardPostsArchive = '';
  
  if (accessRules.includes('guardPosts/archive$')) {

    guardPostsArchive = await mongoGuardPostsArchiveModel.find({}, '-createdAt -updatedAt', { sort: { 'manager': 1, 'number': 1 } })
      .populate('manager', 'surname firstName')
      .populate('userPerfomed', 'surname firstName')
      .lean();

    guardPostsArchive.forEach(value => {

      // Преобразование ID в строки
      value._id = value._id.toString();

      if (value.manager) {
        value.manager._id = value.manager._id.toString();
      }

      if (value.userPerfomed) {
        value.userPerfomed._id = value.userPerfomed._id.toString();
      }

    });

  }

  return {
    props: { accessRules, userData, guardPosts, guardPostsArchive, guards, users, initialState: { checkAuth: true } }
  }

})
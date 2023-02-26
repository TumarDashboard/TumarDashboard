import Head from 'next/head'
import { AnimatePresence, motion } from "framer-motion";
import { useState } from 'react';
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';
import catchAuthServer from '../../middleware/authServer';
import FFormGuards from '../../components/levelB_higth/guards/FFormGuards';
import FFormGuardsArchive from '../../components/levelB_higth/guards/FFormGuardsArchive';
import mongoGuardsModel from "../../src/mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from '../../src/mongo/models/mongoGuardsArchiveModel';
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

export default function Guards({ isFirstMount, accessRules, userData, guards, guardsArchive, guardPosts, users }) {

  const ARgetGuardPostsArchive = accessRules.includes('guards/archive');

  const [tableGuards, setTableGuards] = useState(guards);
  const [tableGuardsArchive, setTableGuardsArchive] = useState(guardsArchive);

  const tabs = [
    {
      label: "База", component:
        <FFormGuards
          key='FFormGuards'
          accessRules={accessRules}
          userData={userData}
          tableGuards={tableGuards}
          setTableGuards={setTableGuards}
          setTableGuardsArchive={setTableGuardsArchive}
          guardPosts={guardPosts}
          users={users}
        />
    },
    ARgetGuardPostsArchive ? {
      label: "Архив", component:
        <FFormGuardsArchive
          key='FFormGuardsArchive'
          accessRules={accessRules}
          userData={userData}
          tableGuardsArchive={tableGuardsArchive}
          setTableGuards={setTableGuards}
          setTableGuardsArchive={setTableGuardsArchive}
          guardPosts={guardPosts}
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
        <title>Охранники</title>
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

Guards.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;
  const accessRules = context.accessRules;

  await mongoConnect();

  const guards = await mongoGuardsModel
    .find({}, '-createdAt -updatedAt', { sort: { 'surname': 1, 'firstName': 1, } })
    .populate('guardPosts', 'id')
    .lean();

  guards.forEach(value => {
    value._id = value._id.toString();
    if (value.guardPosts) {
      value.guardPosts = value.guardPosts.map((value) => value._id.toString());
    }
  })

  const guardPosts = await mongoGuardPostsModel
    .find({}, '-createdAt -updatedAt', { sort: { 'manager': 1, 'number': 1, 'callsign': 1 } })
    .populate('manager', 'surname firstName')
    .lean();

  guardPosts.forEach(value => {
    value._id = value._id.toString();

    if (value.manager) {
      value.manager._id = value.manager._id.toString();
    }
  })

  const users = await mongoUserModel.find({ positions: FPositionNSO }, 'surname firstName').lean();

  users.forEach(value => {
    value._id = value._id.toString();
  })

  // Выборка данных об охранниках в Архиве
  var guardsArchive = '';

  if (accessRules.includes('guards/archive')) {

    guardsArchive = await mongoGuardsArchiveModel
      .find({}, '-createdAt -updatedAt', { sort: { 'surname': 1, 'firstName': 1, } })
      .populate('guardPosts', 'id')
      .populate('userPerfomed', 'surname firstName')
      .lean();

    guardsArchive.forEach(value => {

      // Преобразование ID в строки
      value._id = value._id.toString();

      if (value.guardPosts) {
        value.guardPosts = value.guardPosts.map((value) => value._id.toString());
      }

      if (value.userPerfomed) {
        value.userPerfomed._id = value.userPerfomed._id.toString();
      }

    });

  }

  return {
    props: { accessRules, userData, guards, guardsArchive, guardPosts, users, initialState: { checkAuth: true } }
  }

})
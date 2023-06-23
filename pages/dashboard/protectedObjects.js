import Head from 'next/head'
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormProtectedObjects from '../../components/levelB_higth/protectedObjects/FFormProtectedObjects';
import mongoProtectedObjectsModel from "../../src/mongo/models/mongoProtectedObjectsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';
import mongoGuardsModel from '../../src/mongo/models/mongoGuardsModel';
import mongoTimesheetsGuardsModel from '../../src/mongo/models/mongoTimesheetsGuardsModel';
import { getCurrentMonth } from '../../src/utils/dateUtils';
import FFormProtectedObjectsArchive from '../../components/levelB_higth/protectedObjects/FFormProtectedObjectsArchive';
import mongoProtectedObjectsArchiveModel from '../../src/mongo/models/mongoProtectedObjectsArchiveModel';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function ProtectedObjects({ isFirstMount, accessRules, userData, protectedObjects, protectedObjectsArchive }) {

  const ARgetProtectedObjectsArchive = accessRules.includes('protectedObjects/archive$');

  const [tableProtectedObjects, setTableProtectedObjects] = useState(protectedObjects);
  const [tableProtectedObjectsArchive, setTableProtectedObjectsArchive] = useState(protectedObjectsArchive);

  const tabs = [
    {
      label: "База", component:
        <FFormProtectedObjects
          key='FFormProtectedObjects'
          accessRules={accessRules}
          tableProtectedObjects={tableProtectedObjects}
          setTableProtectedObjects={setTableProtectedObjects}
          setTableProtectedObjectsArchive={setTableProtectedObjectsArchive}
        />
    },
    ARgetProtectedObjectsArchive ? {
      label: "Архив", component:
        <FFormProtectedObjectsArchive
          key='FFormProtectedObjectsArchive'
          accessRules={accessRules}
          userData={userData}
          tableProtectedObjectsArchive={tableProtectedObjectsArchive}
          setTableProtectedObjects={setTableProtectedObjects}
          setTableProtectedObjectsArchive={setTableProtectedObjectsArchive}
        />
    } : null,
  ].filter(Boolean);

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div
      className="flex-1"
    >

      <Head>
        <title>Пультовые объекты</title>
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

ProtectedObjects.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  // Определение данных контекста
  const userData = context.userData;
  var accessRules = context.accessRules;

  // Подключение к базе данных
  await mongoConnect();

  // Выборка данных о пультовых объектах
  const protectedObjects = await mongoProtectedObjectsModel
    .find({}, '-createdAt -updatedAt')
    .lean();

  protectedObjects.sort((a, b)=>{
    if (a.number && b.number)
      return (a.number - b.number);
    else return -1;
  });

  protectedObjects.forEach(value => {

    // Преобразование ID в строки
    value._id = value._id.toString();

  })

  // Выборка данных о пультовых объектах в Архиве
  var protectedObjectsArchive = '';

  if (accessRules.includes('protectedObjects/archive$')) {

    protectedObjectsArchive = await mongoProtectedObjectsArchiveModel
      .find({}, '-createdAt -updatedAt')
      .populate('userPerfomed', 'surname firstName')
      .lean();

    protectedObjectsArchive.sort((a, b)=>{
      if (a.number && b.number)
        return (a.number - b.number);
      else return -1;
    });

    protectedObjectsArchive.forEach(value => {

      // Преобразование ID в строки
      value._id = value._id.toString();

      if (value.userPerfomed) {
        value.userPerfomed._id = value.userPerfomed._id.toString();
      }

    });

  }

  return {
    props: { accessRules, userData, protectedObjects, protectedObjectsArchive, initialState: { checkAuth: true } }
  }

})
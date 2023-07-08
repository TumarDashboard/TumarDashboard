import Head from 'next/head'
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import catchAuthServer from '../../middleware/authServer';
import FFormSimCards from '../../components/levelB_higth/simCards/FFormSimCards';
import mongoSimCardsModel from "../../src/mongo/models/mongoSimCardsModel";
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { FPositionNSO } from '../../components/levelZ_variable/FPositionItemList';
import mongoGuardsModel from '../../src/mongo/models/mongoGuardsModel';
import mongoTimesheetsGuardsModel from '../../src/mongo/models/mongoTimesheetsGuardsModel';
import { getCurrentMonth } from '../../src/utils/dateUtils';
import FFormSimCardsArchive from '../../components/levelB_higth/simCards/FFormSimCardsArchive';
import mongoSimCardsArchiveModel from '../../src/mongo/models/mongoSimCardsArchiveModel';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function SimCards({ isFirstMount, accessRules, userData, simCards, simCardsArchive }) {

  const ARgetSimCardsArchive = accessRules.includes('simCards/archive$');

  const [tableSimCards, setTableSimCards] = useState(simCards);
  const [tableSimCardsArchive, setTableSimCardsArchive] = useState(simCardsArchive);

  const tabs = [
    {
      label: "База", component:
        <FFormSimCards
          key='FFormSimCards'
          accessRules={accessRules}
          tableSimCards={tableSimCards}
          setTableSimCards={setTableSimCards}
          setTableSimCardsArchive={setTableSimCardsArchive}
        />
    },
    ARgetSimCardsArchive ? {
      label: "Архив", component:
        <FFormSimCardsArchive
          key='FFormSimCardsArchive'
          accessRules={accessRules}
          userData={userData}
          tableSimCardsArchive={tableSimCardsArchive}
          setTableSimCards={setTableSimCards}
          setTableSimCardsArchive={setTableSimCardsArchive}
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

SimCards.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  // Определение данных контекста
  const userData = context.userData;
  var accessRules = context.accessRules;

  // Подключение к базе данных
  await mongoConnect();

  // Выборка данных о пультовых объектах
  const simCards = await mongoSimCardsModel
    .find({}, '-createdAt -updatedAt -protectedObjects', { sort: { provider: 1, msisdn: 1 } })
    .lean();

  // simCards.sort((a, b)=>{
  //   if (a.number && b.number)
  //     return (a.number - b.number);
  //   else return -1;
  // });

  simCards.forEach(value => {

    // Преобразование ID в строки
    value._id = value._id.toString();

  })

  // Выборка данных о пультовых объектах в Архиве
  var simCardsArchive = '';

  if (accessRules.includes('simCards/archive$')) {

    simCardsArchive = await mongoSimCardsArchiveModel
      .find({}, '-createdAt -updatedAt -protectedObjects', { sort: { provider: 1, msisdn: 1 } })
      .populate('userPerfomed', 'surname firstName')
      .lean();

    // simCardsArchive.sort((a, b)=>{
    //   if (a.number && b.number)
    //     return (a.number - b.number);
    //   else return -1;
    // });

    simCardsArchive.forEach(value => {

      // Преобразование ID в строки
      value._id = value._id.toString();

      if (value.userPerfomed) {
        value.userPerfomed._id = value.userPerfomed._id.toString();
      }

    });

  }

  return {
    props: { accessRules, userData, simCards, simCardsArchive, initialState: { checkAuth: true } }
  }

})
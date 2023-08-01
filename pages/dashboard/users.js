import Head from 'next/head'
import { AnimatePresence, motion } from "framer-motion";
import { useState } from 'react';
import catchAuthServer from '../../middleware/authServer';
import FFormUsers from '../../components/levelB_higth/users/FFormUsers';
import mongoUserModel from "../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../src/mongo/mongoConnect";
import { getPositionWithCodeList } from '../../components/levelZ_variable/FPositionItemList';
import mongoUserArchiveModel from '../../src/mongo/models/mongoUserArchiveModel';
import FFormUsersArchive from '../../components/levelB_higth/users/FFormUsersArchive';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Users({ isFirstMount, accessRules, userData, users, usersArchive }) {
  
  const ARgetUserPostsArchive = accessRules.includes('users/archive');

  const [tableUsers, setTableUsers] = useState(users);
  const [tableUsersArchive, setTableUsersArchive] = useState(usersArchive);

  const tabs = [
    {
      label: "База", component:
        <FFormUsers
          accessRules={accessRules}
          userData={userData}
          users={users}
          tableUsers={tableUsers}
          setTableUsers={setTableUsers}
          setTableUsersArchive={setTableUsersArchive}
        />
    },
    ARgetUserPostsArchive ? {
      label: "Архив", component:
        <FFormUsersArchive
          accessRules={accessRules}
          userData={userData}
          users={users}
          tableUsersArchive={tableUsersArchive}
          setTableUsers={setTableUsers}
          setTableUsersArchive={setTableUsersArchive}
        />
    } : null,
  ].filter(Boolean);

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Пользователи</title>
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

      {/* <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex overflow-hidden"
        >
          <FFormUsers
            accessRules={accessRules}
            userData={userData}
            users={users}
          />
        </motion.div>
      </motion.section> */}

    </div>
  )
}

Users.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;
  const accessRules = context.accessRules;

  await mongoConnect();

  const users = await mongoUserModel.find({},'-password -activationLink -__v -createdAt -updatedAt').lean();

  users.forEach(value=>{
    value._id = value._id.toString();
    
    if(value.createdAt){
      value.createdAt = value.createdAt.toString();
    }

    if(value.positions){
      value.positionsText = getPositionWithCodeList(value.positions);
    }
  })


  // Выборка данных об охранниках в Архиве
  var usersArchive = '';

  if (accessRules.includes('users/archive')) {

    usersArchive = await mongoUserArchiveModel
      .find({},'-password -activationLink -__v -createdAt -updatedAt')
      .populate('userPerfomed', 'surname firstName')
      .lean();

    usersArchive.forEach(value => {

      // Преобразование ID в строки
      value._id = value._id.toString();
    
      if(value.createdAt){
        value.createdAt = value.createdAt.toString();
      }
      
      if(value.positions){
        value.positionsText = getPositionWithCodeList(value.positions);
      }

      if (value.userPerfomed) {
        value.userPerfomed._id = value.userPerfomed._id.toString();
      }

    });

  }

  return {
    props: { accessRules, userData, users, usersArchive }
  }

})
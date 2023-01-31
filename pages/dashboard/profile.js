import Head from 'next/head'
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FFormProfile from '../../components/levelB_higth/profile/FFormProfile';
import catchAuthServer from '../../middleware/authServer';
import FFormProfileСonfidential from '../../components/levelB_higth/profile/FFormСonfidential';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function Profile({ accessRules, userData, isFirstMount }) {

  const tabs = [
    {
      label: "Общие", component:
        <FFormProfile
          key='FFormProfile'
          accessRules={accessRules}
          userData={userData}
        />
    },
    {
      label: "Безопасность", component:
        <FFormProfileСonfidential
          key='FFormProfileСonfidential'
          accessRules={accessRules}
          userData={userData}
        />
    },
  ];

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div
      className="flex-1 bg-color_C"
    >
      <Head>
        <title>Профиль</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section
        exit={{ opacity: 0 }}
        className="grow"
      >
        <nav>
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
        </nav>

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

Profile.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  const userData = context.userData;
  const accessRules = context.accessRules;

  if (userData) {
    userData.id = userData.id.toString();
    if(userData.createdAt){
      userData.createdAt = userData.createdAt.toString();
    }
    if(userData.updatedAt){
      userData.updatedAt = userData.updatedAt.toString();
    }
    if (userData.manager) {
      userData.manager._id = userData.manager._id.toString();
    }
  }

  return {
    props: { accessRules, userData, initialState: { checkAuth: true } }
  }

})
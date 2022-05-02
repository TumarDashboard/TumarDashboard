import Head from 'next/head';
import InitialTransition from '../components/hight/InitialTransition';
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FAboutHello from '../components/middle/index/FAboutHello';
import FAboutPageProofs from '../components/middle/index/FAboutPageProofs';
import FAboutFrontend from '../components/middle/index/FAboutFrontend';
import FAboutBackend from '../components/middle/index/FAboutBackend';
import FAboutBPMN from '../components/middle/index/FAboutBPMN';
import FAboutDevelopment from '../components/middle/index/FAboutDevelopment';
import FAboutMe from '../components/middle/index/FAboutMe';

const tabs = [
  { label: "Привет", component: <FAboutHello key='FAboutHello' /> },
  { label: "Вёрстка", component: <FAboutPageProofs key='FAboutPageProofs' /> },
  { label: "Фронтенд", component: <FAboutFrontend key='FAboutFrontend' /> },
  { label: "Бэкенд", component: <FAboutBackend key='FAboutBackend' /> },
  { label: "BPMN", component: <FAboutBPMN key='FAboutBPMN' /> },
  { label: "Разработка", component: <FAboutDevelopment key='FAboutDevelopment' /> },
  { label: "Обо мне", component: <FAboutMe key='FAboutMe' /> }
];

export default function Index({ isFirstMount }) {

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div
      className='flex-1 flex'
    >
      <Head>
        <title>Портфолио</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.section
        exit={{ opacity: 0 }}
        className='flex-1 flex 
        overflow-hidden'
      >

        {isFirstMount && <InitialTransition />}

        <div className='w-full hidden md:grid grid-cols-1 grid-rows-4 place-items-center'>

          <div className='row-span-3'>

            <AnimatePresence exitBeforeEnter>

              {selectedTab.component}

            </AnimatePresence>

          </div>

          <nav>
            <ul className='flex flex-row border-b-[1px] border-color_E space-x-1'>
              {tabs.map((item) => (
                <li
                  key={item.label}
                  className={`relative cursor-pointer text-xl md:text-xl text-color_E font-font_B px-1 ${item === selectedTab ? "selected" : ""}`}
                  onClick={() => setSelectedTab(item)}
                >
                  {item.label}
                  {item === selectedTab ? (
                    <motion.div
                      className="underline absolute -bottom-[2px] left-0 right-0 h-[3px] bg-color_E rounded"
                      layoutId="underline"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

        </div>

        <div className='w-full md:hidden mt-12'>
            {tabs[0].component}
        </div>

      </motion.section>
    </div>
  )
}

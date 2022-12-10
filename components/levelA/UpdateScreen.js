import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "./StoreProvider";
import { motion } from "framer-motion";
import { XIcon } from '@heroicons/react/solid';

const inputs = {
  block: {
    opacity: 1,
    display: 'block',
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
    transitionEnd: {
      display: "none",
    },
  },
};

const UpdateScreen = observer(function FUpdateScreen() {

  const mobxUI = useStore().MOBXui;

  return (
    <motion.div
      initial='hidden'
      animate={mobxUI.isUpdate || mobxUI.updateError ? 'block' : 'hidden'}
      variants={inputs}
      className='fixed z-[100] bg-color_A/[0.9]
            bottom-2 right-2 p-2'
    >

      <div className="flex justify-center w-full h-full items-center">

        {mobxUI.isUpdate && <>
          <svg fill='none' className="w-16 h-16 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
            <path clipRule='evenodd'
              d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
              fill='currentColor' fillRule='evenodd' />
          </svg>

          <span className="text-3xl text-color_F font-font_B">Загрузка ...</span>
        </>}

        {mobxUI.updateError && <>
          <span className="text-xl text-red-600 font-font_B mr-2">{mobxUI.updateError}</span>

          {/* Кнопка чистки фильтра */}
          <button
            className="bg-color_B h-5 w-5 
            absolute right-2 bottom-2
            flex justify-center items-center rounded-md
            fill-color_D hover:fill-color_C hover:ring hover:ring-red-200
            hover:bg-color_C active:bg-color_B disabled:opacity-25"
            onClick={()=>mobxUI.setUpdateError(null)}
          >
            <XIcon
              className="h-5 w-5 fill-color_F
            hover:fill-color_G"
            />
          </button>

        </>}

      </div>
    </motion.div>
  );
});

export default UpdateScreen;
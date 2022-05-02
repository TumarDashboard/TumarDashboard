import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "./StoreProvider";
import { motion } from "framer-motion";

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

const LoadingScreen = observer(function FLoadingScreen() {

    const mobxUI = useStore().MOBXui;

    return (
        <motion.div
            initial='hidden'
            animate={mobxUI.isLoading ? 'block' : 'hidden'}
            variants={inputs}
            className='fixed z-50 w-full h-full bg-color_A/[0.9]'
        >
            <div className="flex justify-center w-full h-full items-center text-3xl text-color_F font-font_B">

                <svg fill='none' className="w-32 h-32 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg'>
                    <path clipRule='evenodd'
                        d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
                        fill='currentColor' fillRule='evenodd' />
                </svg>

                <div>Загрузка ...</div>
                
            </div>
        </motion.div>
    );
});

export default LoadingScreen;
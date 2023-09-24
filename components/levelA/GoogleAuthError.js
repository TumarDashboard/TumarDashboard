import { motion } from "framer-motion";
import { FButtonWhite } from "../levelE_low/FButtonWhite";
import { QRCodeSVG } from 'qrcode.react';
import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./StoreProvider";
import { useRef } from 'react'
import { Dialog } from '@headlessui/react'

const modal = {
  open: {
    display: "flex",
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
    transitionEnd: { display: "none" }
  },
};

const GoogleAuthError = observer(function FGoogleAuthError() {

  const mobxUI = useStore().MOBXui;

  let completeButtonRef = useRef(null);

  return (
    <Dialog
      initialFocus={completeButtonRef}
      className="fixed w-full h-full top-0 left-0 z-[5000]"
      open={mobxUI.isGoogleAuthError}
      onClose={() => mobxUI.closeGoogleAuthError()}
    >
      <motion.dialog
        className="fixed w-full h-full top-0 left-0 bg-color_F/75 items-center justify-center p-2"
        initial="closed"
        animate={mobxUI.isGoogleAuthError ? "open" : "closed"}
        variants={modal}
        id="modalForm"
        onClick={(e) => { if (e.target.id == "modalForm") mobxUI.closeGoogleAuthError() }}
      >
        <div
          className="flex-initial bg-color_G rounded-lg md:w-1/2 relative"
        >

          <div className="flex flex-col items-start p-4 text-justify w-full">

            <div className="flex items-center w-full">

              <div className="text-red-700 font-medium text-lg">Ошибка доступа к облаку Google</div>

              <svg
                className="ml-auto fill-current text-gray-700 w-6 h-6 cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 18 18"
                onClick={() => mobxUI.closeGoogleAuthError()}
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
              </svg>

            </div>

            <h2>
              Для выполненния операции требуется доступ к облаку Google.
              Обратитесь к администратору, имеющему доступ к Аккаунту<b> {mobxUI.googleAuthErrorEmail} </b>
              и передайте ему данную ссылку, по которой он сможет реактивировать доступ:
            </h2>

            <div className="mt-2 flex flex-col md:flex-row space-x-1 space-y-1">
              <a
                href={mobxUI.googleAuthAuthorizeUrl}
                className='text-color_C break-all underline underline-offset-1'
                rel='noopener noreferrer'
                target="_blank"
                onClick={() => mobxUI.closeGoogleAuthError()}
              >
                {mobxUI.googleAuthAuthorizeUrl}
              </a>
              <div className="w-18 h-18 flex justify-center">
                <QRCodeSVG value={mobxUI.googleAuthAuthorizeUrl} />
              </div>
            </div>

            <div className="ml-auto mt-4">

              <FButtonWhite
                className="ml-4"
                onClick={() => mobxUI.closeGoogleAuthError()}
              >
                Закрыть
              </FButtonWhite>

            </div>

          </div>

        </div>
      </motion.dialog>

    </Dialog>
  )
})

export default GoogleAuthError;
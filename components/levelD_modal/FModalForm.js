import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Dialog } from '@headlessui/react'
import { useRef } from 'react'

const modal = {
  open: {
    display: "flex",
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
    transitionEnd: { display: "flex" }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
    transitionEnd: { display: "none" }
  }
};

export function FModalForm({ title, isModalFormOpen, isModalFormLoading = false, isModalFormError, setIsModalFormOpen, children, className, widthForm = 'md:w-1/2' }) {

  let completeButtonRef = useRef(null);
  
  return (

    <Dialog
      initialFocus={completeButtonRef}
      className="fixed w-full h-full top-0 left-0 z-50"
      open={isModalFormOpen}
      onClose={() => setIsModalFormOpen({ isOpen: false })}
    >

      <motion.dialog //Фон модального окна
        className="flex w-full h-full bg-color_F/75 "
        initial="closed"
        animate={isModalFormOpen ? "open" : "closed"}
        variants={modal}
      >
        {isModalFormOpen &&
          <AnimatePresence mode="popLayout">
            {
              isModalFormError
                ?
                <motion.div // Модальное окно с ошибкой
                  className="w-full h-full flex items-center justify-center"
                  key={"modalFormError"}
                  id="modalFormError"
                  variants={modal}
                  initial='closed'
                  animate='open'
                  exit='closed'
                  onPointerDown={(e) => {
                    if (e.target.id == "modalFormError") setIsModalFormOpen({ isOpen: false })
                  }}
                >

                  <div
                    className={`flex-initial bg-color_G rounded-lg max-h-full ${widthForm} flex flex-col items-center`}
                  >

                    <div className="flex items-center w-full bg-color_B p-2 rounded-t-lg">

                      <div className="text-white font-medium text-xl select-none">Ошибка</div>

                      <XMarkIcon
                        className="ml-auto fill-white hover:fill-red-600 hover:scale-110 w-6 h-6 cursor-pointer"
                        viewBox="0 0 18 18"
                        ref={completeButtonRef}
                        onClick={() => setIsModalFormOpen({ isOpen: false })}
                      />


                    </div>

                    <span className="text-color_C italic break-all text-sm sm:text-lg p-2">
                      {isModalFormError.message}
                    </span>

                  </div>

                </motion.div>
                :
                (
                  isModalFormLoading
                    ?
                    <motion.div // Предзагрузка данных модального окна на сервере
                      className="flex justify-center w-full h-full items-center text-3xl text-color_B font-font_B select-none"
                      key={"loadForm"}
                      variants={modal}
                      animate={isModalFormLoading ? "open" : "closed"}
                      initial='closed'
                      exit='closed'
                      onPointerDown={(e) => {
                        className
                        if (e.target.id == "loadForm") setIsModalFormOpen({ isOpen: false })
                      }}
                    >

                      <svg fill='none' className="w-32 h-32 animate-spin" viewBox="0 0 32 32" xmlns='http://www.w3.org/2000/svg' id="loadForm">
                        <path clipRule='evenodd'
                          d='M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z'
                          fill='currentColor' fillRule='evenodd' />
                      </svg>

                      <div id="loadForm" ref={completeButtonRef}>Загрузка ...</div>

                    </motion.div>
                    :
                    <motion.div // Само модальное окно
                      className="flex justify-center w-full h-full items-center"
                      key={"modalForm"}
                      id="modalForm"
                      variants={modal}
                      initial='closed'
                      animate='open'
                      exit='closed'
                      onPointerDown={(e) => {
                        if (e.target.id == "modalForm") setIsModalFormOpen({ isOpen: false })
                      }}
                    >

                      <div
                        className={`flex-initial bg-color_G rounded-lg max-h-full ${widthForm}`}
                      >

                        <div className="flex items-center w-full bg-color_B p-2 rounded-t-lg">

                          <div className="text-white font-medium text-xl select-none">{title}</div>

                          <XMarkIcon
                            className="ml-auto fill-white hover:fill-red-600 hover:scale-110 w-6 h-6 cursor-pointer"
                            viewBox="0 0 18 18"
                            ref={completeButtonRef}
                            onClick={() => setIsModalFormOpen({ isOpen: false })}
                          />

                        </div>

                        <div className={className}>
                          {children}
                        </div>
                      </div>

                    </motion.div>
                )
            }
          </AnimatePresence>}

      </motion.dialog>
    </Dialog>
  )

}
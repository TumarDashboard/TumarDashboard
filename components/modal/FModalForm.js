import { motion } from "framer-motion";
import { XIcon } from '@heroicons/react/solid';

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

export function FModalForm({ title, isModalFormOpen, setIsModalFormOpen, children, className }) {
  return (
      <motion.div
        className="fixed w-full h-full top-0 left-0 bg-color_F/75 z-50"
        initial="closed"
        animate={isModalFormOpen ? "open" : "closed"}
        variants={modal}
        id="modalForm"
        onClick={(e) => { if (e.target.id == "modalForm") setIsModalFormOpen({ isOpen: false }) }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
        >

          <motion.div
            layout
            className="flex-initial bg-color_G rounded-lg md:w-1/2 max-h-full"
          >

            <div className="flex items-center w-full bg-color_B p-2 rounded-t-lg">

              <div className="text-white font-medium text-xl">{title}</div>

              <XIcon
                className="ml-auto fill-white hover:fill-red-600 hover:scale-110 w-6 h-6 cursor-pointer"
                viewBox="0 0 18 18"
                onClick={() => setIsModalFormOpen({ isOpen: false })}
              />

            
            </div>
              
            <div className={className}>
              {children}
            </div>
          </motion.div>

        </div>

      </motion.div>
  )

}
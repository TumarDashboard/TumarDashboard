import { FInputLogin } from "../low/FInputLogin";
import { FInputEmail } from "../low/FInputEmail";
import { motion } from "framer-motion";
import { useStore } from "../hight/StoreProvider";
import { observer } from 'mobx-react-lite'

const inputs = {
  initial: {
    y: -20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

const FFormProfile = observer(function FFormProfile() {

  /*
      Использование глобальных данных
  */

  const user = useStore().MOBXuser;

  /*
      ---------------
  */

  return (
    <motion.div
      variants={inputs}
      className="mb-16 md:ml-64 w-full"
    >

      <div className="flex flex-col md:flex-row m-4 md:space-x-8">

        <div className="flex-none flex items-center justify-center">
          <img
            className="h-44 w-44 rounded-full"
            src={`https://ui-avatars.com/api/?name=${user?.user?.login}&size=256&font-size=0.33&length=2`}
            alt=""
          />
        </div>

        <div className="flex-initial space-y-8 w-full max-w-xl">

          <div className="form-item">
            <label className="text-xl ">Логин</label>

            <FInputLogin
              value={user?.user?.login}
              disabled
            />
          </div>

          <div className="form-item">
            <label className="text-xl ">Электронная почта</label>

            <FInputEmail
              value={user?.user?.email}
              disabled
            />

          </div>

        </div>

      </div>

    </motion.div>
  );

});


export default FFormProfile;
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

const FFormActivateLink = observer(function FFormActivateLink() {

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
            className="flex flex-col w-full text-center"
        >
            <p className="text-xl sm:text-2xl px-5 pt-10 font-medium text-color_B title-font">
                Вам необходимо активировать аккаунт по ссылке в письме, отправленной на почту <i>{user?.user?.email}</i>
            </p>
        </motion.div>
    );

});

export default FFormActivateLink;
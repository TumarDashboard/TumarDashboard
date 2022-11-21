import { motion } from "framer-motion";
import Head from "next/head";
import { validate } from "uuid";
import FFormPasswordReset from "../../../components/levelB_higth/FFormPasswordReset";
import { ApiError } from "../../../middleware/exceptions";
import mongoUserModel from "../../../src/mongo/models/mongoUserModel";
import mongoConnect from "../../../src/mongo/mongoConnect";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.15 : 0.15
    }
  }
});

export default function PasswordResetLink({ isFirstMount, activatelink }) {
  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Восстановление пароля</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
        >
          <FFormPasswordReset 
            activatelink={activatelink}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

export async function getServerSideProps(context) {
  
  // Проверка ссылки активации
  var activatelink = context?.query?.activatelink;

  if (!activatelink || !validate(activatelink) ) {
    throw ApiError.BadRequest('Неккоректная ссылка активации');
  }

  // Подключение базы данных
  await mongoConnect();

  const mongoUser = await mongoUserModel.findOne({ activationLink: activatelink });

  if (!mongoUser) {
    throw ApiError.BadRequest('Неккоректная ссылка активации');
  }

  return {
    props: {activatelink},
  }
}
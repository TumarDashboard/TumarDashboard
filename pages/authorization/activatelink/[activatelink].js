import Head from "next/head";
import { motion } from "framer-motion";
import { validate } from "uuid";
import FFormActivation from "../../../components/levelB_higth/FFormActivation";
import { ApiError } from "../../../middleware/exceptions";
import mongoConnect from "../../../src/mongo/mongoConnect";
import mongoUserModel from "../../../src/mongo/models/mongoUserModel";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.15 : 0.15
    }
  }
});

export default function ActivateLink({ isFirstMount, activatelink }) {
  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Активация аккаунта</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
        >
          <FFormActivation 
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
    throw ApiError.BadRequest('Неккоректный ID физ. поста');
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
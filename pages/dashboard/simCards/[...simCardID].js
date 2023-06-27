import { motion } from "framer-motion";
import mongoose from 'mongoose';
import Head from 'next/head';
import FFormSimCardID from '../../../components/levelB_higth/simCards/FFormSimCardID';
import catchAuthServer from '../../../middleware/authServer';
import { ApiError } from '../../../middleware/exceptions';
import mongoSimCardsModel from "../../../src/mongo/models/mongoSimCardsModel";
import mongoConnect from "../../../src/mongo/mongoConnect";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function SimCardID({ 
  isFirstMount, accessRules, userData, simCard }) {

  const pageName = [simCard?.number].filter(Boolean).join('-');
  const pageIcon = simCard?.photo;

  return (
    <div
      className="flex-1 flex w-full"
    >
      <Head>
        <title>{pageName ? pageName : "Пультовой объект"}</title>
        <link rel="icon" href={pageIcon ? pageIcon : "/favicon.ico"} />
      </Head>
      <motion.section
        className="flex-1 flex w-full"
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
          className="flex w-full overflow-hidden"
        >
          <FFormSimCardID
            accessRules={accessRules}
            userData={userData}
            simCard={simCard}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

SimCardID.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  // Определение данных контекста
  const userData = context.userData;
  const accessRules = context.accessRules;

  // Проверка id пультового объекта
  const queryPath = context?.query?.simCardID;

  if (!queryPath || !queryPath[0].match(/^[0-9a-fA-F]{24}$/) || !mongoose.Types.ObjectId.isValid(queryPath[0])) {
    throw ApiError.BadRequest('Неккоректный ID сим-карты');
  }

  // Подключение базы данных
  await mongoConnect();

  // Пультовой объект
  const simCard = await mongoSimCardsModel.
    findById(queryPath[0], '-createdAt -updatedAt')
    .lean();

  if (!simCard) {
    throw ApiError.BadRequest('Сим-карта с указанным ID не найден');
  }

  simCard._id = simCard._id.toString();

  // Передача данных
  return {
    props: { accessRules, userData, simCard, initialState: { checkAuth: true } }
  }

})
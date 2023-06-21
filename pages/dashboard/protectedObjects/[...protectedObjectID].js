import { motion } from "framer-motion";
import mongoose from 'mongoose';
import Head from 'next/head';
import FFormProtectedObjectID from '../../../components/levelB_higth/protectedObjects/FFormProtectedObjectID';
import catchAuthServer from '../../../middleware/authServer';
import { ApiError } from '../../../middleware/exceptions';
import mongoProtectedObjectsModel from "../../../src/mongo/models/mongoProtectedObjectsModel";
import mongoConnect from "../../../src/mongo/mongoConnect";

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    }
  }
});

export default function ProtectedObjectID({ 
  isFirstMount, accessRules, userData, protectedObject }) {

  const pageName = [protectedObject?.number].filter(Boolean).join('-');
  const pageIcon = protectedObject?.photo;

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
          <FFormProtectedObjectID
            accessRules={accessRules}
            userData={userData}
            protectedObject={protectedObject}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

ProtectedObjectID.onSidebar = true;

export const getServerSideProps = catchAuthServer(async (context) => {

  // Определение данных контекста
  const userData = context.userData;
  const accessRules = context.accessRules;

  // Проверка id пультового объекта
  const queryPath = context?.query?.protectedObjectID;

  if (!queryPath || !queryPath[0].match(/^[0-9a-fA-F]{24}$/) || !mongoose.Types.ObjectId.isValid(queryPath[0])) {
    throw ApiError.BadRequest('Неккоректный ID пультового объекта');
  }

  // Подключение базы данных
  await mongoConnect();

  // Пультовой объект
  const protectedObject = await mongoProtectedObjectsModel.
    findById(queryPath[0], '-createdAt -updatedAt')
    .lean();

  if (!protectedObject) {
    throw ApiError.BadRequest('Пультовой объект с указанным ID не найден');
  }

  protectedObject._id = protectedObject._id.toString();

  // Передача данных
  return {
    props: { accessRules, userData, protectedObject, initialState: { checkAuth: true } }
  }

})
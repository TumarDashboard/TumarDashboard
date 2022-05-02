import Head from 'next/head'
import FFormLogin from '../../components/middle/FFormLogin';
import { motion } from "framer-motion";
import { getCookie } from '../../middleware/cookies';

const content = (isFirstMount) => ({
  animate: {
    transition: {
      staggerChildren: isFirstMount ? 0.5 : 0.15
    },
  },
});

function Login({ isFirstMount, redirectAuth }) {
  return (
    <div
      className="flex-1"
    >
      <Head>
        <title>Авторизация</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.section exit={{ opacity: 0 }}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={content(isFirstMount)}
        >
          <FFormLogin 
            redirectAuth={redirectAuth}
          />
        </motion.div>
      </motion.section>
    </div>
  )
}

Login.getInitialProps = async ({ req, res }) => {

  const redirectAuth = getCookie("redirectAuth", {
    req,
    res
  });

  return { redirectAuth }
}

export default Login;
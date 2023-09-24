import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { AnimatePresence } from "framer-motion";
import AppLayout from "../components/levelA/AppLayout";
import FLoadingScreen from "../components/levelA/LoadingScreen";
import FUpdateScreen from "../components/levelA/UpdateScreen";
import FGoogleAuthError from "../components/levelA/GoogleAuthError";
import { StoreProvider } from '../components/levelA/StoreProvider';
import LoadingScreenData from '../components/levelA/LoadingScreenData';
// import { TooltipProvider } from 'react-tooltip';

export default function App({ Component, pageProps, router }) {

  const [isFirstMount, setIsFirstMount] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const handleRouteChange = () => {
      isFirstMount && setIsFirstMount(false);
      setIsLoading(false);
    };

    const handleRouteEnd = () => {
      isFirstMount && setIsFirstMount(false);
      setIsLoading(true);
    };

    router.events.on("routeChangeStart", handleRouteChange);
    router.events.on("routeChangeComplete", handleRouteEnd);
    router.events.on("routeChangeError", handleRouteEnd);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("routeChangeComplete", handleRouteEnd);
      router.events.off("routeChangeError", handleRouteEnd);
    };

  }, []);

  return (
    <StoreProvider
      isFirstMount={isFirstMount}
      {...pageProps}

    >

      <FLoadingScreen
        key="LoadingScreen"
      />

      <FUpdateScreen
        key="UpdateScreen"
      />

      <FGoogleAuthError
        key="GoogleAuthError"
      />

      <AppLayout
        key="Layout"
        onSidebar={Component.onSidebar}
        isLoading={setIsLoading}
      >

        <AnimatePresence mode="wait">
          {isLoading ?
            // <TooltipProvider>
              <Component
                isFirstMount={isFirstMount}
                key={router.route}
                {...pageProps}
              />
            // </TooltipProvider>
            :
            <LoadingScreenData />}
        </AnimatePresence>
      </AppLayout>

    </StoreProvider>
  )

}
import React, { useEffect, useState } from 'react';

export function FNoSSR({ children }) {
    const [isMounted, setMount] = useState(false);
  
    useEffect(() => {
      setMount(true);
    }, []);
  
    return <>{isMounted ? children : null}</>;
}
import React from "react";
import FFooter from "../levelB_higth/FFooter";
import FNavbar from "../levelB_higth/FNavbar";
import FSidebar from '../levelB_higth/FSidebar';

export default function AppLayout({ onSidebar, children }) {
    return (
        <div className={`flex flex-col min-h-screen min-w-fit ${onSidebar ? 'bg-color_C' : null}`}>
            <FNavbar />
            {onSidebar ? <FSidebar /> : null}
            <main
                className={`lg:mt-20 flex-1 flex ${onSidebar ? 'lg:ml-64' : 'mb-16'}`}
            >
                {children}
            </main>
            {onSidebar ? null : <FFooter />}
        </div>
    );
};
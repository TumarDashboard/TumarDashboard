import React from "react";
import FFooter from "../middle/FFooter";
import FNavbar from "../middle/FNavbar";
import FSidebar from '../middle/FSidebar';

export default function AppLayout({ onSidebar, children }) {
    return (
        <div className={`flex flex-col min-h-screen ${onSidebar ? 'bg-color_C' : null}`}>
            <FNavbar />
            {onSidebar ? <FSidebar /> : null}
            <main
                className={`mt-20 flex-1 flex ${onSidebar ? 'lg:ml-64' : 'mb-16'}`}
            >
                {children}
            </main>
            {onSidebar ? null : <FFooter />}
        </div>
    );
};
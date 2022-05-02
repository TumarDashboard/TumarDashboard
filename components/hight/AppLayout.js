import React from "react";
import FFooter from "../middle/FFooter";
import FNavbar from "../middle/FNavbar";
import FSidebar from '../middle/FSidebar';

export default function AppLayout({ onSidebar, children }) {
    return (
        //
        <div className="flex flex-col min-h-screen">
            <FNavbar />
            {onSidebar ? <FSidebar/>: null }
            <main className="pt-20 pb-16 flex grow" >{children}</main>
            <FFooter />
        </div>
    );
};
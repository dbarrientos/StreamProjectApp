import React from 'react';
import BackgroundDecorations from './BackgroundDecorations';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, hideNavbar = false }) => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] text-slate-200 relative overflow-hidden font-rajdhani flex flex-col">
            <BackgroundDecorations />
            
            {!hideNavbar && <Navbar />}

            <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto p-6">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;

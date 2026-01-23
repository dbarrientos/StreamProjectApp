import React from 'react';
import BackgroundDecorations from './BackgroundDecorations';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, hideNavbar = false }) => {
    return (
        <div className="min-h-screen bg-skin-base text-skin-text-base relative overflow-hidden font-sans flex flex-col transition-colors duration-500">
            <BackgroundDecorations />
            
            <div className="w-full max-w-7xl mx-auto px-6 py-6 relative z-10">
                {!hideNavbar && <Navbar />}
                
                <main className="flex-grow w-full">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default Layout;

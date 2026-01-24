import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Twitch, Zap, Monitor, History, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import LogoIcon from '../components/LogoIcon';
import ThemeSelector from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const appName = import.meta.env.VITE_APP_NAME || "TWITCH RAFFLE";
  const [firstLine, secondLine] = appName.split(" ");

  const handleLogin = () => {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state);
    window.location.href = 'https://localhost:3000/auth/twitch';
  };

  return (
    <Layout hideNavbar={true}>
        {/* Absolute Controls for Login Page */}
        <div className="absolute top-6 right-6 flex gap-3 z-50">
            <ThemeSelector />
            <LanguageSelector />
        </div>

        <div className="min-h-screen flex flex-col pt-16 pb-8 px-6">
            
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full mb-16 relative">
                
                {/* Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-skin-accent/10 rounded-full blur-[100px] animate-pulse"></div>

                {/* Logo / Icon */}
                <div className="mb-8 relative inline-block group">
                    <div className="absolute inset-0 bg-skin-success blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                     <div className="relative p-4 rounded-3xl transition-all duration-500 transform group-hover:scale-110">
                        <LogoIcon 
                            className="h-32 w-auto drop-shadow-[0_0_20px_var(--color-accent)]"
                        />
                    </div>
                </div>

                <div className="text-5xl md:text-8xl text-skin-text-base theme-title mb-8 leading-tight text-center relative z-10">
                   {theme === 'cyberpunk' || theme === 'kawaii' || theme === 'mario' ? (
                       <>
                           <div className="glitch-text" data-text={t('login.hero_title_1', { defaultValue: firstLine.toUpperCase() })}>
                                {t('login.hero_title_1', { defaultValue: firstLine.toUpperCase() })}
                           </div>
                           {secondLine && (
                               <div className="glitch-text text-skin-accent" data-text={t('login.hero_title_2', { defaultValue: secondLine.toUpperCase() })}>
                                   {t('login.hero_title_2', { defaultValue: secondLine.toUpperCase() })}
                               </div>
                           )}
                       </>
                   ) : (
                       <>
                           <div>
                                {t('login.hero_title_1', { defaultValue: firstLine.toUpperCase() })}
                           </div>
                           {secondLine && (
                               <div className="text-skin-accent">
                                   {t('login.hero_title_2', { defaultValue: secondLine.toUpperCase() })}
                               </div>
                           )}
                       </>
                   )}
                </div>
                
                <p className="text-skin-text-muted text-xl md:text-2xl mb-12 font-medium max-w-xl mx-auto text-center leading-relaxed">
                    {t('login.hero_description')}<br/>
                    <span className="text-skin-accent font-black mt-2 inline-block drop-shadow-md tracking-wider text-2xl">{t('login.no_bots')}</span>
                </p>

                <div className="max-w-md w-full mx-auto relative z-20">
                    <button 
                      onClick={handleLogin}
                      className="group relative w-full px-8 py-6 bg-[#9146FF] hover:bg-[#7c2cf8] text-white font-bold text-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(145,70,255,0.3)] hover:shadow-[0_0_60px_rgba(145,70,255,0.5)] rounded-2xl overflow-hidden border border-white/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                      <div className="flex items-center justify-center gap-4 relative z-10">
                        <Twitch size={32} />
                        <span>{t('login.connect_twitch')}</span>
                      </div>
                    </button>
                    <p className="mt-4 text-xs text-skin-text-muted text-center uppercase tracking-widest opacity-60">
                        {t('login.secure_access')}
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="bg-skin-base-secondary/50 hover:bg-skin-base-secondary p-8 rounded-2xl border border-skin-border/50 hover:border-skin-accent/50 transition-all group backdrop-blur-sm">
                    <div className="w-12 h-12 bg-skin-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Monitor size={24} className="text-skin-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-skin-text-base mb-3">{t('login.features.integration.title')}</h3>
                    <p className="text-skin-text-muted leading-relaxed">
                        {t('login.features.integration.desc')}
                    </p>
                </div>

                <div className="bg-skin-base-secondary/50 hover:bg-skin-base-secondary p-8 rounded-2xl border border-skin-border/50 hover:border-skin-success/50 transition-all group backdrop-blur-sm">
                    <div className="w-12 h-12 bg-skin-success/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Zap size={24} className="text-skin-success" />
                    </div>
                    <h3 className="text-xl font-bold text-skin-text-base mb-3">{t('login.features.obs.title')}</h3>
                    <p className="text-skin-text-muted leading-relaxed">
                        {t('login.features.obs.desc')}
                    </p>
                </div>

                <div className="bg-skin-base-secondary/50 hover:bg-skin-base-secondary p-8 rounded-2xl border border-skin-border/50 hover:border-skin-danger/50 transition-all group backdrop-blur-sm">
                    <div className="w-12 h-12 bg-skin-danger/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <History size={24} className="text-skin-danger" />
                    </div>
                    <h3 className="text-xl font-bold text-skin-text-base mb-3">{t('login.features.history.title')}</h3>
                    <p className="text-skin-text-muted leading-relaxed">
                        {t('login.features.history.desc')}
                    </p>
                </div>
            </div>

            <div className="mt-16 text-center">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-skin-base-secondary border border-skin-border text-xs font-mono text-skin-text-muted">
                    <Sparkles size={12} className="text-skin-accent" />
                    <span>{t('login.version')}</span>
                 </div>
            </div>

        </div>
    </Layout>
  );
};

export default Login;

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import HomeSection from '../components/dashboard/HomeSection';
import ContentSection from '../components/dashboard/ContentSection';
import UsersSection from '../components/dashboard/UsersSection';
import ClientsSection from '../components/dashboard/ClientsSection';
import ProductsSection from '../components/dashboard/ProductsSection';
import CompaniesSection from '../components/dashboard/CompaniesSection';
import TicketsSection from '../components/dashboard/TicketsSection';
import SalesSection from '../components/dashboard/SalesSection';
import AdminSection from '../components/dashboard/AdminSection';
import InvoiceSection from '../components/dashboard/InvoiceSection';
import InvoiceListSection from '../components/dashboard/InvoiceListSection';
import LogSection from '../components/dashboard/LogSection';
import StaffManagement from '../components/admin/StaffManagement';
import TenantInfo from '../components/dashboard/TenantInfo';
import { Bell, Search, Calendar as CalendarIcon, ChevronRight, ShoppingCart, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user } = useAuth();
    const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <HomeSection />;
            case 'invoice':
            case 'invoices':
                return <InvoiceSection />;
            case 'invoiceList':
            case 'invoice-list':
                return <InvoiceListSection />;
            case 'sales':
                return <SalesSection />;
            case 'users':
                return <UsersSection />;
            case 'clients':
                return <ClientsSection />;
            case 'products':
                return <ProductsSection />;
            case 'companies':
                return <CompaniesSection />;
            case 'tickets':
                return <TicketsSection />;
            case 'admin':
                return <AdminSection />;
            case 'logs':
                return <LogSection />;
            case 'staff-management':
                return <StaffManagement />;
            case 'tenant-info':
                return <TenantInfo />;
            default:
                return <HomeSection />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] w-full overflow-hidden">
            {/* Sidebar Fijo */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Contenedor Principal */}
            <main className="flex-1 flex flex-col min-w-0 h-screen ml-72 overflow-hidden">
                {/* Modern Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-30 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-400 font-medium">Panel</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-800 font-black capitalize tracking-tight">{activeTab.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Botón Punto de Venta (Nuevo) */}
                        {/* <button 
                            onClick={() => setActiveTab('tickets')}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                                activeTab === 'tickets' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200'
                            }`}
                        >
                            <ShoppingCart size={16} />
                            <span>Punto de Venta</span>
                        </button> */}

                        {/* Search Bar */}
                       {/*  <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-64 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                            <Search size={16} className="text-slate-400 mr-2" />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-xs font-medium w-full text-slate-600" />
                        </div> */}

                        {/* Date */}
                        <div className="hidden md:flex items-center text-slate-500 space-x-2">
                            <CalendarIcon size={16} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{today}</span>
                        </div>

                        {/* ShoppinCart */}
                        <button 
                        onClick={() => setActiveTab('tickets')}
                        className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <ShoppingCart size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>
                        {/* Notifications */}
                        <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>


                        

                        {/* User Avatar Group */}
                        <div className="flex items-center space-x-3 pl-6 border-l border-slate-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-none">{user?.username}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 border-2 border-white">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
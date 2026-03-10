import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, LogOut, 
    ShieldAlert, Package, Building, 
    History, FileText, List,
    ChevronDown, ChevronRight, Terminal,
    ShieldCheck, Building2, UserCircle,
    UsersPlus, Crown
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user, logout, hasPermission } = useAuth();
    const [openGroup, setOpenGroup] = useState(null);

    const toggleGroup = (group) => {
        setOpenGroup(openGroup === group ? null : group);
    };

    const menuGroups = [
        {
            id: 'principal',
            title: 'Principal',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard', action: 'view' },
                { id: 'sales', label: 'Historial Ventas', icon: History, section: 'sales', action: 'view' },
            ]
        },
        {
            id: 'facturacion',
            title: 'Facturación',
            items: [
                { id: 'invoices', label: 'Nueva Factura', icon: FileText, section: 'invoices', action: 'view' },
                { id: 'invoice-list', label: 'Mis Facturas', icon: List, section: 'invoiceList', action: 'view' },
            ]
        },
        {
            id: 'catalogos',
            title: 'Catálogos',
            items: [
                { id: 'clients', label: 'Clientes', icon: Users, section: 'clients', action: 'view' },
                { id: 'products', label: 'Productos', icon: Package, section: 'products', action: 'view' },
            ]
        },
        {
            id: 'configuracion',
            title: 'Configuración',
            items: [
                { id: 'companies', label: 'Empresa', icon: Building2, section: 'companies', action: 'view' },
                { id: 'admin', label: 'Seguridad', icon: ShieldAlert, section: 'admin', action: 'view' },
                { id: 'users', label: 'Personal', icon: UserCircle, section: 'users', action: 'view' },
                { id: 'logs', label: 'Logs del Sistema', icon: Terminal, section: 'logs', action: 'view' },
            ]
        },
        {
            id: 'multitenant',
            title: 'Gestión de Equipo',
            items: [
                { id: 'staff-management', label: 'Mis Empleados', icon: UsersPlus, section: 'staff', action: 'view', ownerOnly: true },
                { id: 'tenant-info', label: 'Mi Perfil', icon: Crown, section: 'profile', action: 'view', ownerOnly: false },
            ]
        }
    ];

    // Filtrar grupos que tienen al menos un item permitido
    const filteredGroups = menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            // Si es administrador, tiene acceso a todo
            if (user?.role === 'Administrador') return true;
            
            // Si el item es solo para OWNER, verificar systemRole
            if (item.ownerOnly && user?.systemRole !== 'OWNER') return false;
            
            // Si no, verificamos el permiso granular
            return hasPermission(item.section, item.action);
        })
    })).filter(group => group.items.length > 0);

    return (
        <div className="w-72 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 shadow-2xl z-50 border-r border-white/5 overflow-hidden">
            {/* Logo Section */}
            <div className="p-8 flex items-center space-x-4 shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="text-white" size={28} />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tighter uppercase">FAZTY <span className="text-blue-500">PRO</span></h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise ERP</p>
                </div>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 mb-6 shrink-0">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center space-x-3 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-black border border-blue-500/30 shadow-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                            {user?.systemRole === 'OWNER' ? 'JEFE' : user?.systemRole === 'STAFF' ? 'EMPLEADO' : user?.role}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div 
                className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide"
                style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                
                {filteredGroups.map((group) => (
                    <div key={group.id} className="space-y-1">
                        <button 
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-300 group ${
                                openGroup === group.id ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {group.title}
                            </span>
                            {openGroup === group.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        
                        {openGroup === group.id && (
                            <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                                            activeTab === item.id 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                            : 'hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                        {activeTab === item.id && (
                                            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-glow"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer / Logout */}
            <div className="p-6 border-t border-white/5 bg-slate-950/50 shrink-0">
                <button 
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-500 group"
                >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-widest">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
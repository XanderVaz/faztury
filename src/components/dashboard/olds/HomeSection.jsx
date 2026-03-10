import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
    Users, Package, Building, TrendingUp, ArrowUpRight, 
    Clock, ShieldCheck, Zap, UserPlus, Activity, 
    Server, Cpu, HardDrive, Globe, Database,
    ChevronRight, Calendar, Bell
} from 'lucide-react';

const HomeSection = () => {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState({
        clients: 0,
        products: 0,
        companies: 0,
        users: 0,
        serverStatus: 'Cargando...'
    });
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, statusRes] = await Promise.all([
                    api.get('/stats'),
                    api.get('/logs/status')
                ]);
                setStatsData(statsRes.data);
                setSystemStatus(statusRes.data);
            } catch (err) {
                console.error('Error al cargar datos del dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const metrics = [
        { label: 'Clientes Activos', value: statsData.clients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', desc: 'Crecimiento mensual' },
        { label: 'Productos', value: statsData.products, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Estable', desc: 'En inventario' },
        { label: 'Empresas', value: statsData.companies, icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'OK', desc: 'Emisores configurados' },
        { label: 'Usuarios', value: statsData.users, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Activos', desc: 'Personal del sistema' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Panel de <span className="text-blue-600">Inteligencia</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm mt-1 flex items-center">
                        <Calendar size={14} className="mr-2" /> {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative">
                        <Bell size={20} className="text-slate-400" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center">
                        <Zap size={14} className="mr-2 text-amber-400 fill-amber-400" />
                        Sistema Online
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform duration-500`}>
                                <metric.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">{metric.trend}</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{loading ? '...' : metric.value}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{metric.label}</p>
                        <p className="text-[10px] font-bold text-slate-300 italic">{metric.desc}</p>
                    </div>
                ))}
            </div>

            {/* System Health & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Health */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <h2 className="text-xl font-black mb-8 flex items-center">
                        <Server className="mr-3 text-blue-400" size={24} />
                        Estado del Servidor
                    </h2>
                    
                    <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="flex items-center text-blue-400 mb-2">
                                    <Cpu size={14} className="mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">CPU Cores</span>
                                </div>
                                <p className="text-xl font-black">{systemStatus?.cpus || '...'}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="flex items-center text-emerald-400 mb-2">
                                    <HardDrive size={14} className="mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Memoria Libre</span>
                                </div>
                                <p className="text-xl font-black">{systemStatus?.freeMemory || '...'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Carga del Sistema</span>
                                <span className="text-xs font-black text-blue-400">{(systemStatus?.loadAvg?.[0] * 100 || 0).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, (systemStatus?.loadAvg?.[0] * 100 || 0))}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base de Datos</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Conectado</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Info */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-slate-900 flex items-center">
                            <Activity className="mr-3 text-indigo-600" size={24} />
                            Resumen Operativo
                        </h2>
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-slate-100 rounded-full"></div>
                            <div className="w-3 h-3 bg-slate-100 rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Acceso Global</p>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Tu sistema es accesible desde cualquier parte del mundo de forma segura.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Seguridad Activa</p>
                                    <p className="text-xs text-slate-400 font-bold mt-1">Encriptación de grado bancario en todas tus transacciones fiscales.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Información de Sesión</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Usuario</span>
                                    <span className="text-xs font-black text-slate-900">{user?.username}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Rol</span>
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">{user?.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">IP de Acceso</span>
                                    <span className="text-xs font-black text-slate-900">127.0.0.1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">FAZTY PRO v2.5.0-STABLE</p>
                        <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform">
                            Ver Documentación <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeSection;

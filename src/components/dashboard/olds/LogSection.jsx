import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    Terminal, Search, RefreshCw, Trash2, 
    AlertCircle, CheckCircle2, Info, ShieldAlert,
    Calendar, User, Globe, Cpu, Server, HardDrive,
    Activity, Database, ChevronRight, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LogSection = () => {
    const { hasPermission } = useAuth();
    const [logs, setLogs] = useState([]);
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, statusRes] = await Promise.all([
                api.get('/logs'),
                api.get('/logs/status')
            ]);
            setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            setSystemStatus(statusRes.data);
        } catch (err) {
            console.error('Error al cargar logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearLogs = async () => {
        if (!hasPermission('logs', 'delete')) {
            alert('No tienes permiso para eliminar los logs.');
            return;
        }
        if (!window.confirm('¿Estás seguro de limpiar todos los registros? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete('/logs/clear');
            setLogs([]);
            alert('Registros limpiados correctamente');
        } catch (err) {
            alert('Error al limpiar registros');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            (log.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.module || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'error': return <ShieldAlert className="text-rose-500" size={18} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Terminal size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Logs del Sistema</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registro de eventos y estado del servidor</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={fetchData} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {hasPermission('logs', 'delete') && (
                        <button onClick={clearLogs} className="flex items-center space-x-2 px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                            <Trash2 size={18} />
                            <span>Limpiar Todo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                            <Cpu size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Procesador</span>
                    </div>
                    <p className="text-2xl font-black">{systemStatus?.cpus || '...'} Cores</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{systemStatus?.arch} Architecture</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <HardDrive size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memoria RAM</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{systemStatus?.freeMemory || '...'} Libres</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">De {systemStatus?.totalMemory} Totales</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Activity size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uptime</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{(systemStatus?.uptime / 3600).toFixed(1)} Horas</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Node {systemStatus?.nodeVersion}</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filtrar por usuario, módulo o detalle..." 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter size={18} className="text-slate-400 mr-2" />
                        {['all', 'success', 'error', 'warning', 'info'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filterStatus === status 
                                    ? 'bg-slate-900 text-white shadow-lg' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                {status === 'all' ? 'Todos' : status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <RefreshCw className="animate-spin mx-auto text-slate-200 mb-4" size={40} />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Cargando registros...</p>
                                    </td>
                                </tr>
                            ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(log.status)}
                                            <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-black text-xs">
                                                {log.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm">{log.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-slate-500 max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                            {log.details}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-300 mt-1 uppercase tracking-widest">IP: {log.ip}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <Database className="mx-auto text-slate-100 mb-4" size={48} />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No se encontraron registros</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogSection;

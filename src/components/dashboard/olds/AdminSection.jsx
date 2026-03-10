import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    ShieldCheck, Globe, Save, Key, Server, RefreshCw, Zap, Lock, 
    List, Plus, FileText, CheckCircle2, X, AlertCircle, Hash, 
    ChevronDown, ChevronUp, Settings, Layout, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSection = () => {
    const { hasPermission } = useAuth();
    // Estado inicial robusto
    const [config, setConfig] = useState({
        apiEnvironment: 'sandbox',
        externalApi: {
            sandbox: { host: '', apiKey: '', secretKey: '', pluginKey: '' },
            production: { host: '', apiKey: '', secretKey: '', pluginKey: '' }
        },
        activeSeries: {
            factura: '',
            pago: '',
            nota_credito: '',
            honorarios: '',
            arrendamiento: ''
        }
    });
    
    const [series, setSeries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Control de Paneles Desplegables
    const [openPanels, setOpenPanels] = useState({
        credentials: true,
        activeSeries: false
    });

    const togglePanel = (panel) => {
        setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
    };

    const [newSerie, setNewSerie] = useState({
        letra: '',
        tipoDocumento: 'factura',
        folio: 1
    });

    const docTypes = [
        { id: 'factura', label: 'Factura' },
        { id: 'honorarios', label: 'Recibo de honorarios' },
        { id: 'arrendamiento', label: 'Recibo de arrendamiento' },
        { id: 'nota_credito', label: 'Nota de crédito' },
        { id: 'pago', label: 'Pago' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [configRes, seriesRes] = await Promise.all([
                api.get('/config'),
                api.get('/series')
            ]);

            if (configRes.data) {
                const fetchedConfig = configRes.data;
                if (!fetchedConfig.activeSeries) {
                    fetchedConfig.activeSeries = {
                        factura: '', pago: '', nota_credito: '', honorarios: '', arrendamiento: ''
                    };
                }
                setConfig(fetchedConfig);
            }

            if (seriesRes.data && seriesRes.data.data) {
                setSeries(seriesRes.data.data);
            }
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setMessage({ type: 'error', text: 'Error al conectar con el servidor' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        if (!hasPermission('admin', 'edit')) {
            alert('No tienes permiso para editar la configuración.');
            return;
        }
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/config', config);
            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al persistir los cambios' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateSerie = async (e) => {
        e.preventDefault();
        if (!hasPermission('admin', 'create')) {
            alert('No tienes permiso para crear series.');
            return;
        }
        setIsSaving(true);
        try {
            await api.post('/series/create', newSerie);
            setMessage({ type: 'success', text: 'Serie creada exitosamente' });
            setIsModalOpen(false);
            setNewSerie({ letra: '', tipoDocumento: 'factura', folio: 1 });
            const seriesRes = await api.get('/series');
            if (seriesRes.data && seriesRes.data.data) setSeries(seriesRes.data.data);
        } catch (err) {
            alert(err.response?.data?.details?.message || 'Error al crear la serie');
        } finally {
            setIsSaving(false);
        }
    };

    if (!hasPermission('admin', 'view')) {
        return (
            <div className="flex items-center justify-center h-96 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="text-center">
                    <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Acceso Denegado</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">No tienes permisos para ver esta sección.</p>
                </div>
            </div>
        );
    }

    if (isLoading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs text-center">Sincronizando configuración...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Moderno */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Administración</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuración Global del Sistema</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsCatalogModalOpen(true)}
                        className="flex items-center justify-center space-x-3 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                    >
                        <List size={18} />
                        <span>Ver Catálogo</span>
                    </button>
                    {hasPermission('admin', 'edit') && (
                        <button 
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>{isSaving ? 'Guardando...' : 'Guardar Todo'}</span>
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`p-6 rounded-3xl flex items-center space-x-4 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            {/* PANEL 1: CREDENCIALES Y ENTORNO */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-500">
                <button 
                    onClick={() => togglePanel('credentials')}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Globe size={24} /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Entorno y Credenciales API</h3>
                            <p className="text-xs font-bold text-slate-400">Configuración de conexión con PAC</p>
                        </div>
                    </div>
                    {openPanels.credentials ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                
                {openPanels.credentials && (
                    <div className="p-8 pt-0 space-y-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                            <button 
                                onClick={() => setConfig({...config, apiEnvironment: 'sandbox'})}
                                className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${config.apiEnvironment === 'sandbox' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Sandbox
                            </button>
                            <button 
                                onClick={() => setConfig({...config, apiEnvironment: 'production'})}
                                className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${config.apiEnvironment === 'production' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Producción
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Host de la API</label>
                                <div className="relative">
                                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="https://api.factura.mx"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                        value={config.externalApi[config.apiEnvironment].host}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            externalApi: {
                                                ...config.externalApi,
                                                [config.apiEnvironment]: { ...config.externalApi[config.apiEnvironment], host: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="password" 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                            value={config.externalApi[config.apiEnvironment].apiKey}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                externalApi: {
                                                    ...config.externalApi,
                                                    [config.apiEnvironment]: { ...config.externalApi[config.apiEnvironment], apiKey: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="password" 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                            value={config.externalApi[config.apiEnvironment].secretKey}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                externalApi: {
                                                    ...config.externalApi,
                                                    [config.apiEnvironment]: { ...config.externalApi[config.apiEnvironment], secretKey: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL 2: SERIES ACTIVAS */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <button 
                    onClick={() => togglePanel('activeSeries')}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Zap size={24} /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Series y Folios Activos</h3>
                            <p className="text-xs font-bold text-slate-400">Define qué serie usar para cada tipo de documento</p>
                        </div>
                    </div>
                    {openPanels.activeSeries ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>

                {openPanels.activeSeries && (
                    <div className="p-8 pt-0 space-y-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {docTypes.map(doc => (
                                <div key={doc.id} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{doc.label}</label>
                                    <select 
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                        value={config.activeSeries[doc.id]}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            activeSeries: { ...config.activeSeries, [doc.id]: e.target.value }
                                        })}
                                    >
                                        <option value="">Seleccionar serie...</option>
                                        {series.filter(s => s.tipoDocumento === doc.id).map(s => (
                                            <option key={s._id} value={s.letra}>{s.letra} (Inicia en {s.folio})</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        
                        {hasPermission('admin', 'create') && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center space-x-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-700 transition-colors"
                            >
                                <Plus size={14} />
                                <span>Crear Nueva Serie SAT</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL PARA CREAR SERIE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nueva Serie SAT</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400" /></button>
                        </div>
                        
                        <form onSubmit={handleCreateSerie} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                    value={newSerie.tipoDocumento}
                                    onChange={(e) => setNewSerie({...newSerie, tipoDocumento: e.target.value})}
                                >
                                    {docTypes.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Letra de la Serie</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: A, F, BOL"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                    value={newSerie.letra}
                                    onChange={(e) => setNewSerie({...newSerie, letra: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folio Inicial</label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                    value={newSerie.folio}
                                    onChange={(e) => setNewSerie({...newSerie, folio: parseInt(e.target.value)})}
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center space-x-3"
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                                <span>{isSaving ? 'Procesando...' : 'Registrar Serie'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSection;

import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    ShieldCheck, Globe, Save, Key, Server, RefreshCw, Zap, Lock, 
    List, Plus, FileText, CheckCircle2, X, AlertCircle, Hash, 
    ChevronDown, ChevronUp, Settings, Layout, Building2, Trash2, Edit2, Mail
} from 'lucide-react';

const AdminSection = () => {
    // Estado inicial robusto
    const [config, setConfig] = useState({
        apiEnvironment: 'sandbox',
        connectionType: 'master',
        activeCompanyId: null,
        pdfSource: 'api',
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
        },
        smtp: {
            host: '',
            port: 587,
            secure: false,
            user: '',
            pass: '',
            from: ''
        }
    });
    
    const [series, setSeries] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Control de Paneles Desplegables
    const [openPanels, setOpenPanels] = useState({
        credentials: false,
        activeSeries: false,
        pdfConfig: false,
        companies: false,
        smtpConfig: false
    });

    const togglePanel = (panel) => {
        setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
    };

    const [newSerie, setNewSerie] = useState({
        letra: '',
        tipoDocumento: 'factura',
        folio: 1
    });

    const [newCompany, setNewCompany] = useState({
        rfc: '',
        razons: '',
        apiKey: '',
        secretKey: '',
        smtp: {
            host: '',
            port: 587,
            secure: false,
            user: '',
            pass: '',
            from: ''
        }
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
            const [configRes, seriesRes, companiesRes] = await Promise.all([
                api.get('/config'),
                api.get('/series'),
                api.get('/companies/credentials')
            ]);

            if (configRes.data) {
                const fetchedConfig = configRes.data;
                if (!fetchedConfig.activeSeries) {
                    fetchedConfig.activeSeries = {
                        factura: '', pago: '', nota_credito: '', honorarios: '', arrendamiento: ''
                    };
                }
                if (!fetchedConfig.smtp) {
                    fetchedConfig.smtp = { host: '', port: 587, secure: false, user: '', pass: '', from: '' };
                }
                setConfig(fetchedConfig);
            }

            if (seriesRes.data && seriesRes.data.data) {
                setSeries(seriesRes.data.data);
            }

            if (companiesRes.data) {
                setCompanies(companiesRes.data);
            }
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setMessage({ type: 'error', text: 'Error al conectar con el servidor' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
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

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/companies/credentials', newCompany);
            setMessage({ type: 'success', text: 'Empresa creada exitosamente' });
            setIsCompanyModalOpen(false);
            setNewCompany({ rfc: '', razons: '', apiKey: '', secretKey: '', smtp: { host: '', port: 587, secure: false, user: '', pass: '', from: '' } });
            const companiesRes = await api.get('/companies/credentials');
            if (companiesRes.data) setCompanies(companiesRes.data);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Error al crear la empresa' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCompany = async (companyId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta empresa?')) return;
        
        try {
            await api.delete(`/companies/credentials/${companyId}`);
            setMessage({ type: 'success', text: 'Empresa eliminada correctamente' });
            const companiesRes = await api.get('/companies/credentials');
            if (companiesRes.data) setCompanies(companiesRes.data);
            
            // Si la empresa eliminada era la activa, cambiar a master
            if (config.activeCompanyId === companyId) {
                setConfig({ ...config, connectionType: 'master', activeCompanyId: null });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al eliminar la empresa' });
        }
    };

    const getActiveCompanyName = () => {
        if (config.connectionType === 'master') return 'API Maestra (Personal)';
        const company = companies.find(c => c._id === config.activeCompanyId);
        return company ? `${company.razons} (${company.rfc})` : 'Empresa no encontrada';
    };

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
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        className="flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{isSaving ? 'Guardando...' : 'Guardar Todo'}</span>
                    </button>
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
                            <p className="text-xs font-bold text-slate-400">Conexión: {getActiveCompanyName()}</p>
                        </div>
                    </div>
                    {openPanels.credentials ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                
                {openPanels.credentials && (
                    <div className="p-8 pt-0 space-y-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Conexión</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setConfig({...config, connectionType: 'master', activeCompanyId: null})}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center space-x-4 ${config.connectionType === 'master' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${config.connectionType === 'master' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Zap size={20} /></div>
                                    <div>
                                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">API Maestra</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Usa tus credenciales globales</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, connectionType: 'company'})}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center space-x-4 ${config.connectionType === 'company' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${config.connectionType === 'company' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Building2 size={20} /></div>
                                    <div>
                                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">Multi-Empresa</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Usa credenciales por empresa</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {config.connectionType === 'company' && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Empresa Activa</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                        value={config.activeCompanyId || ''}
                                        onChange={(e) => setConfig({...config, activeCompanyId: e.target.value})}
                                    >
                                        <option value="">-- Seleccione una empresa --</option>
                                        {companies.map(c => (
                                            <option key={c._id} value={c._id}>{c.razons} ({c.rfc})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entorno de Ejecución</label>
                                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                    <button 
                                        onClick={() => setConfig({...config, apiEnvironment: 'sandbox'})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.apiEnvironment === 'sandbox' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Pruebas (Sandbox)
                                    </button>
                                    <button 
                                        onClick={() => setConfig({...config, apiEnvironment: 'production'})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.apiEnvironment === 'production' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Producción
                                    </button>
                                </div>
                            </div>
                        </div>

                        {config.connectionType === 'master' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Host</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
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
                        )}
                    </div>
                )}
            </div>

            {/* PANEL 2: CONFIGURACIÓN SMTP (NUEVO) */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-500">
                <button 
                    onClick={() => togglePanel('smtpConfig')}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Mail size={24} /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Configuración de Correo (SMTP)</h3>
                            <p className="text-xs font-bold text-slate-400">Servidor para envío de facturas en modo local</p>
                        </div>
                    </div>
                    {openPanels.smtpConfig ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                
                {openPanels.smtpConfig && (
                    <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Host SMTP</label>
                                <input 
                                    type="text" 
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                    value={config.smtp?.host || ''}
                                    onChange={(e) => setConfig({...config, smtp: {...config.smtp, host: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Puerto</label>
                                <input 
                                    type="number" 
                                    placeholder="587"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                    value={config.smtp?.port || 587}
                                    onChange={(e) => setConfig({...config, smtp: {...config.smtp, port: parseInt(e.target.value)}})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seguridad (SSL/TLS)</label>
                                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                    <button 
                                        onClick={() => setConfig({...config, smtp: {...config.smtp, secure: false}})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!config.smtp?.secure ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        TLS (587)
                                    </button>
                                    <button 
                                        onClick={() => setConfig({...config, smtp: {...config.smtp, secure: true}})}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.smtp?.secure ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}
                                    >
                                        SSL (465)
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario / Email</label>
                                <input 
                                    type="text" 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                    value={config.smtp?.user || ''}
                                    onChange={(e) => setConfig({...config, smtp: {...config.smtp, user: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                <input 
                                    type="password" 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                    value={config.smtp?.pass || ''}
                                    onChange={(e) => setConfig({...config, smtp: {...config.smtp, pass: e.target.value}})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Remitente (From)</label>
                            <input 
                                type="email" 
                                placeholder="facturacion@tuempresa.com"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                value={config.smtp?.from || ''}
                                onChange={(e) => setConfig({...config, smtp: {...config.smtp, from: e.target.value}})}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL 3: FUENTE DEL PDF */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-500">
                <button 
                    onClick={() => togglePanel('pdfConfig')}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText size={24} /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Fuente de Archivos PDF</h3>
                            <p className="text-xs font-bold text-slate-400">Origen: {config.pdfSource === 'api' ? 'API Externa' : 'Generación Local'}</p>
                        </div>
                    </div>
                    {openPanels.pdfConfig ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </button>
                
                {openPanels.pdfConfig && (
                    <div className="p-8 pt-0 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => setConfig({...config, pdfSource: 'api'})}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center space-x-4 ${config.pdfSource === 'api' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className={`p-3 rounded-2xl ${config.pdfSource === 'api' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Server size={20} /></div>
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">API Externa (Factura.com)</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Usa el diseño estándar de la API.</p>
                                </div>
                                {config.pdfSource === 'api' && <CheckCircle2 className="text-emerald-600 ml-auto" size={20} />}
                            </button>
                            <button 
                                onClick={() => setConfig({...config, pdfSource: 'local'})}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center space-x-4 ${config.pdfSource === 'local' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className={`p-3 rounded-2xl ${config.pdfSource === 'local' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Layout size={20} /></div>
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">Generación Local (XML)</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase leading-relaxed">Genera el PDF localmente usando una plantilla personalizable.</p>
                                </div>
                                {config.pdfSource === 'local' && <CheckCircle2 className="text-emerald-600 ml-auto" size={20} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL 4: SERIES ACTIVAS */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-500">
                <button 
                    onClick={() => togglePanel('activeSeries')}
                    className="w-full p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Hash size={24} /></div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Series Activas</h3>
                            <p className="text-xs font-bold text-slate-400">Seleccione las series por defecto para facturación</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                        onClick={() => setIsCatalogModalOpen(true)}
                        className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <List size={12} />
                        <span>Ver Catálogo</span>
                    </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                        >
                            <Plus size={12} />
                            <span>Nueva Serie</span>
                        </button>
                        {openPanels.activeSeries ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                    </div>
                </button>
                
                {openPanels.activeSeries && (
                    <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                        {['factura', 'pago', 'nota_credito', 'honorarios', 'arrendamiento'].map((type) => (
                            <div key={type} className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serie para {type.replace('_', ' ')}</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                        value={config.activeSeries?.[type] || ''}
                                        onChange={(e) => setConfig({
                                            ...config, 
                                            activeSeries: { ...config.activeSeries, [type]: e.target.value }
                                        })}
                                    >
                                        <option value="">-- Sin Serie (Folio API) --</option>
                                        {series.filter(s => s.SerieType === type).map(s => (
                                            <option key={s.SerieID} value={s.SerieID}>{s.SerieName} - {s.SerieDescription}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Catálogo de Series */}
            {isCatalogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><List size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Catálogo de Series (API)</h3>
                                    <p className="text-xs font-bold text-slate-400">Listado de series fiscales registradas en factura</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCatalogModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="overflow-x-auto rounded-3xl border border-slate-100">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="p-6">Letra</th>
                                            <th className="p-6">Tipo</th>
                                            <th className="p-6">Siguiente Folio</th>
                                            <th className="p-6">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {series.map((s) => (
                                            <tr key={s.SerieID} className="text-sm font-bold text-slate-600 hover:bg-slate-50/50 transition-colors">
                                                <td className="p-6 text-slate-900">{s.SerieName}</td>
                                                <td className="p-6 uppercase text-[10px] tracking-wider">{s.SerieType}</td>
                                                <td className="p-6">{s.CurrentFolio}</td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] uppercase font-black">Activa</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {series.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No hay series registradas</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setIsCatalogModalOpen(false)}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Cerrar Catálogo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nueva Serie */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Crear Nueva Serie Fiscal</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateSerie} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Letra / Prefijo</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Ej: F, P, NC"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    value={newSerie.letra}
                                    onChange={(e) => setNewSerie({...newSerie, letra: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    value={newSerie.tipoDocumento}
                                    onChange={(e) => setNewSerie({...newSerie, tipoDocumento: e.target.value})}
                                >
                                    {docTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folio Inicial</label>
                                <input 
                                    required
                                    type="number" 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    value={newSerie.folio}
                                    onChange={(e) => setNewSerie({...newSerie, folio: parseInt(e.target.value)})}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                {isSaving ? 'Creando...' : 'Registrar Serie en API'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nueva Empresa */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Registrar Empresa</h3>
                            <button onClick={() => setIsCompanyModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateCompany} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RFC</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                        value={newCompany.rfc}
                                        onChange={(e) => setNewCompany({...newCompany, rfc: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                        value={newCompany.razons}
                                        onChange={(e) => setNewCompany({...newCompany, razons: e.target.value.toUpperCase()})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">API Key</label>
                                <input 
                                    required
                                    type="password" 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    value={newCompany.apiKey}
                                    onChange={(e) => setNewCompany({...newCompany, apiKey: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                                <input 
                                    required
                                    type="password" 
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    value={newCompany.secretKey}
                                    onChange={(e) => setNewCompany({...newCompany, secretKey: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                {isSaving ? 'Guardando...' : 'Registrar Empresa'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSection;

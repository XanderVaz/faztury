import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { 
    FileText, Search, Plus, Trash2, Send, 
    User, Package, Hash, DollarSign, Calculator,
    AlertCircle, CheckCircle2, RefreshCw, X, ChevronRight,
    Ticket, FileEdit, Users, Globe, Calendar, Minus, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InvoiceSection = () => {
    const { hasPermission } = useAuth();
    const [step, setStep] = useState(0); // 0: Selección de tipo, 1: Conceptos/Cliente, 2: Fiscal, 3: Éxito
    const [invoiceType, setInvoiceType] = useState(null); // 'ticket', 'libre', 'global'
    const [loading, setLoading] = useState(false);
    const [folioSearch, setFolioSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [clientResults, setClientResults] = useState([]);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [isSearchingClients, setIsSearchingClients] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '', detail: '' });
    const searchTimeout = useRef(null);
    const clientSearchTimeout = useRef(null);

    // Estados para Factura Global
    const [globalInfo, setGlobalInfo] = useState({
        Periodicidad: '01',
        Meses: '01',
        Año: new Date().getFullYear().toString()
    });
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const periodicidades = [
        { id: '01', label: '01 - Diario' },
        { id: '02', label: '02 - Semanal' },
        { id: '03', label: '03 - Quincenal' },
        { id: '04', label: '04 - Mensual' },
        { id: '05', label: '05 - Bimestral' }
    ];

    const mesesSujetos = [
        { id: '01', label: 'Enero' }, { id: '02', label: 'Febrero' }, { id: '03', label: 'Marzo' },
        { id: '04', label: 'Abril' }, { id: '05', label: 'Mayo' }, { id: '06', label: 'Junio' },
        { id: '07', label: 'Julio' }, { id: '08', label: 'Agosto' }, { id: '09', label: 'Septiembre' },
        { id: '10', label: 'Octubre' }, { id: '11', label: 'Noviembre' }, { id: '12', label: 'Diciembre' }
    ];

    const [invoiceData, setInvoiceData] = useState({
        receptorUID: '',
        clientName: '',
        clientRfc: '',
        tipoDocumento: 'factura',
        regimenFiscal: '601', 
        usoCFDI: 'G03',
        formaPago: '01',
        metodoPago: 'PUE',
        conceptos: [],
        foliosRelacionados: []
    });

    // Cargar datos iniciales
    useEffect(() => {
        if (step === 1) {
            fetchInitialData();
        }
    }, [step]);

    const fetchInitialData = async () => {
        setIsSearchingProducts(true);
        setIsSearchingClients(true);
        try {
            const [prodRes, cliRes] = await Promise.all([
                api.get('/products'),
                api.get('/clients')
            ]);
            setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
            setClients(Array.isArray(cliRes.data) ? cliRes.data : []);
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
        } finally {
            setIsSearchingProducts(false);
            setIsSearchingClients(false);
        }
    };

    const handleSelectType = async (type) => {
        setInvoiceType(type);
        setStep(1);
        setMessage({ type: '', text: '', detail: '' });
        
        const initialData = {
            receptorUID: '',
            clientName: '',
            clientRfc: '',
            tipoDocumento: 'factura',
            regimenFiscal: '601', 
            usoCFDI: 'G03',
            formaPago: '01',
            metodoPago: 'PUE',
            conceptos: [],
            foliosRelacionados: []
        };

        if (type === 'global') {
            try {
                const res = await api.get('/clients?search=PUBLICO EN GENERAL');
                const publicClient = res.data.find(c => c.rfc === 'XAXX010101000' || (c.razons || '').includes('PUBLICO EN GENERAL'));
                
                if (publicClient) {
                    initialData.clientName = publicClient.razons || publicClient.name;
                    initialData.clientRfc = publicClient.rfc;
                    initialData.regimenFiscal = publicClient.regimen || '616';
                    initialData.usoCFDI = 'S01';
                    initialData.receptorUID = publicClient.UID || publicClient._id;
                } else {
                    initialData.clientName = 'PUBLICO EN GENERAL';
                    initialData.clientRfc = 'XAXX010101000';
                    initialData.regimenFiscal = '616';
                    initialData.usoCFDI = 'S01';
                    initialData.receptorUID = 'XAXX010101000';
                }
            } catch (err) {
                console.error('Error buscando cliente global:', err);
            }
        }

        setInvoiceData(initialData);
    };

    const searchTicket = async () => {
        if (!folioSearch) return;
        if (invoiceData.foliosRelacionados.includes(folioSearch)) {
            alert('Este ticket ya ha sido añadido.');
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '', detail: '' });
        try {
            const res = await api.get(`/invoices/ticket/${folioSearch}`);
            const data = res.data;

            if (invoiceData.conceptos.length === 0 && invoiceType !== 'global') {
                setInvoiceData({
                    ...invoiceData,
                    receptorUID: data.clientExternalId,
                    clientName: data.clientName,
                    clientRfc: data.clientRfc,
                    regimenFiscal: data.clientRegimen || '601',
                    conceptos: [...data.concepts],
                    foliosRelacionados: [folioSearch]
                });
            } else {
                if (invoiceType !== 'global' && data.clientExternalId !== invoiceData.receptorUID) {
                    alert('No puedes mezclar tickets de diferentes clientes.');
                    return;
                }
                setInvoiceData({
                    ...invoiceData,
                    conceptos: [...invoiceData.conceptos, ...data.concepts],
                    foliosRelacionados: [...invoiceData.foliosRelacionados, folioSearch]
                });
            }
            setFolioSearch('');
            setMessage({ type: 'success', text: 'Ticket añadido correctamente.' });
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Ticket no encontrado o ya facturado.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketsByRange = async () => {
        if (!dateRange.start || !dateRange.end) {
            alert('Seleccione un rango de fechas válido.');
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '', detail: '' });
        try {
            const res = await api.get(`/sales/range?start=${dateRange.start}&end=${dateRange.end}&status=Completada`);
            const sales = res.data;
            
            if (!sales || sales.length === 0) {
                setMessage({ type: 'error', text: 'No se encontraron notas pendientes en este rango.' });
                return;
            }

            const allConcepts = [];
            const allFolios = [];
            
            sales.forEach(sale => {
                allFolios.push(sale.folio);
                sale.items.forEach(item => {
                    allConcepts.push({
                        ClaveProdServ: item.ClaveProdServ || '01010101',
                        Cantidad: item.quantity,
                        ClaveUnidad: item.ClaveUnidad || 'H87',
                        Unidad: item.Unidad || 'Pieza',
                        ValorUnitario: item.price,
                        Descripcion: item.name,
                        ObjetoImp: '02'
                    });
                });
            });

            setInvoiceData({
                ...invoiceData,
                conceptos: [...invoiceData.conceptos, ...allConcepts],
                foliosRelacionados: [...invoiceData.foliosRelacionados, ...allFolios]
            });
            setMessage({ type: 'success', text: `${sales.length} notas añadidas correctamente.` });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error al obtener notas por rango.' });
        } finally {
            setLoading(false);
        }
    };

    const selectClient = (client) => {
        setInvoiceData({
            ...invoiceData,
            receptorUID: client.UID || client._id,
            clientName: client.razons || client.name,
            clientRfc: client.rfc,
            regimenFiscal: client.regimen || '601'
        });
        setClientSearch('');
    };

    const addManualConcept = (product) => {
        const productId = product.UID || product._id;
        const existingIdx = invoiceData.conceptos.findIndex(c => c.productExternalId === productId);
        
        if (existingIdx >= 0) {
            const newConcepts = [...invoiceData.conceptos];
            newConcepts[existingIdx].Cantidad += 1;
            setInvoiceData({ ...invoiceData, conceptos: newConcepts });
        } else {
            const newConcept = {
                productExternalId: productId,
                ClaveProdServ: product.clavePS || '01010101',
                Cantidad: 1,
                ClaveUnidad: product.claveUnity || 'H87',
                Unidad: product.unity || 'Pieza',
                ValorUnitario: product.price || 0,
                Descripcion: product.name,
                ObjetoImp: '02'
            };
            setInvoiceData({ ...invoiceData, conceptos: [...invoiceData.conceptos, newConcept] });
        }
    };

    const updateConceptQty = (idx, delta) => {
        const newConcepts = [...invoiceData.conceptos];
        newConcepts[idx].Cantidad = Math.max(1, newConcepts[idx].Cantidad + delta);
        setInvoiceData({ ...invoiceData, conceptos: newConcepts });
    };

    const handleEmitInvoice = async () => {
        if (!hasPermission('invoices', 'create')) {
            alert('No tienes permiso para emitir facturas.');
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '', detail: '' });
        try {
            const payload = {
                ...invoiceData,
                globalInfo: invoiceType === 'global' ? globalInfo : undefined
            };
            await api.post('/invoices/create', payload);
            setStep(3);
        } catch (err) {
            const errorData = err.response?.data;
            setMessage({ 
                type: 'error', 
                text: errorData?.error || 'Error al emitir la factura.',
                detail: errorData?.details?.Message || ''
            });
        } finally {
            setLoading(false);
        }
    };

    const totals = invoiceData.conceptos.reduce((acc, c) => {
        const sub = (c.Cantidad || 0) * (c.ValorUnitario || 0);
        return {
            subtotal: acc.subtotal + sub,
            iva: acc.iva + (sub * 0.16)
        };
    }, { subtotal: 0, iva: 0 });

    if (!hasPermission('invoices', 'view')) {
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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Steps Indicator */}
            <div className="flex justify-center items-center space-x-4 mb-10">
                {[0, 1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>{s + 1}</div>
                        {s < 3 && <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`}></div>}
                    </div>
                ))}
            </div>

            {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { id: 'ticket', title: 'Facturar Ticket', desc: 'Convierte una nota de venta existente en factura.', icon: Ticket, color: 'blue' },
                        { id: 'libre', title: 'Factura Libre', desc: 'Crea una factura desde cero añadiendo conceptos.', icon: FileEdit, color: 'indigo' },
                        { id: 'global', title: 'Factura Global', desc: 'Genera el comprobante de ventas al público en general.', icon: Globe, color: 'emerald' }
                    ].map((t) => (
                        <button key={t.id} onClick={() => handleSelectType(t.id)} className="group bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 text-left relative overflow-hidden">
                            <div className={`absolute -right-8 -top-8 w-32 h-32 bg-${t.color}-50 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                            <div className={`w-16 h-16 bg-${t.color}-50 text-${t.color}-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-${t.color}-600 group-hover:text-white transition-all duration-500 shadow-sm`}><t.icon size={32} /></div>
                            <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tight">{t.title}</h3>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed">{t.desc}</p>
                            <div className="mt-8 flex items-center text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"><span>Comenzar ahora</span><ChevronRight size={14} className="ml-1" /></div>
                        </button>
                    ))}
                </div>
            )}

            {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Buscador Dinámico */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            {invoiceType === 'ticket' ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar Folio de Ticket</label>
                                    <div className="flex space-x-3">
                                        <div className="relative flex-1"><Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Ej: F-12345" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" value={folioSearch} onChange={(e) => setFolioSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchTicket()} /></div>
                                        <button onClick={searchTicket} disabled={loading} className="px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center space-x-2">{loading ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}<span>Buscar</span></button>
                                    </div>
                                </div>
                            ) : invoiceType === 'global' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodicidad</label><select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={globalInfo.Periodicidad} onChange={(e) => setGlobalInfo({...globalInfo, Periodicidad: e.target.value})}>{periodicidades.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mes</label><select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={globalInfo.Meses} onChange={(e) => setGlobalInfo({...globalInfo, Meses: e.target.value})}>{mesesSujetos.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Año</label><input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={globalInfo.Año} onChange={(e) => setGlobalInfo({...globalInfo, Año: e.target.value})} /></div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rango de Ventas</label><div className="flex items-center space-x-3"><div className="relative flex-1"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="date" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} /></div><div className="relative flex-1"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="date" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} /></div><button onClick={fetchTicketsByRange} disabled={loading} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center space-x-2">{loading ? <RefreshCw className="animate-spin" size={16} /> : <ShoppingCart size={16} />}<span>Traer Ventas</span></button></div></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Añadir Productos</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar producto..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); const term = e.target.value.toLowerCase(); setSearchResults(term ? products.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)) : []); }} />{searchResults.length > 0 && <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto">{searchResults.map(p => <button key={p._id} onClick={() => { addManualConcept(p); setSearchResults([]); setProductSearch(''); }} className="w-full p-4 text-left hover:bg-slate-50 flex justify-between items-center border-b border-slate-50 last:border-0"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Package size={16}/></div><div><p className="text-sm font-bold text-slate-800">{p.name}</p><p className="text-[10px] font-black text-slate-400 uppercase">{p.code}</p></div></div><span className="font-black text-blue-600">${p.price}</span></button>)}</div>}</div></div>
                                    <div className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Cliente</label><div className="relative"><Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar cliente por RFC o Nombre..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={clientSearch} onChange={(e) => { setClientSearch(e.target.value); const term = e.target.value.toLowerCase(); setClientResults(term ? clients.filter(c => c.razons.toLowerCase().includes(term) || c.rfc.toLowerCase().includes(term)) : []); }} />{clientResults.length > 0 && <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto">{clientResults.map(c => <button key={c._id} onClick={() => { selectClient(c); setClientResults([]); }} className="w-full p-4 text-left hover:bg-slate-50 flex justify-between items-center border-b border-slate-50 last:border-0"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><User size={16}/></div><div><p className="text-sm font-bold text-slate-800">{c.razons}</p><p className="text-[10px] font-black text-slate-400 uppercase">{c.rfc}</p></div></div><ChevronRight size={16} className="text-slate-300"/></button>)}</div>}</div></div>
                                </div>
                            )}
                        </div>

                        {message.text && (
                            <div className={`p-6 rounded-[2rem] flex items-center space-x-4 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                <div className="flex-1"><p className="font-bold text-sm">{message.text}</p>{message.detail && <p className="text-[10px] font-medium opacity-80 mt-1">{message.detail}</p>}</div>
                                <button onClick={() => setMessage({type:'', text:''})}><X size={18}/></button>
                            </div>
                        )}

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Conceptos de la Factura</h2>
                            <div className="space-y-4">
                                {invoiceData.conceptos.length > 0 ? (
                                    invoiceData.conceptos.map((c, idx) => (
                                        <div key={idx} className="group flex justify-between items-center p-6 bg-slate-50 border border-transparent hover:border-slate-200 rounded-[2rem] transition-all duration-300">
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center bg-white rounded-xl border border-slate-100 overflow-hidden">
                                                    <button onClick={() => updateConceptQty(idx, -1)} className="p-2 hover:bg-slate-50 text-slate-400"><Minus size={14}/></button>
                                                    <div className="px-4 py-2 font-black text-slate-800 border-x border-slate-100">{c.Cantidad}</div>
                                                    <button onClick={() => updateConceptQty(idx, 1)} className="p-2 hover:bg-slate-50 text-slate-400"><Plus size={14}/></button>
                                                </div>
                                                <div><p className="font-bold text-slate-800">{c.Descripcion}</p><div className="flex items-center space-x-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1"><span>SAT: {c.ClaveProdServ}</span><span>Unidad: {c.ClaveUnidad}</span></div></div>
                                            </div>
                                            <div className="flex items-center space-x-8">
                                                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p><p className="font-black text-slate-900">${((c.Cantidad || 0) * (c.ValorUnitario || 0)).toFixed(2)}</p></div>
                                                <button onClick={() => { const nc = [...invoiceData.conceptos]; nc.splice(idx, 1); setInvoiceData({...invoiceData, conceptos: nc}); }} className="p-3 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl shadow-sm transition-all"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]"><Package size={48} className="mx-auto text-slate-100 mb-4" /><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay conceptos añadidos</p></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar de Resumen */}
                    <div className="space-y-6 h-fit sticky top-8">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60 flex items-center"><User size={14} className="mr-2" /> Receptor</h3>
                            {(invoiceData.receptorUID || invoiceType === 'global') ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md"><p className="text-sm font-black truncate mb-1">{invoiceData.clientName}</p><p className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">{invoiceData.clientRfc}</p></div>
                                    <div className="pt-6 border-t border-white/10 space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"><span>IVA (16%)</span><span>${totals.iva.toFixed(2)}</span></div>
                                        <div className="flex justify-between items-center pt-6 border-t border-white/10"><span className="text-xs font-black uppercase text-blue-400 tracking-widest">Total MXN</span><span className="text-3xl font-black tracking-tighter">${(totals.subtotal + totals.iva).toFixed(2)}</span></div>
                                    </div>
                                    <button onClick={() => setStep(2)} disabled={invoiceData.conceptos.length === 0 || (!invoiceData.receptorUID && invoiceType !== 'global')} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none">Siguiente Paso</button>
                                    <button onClick={() => setStep(0)} className="w-full py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cambiar Tipo de Factura</button>
                                </div>
                            ) : (
                                <div className="text-center py-10 space-y-4"><AlertCircle className="mx-auto text-slate-700" size={32} /><p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest leading-relaxed">{invoiceType === 'ticket' ? 'Añade un ticket para identificar al cliente' : 'Busca y selecciona un cliente'}</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 max-w-4xl mx-auto space-y-10">
                    <div className="text-center space-y-2"><h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Configuración Fiscal</h2><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Finaliza los detalles del CFDI 4.0</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Uso de CFDI</label>
                            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all" value={invoiceData.usoCFDI} onChange={(e) => setInvoiceData({...invoiceData, usoCFDI: e.target.value})}>
                                <option value="G01">G01 - Adquisición de mercancías</option>
                                <option value="G03">G03 - Gastos en general</option>
                                <option value="S01">S01 - Sin efectos fiscales</option>
                                <option value="CP01">CP01 - Pagos</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Forma de Pago</label>
                            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all" value={invoiceData.formaPago} onChange={(e) => setInvoiceData({...invoiceData, formaPago: e.target.value})}>
                                <option value="01">01 - Efectivo</option>
                                <option value="03">03 - Transferencia electrónica</option>
                                <option value="04">04 - Tarjeta de crédito</option>
                                <option value="28">28 - Tarjeta de débito</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pago</label>
                            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all" value={invoiceData.metodoPago} onChange={(e) => setInvoiceData({...invoiceData, metodoPago: e.target.value})}>
                                <option value="PUE">PUE - Pago en una sola exhibición</option>
                                <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                        <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Regresar a Conceptos</button>
                        <button onClick={handleEmitInvoice} disabled={loading} className="flex-[2] py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-xl shadow-blue-200 transition-all flex items-center justify-center space-x-3">{loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}<span>{loading ? 'Timbrando...' : 'Emitir Factura'}</span></button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-20 space-y-8 animate-in zoom-in duration-500"><div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20"><CheckCircle2 size={64} /></div><div className="space-y-2"><h2 className="text-4xl font-black text-slate-800 tracking-tight">¡Factura Emitida!</h2><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">El documento ha sido timbrado con éxito</p></div><button onClick={() => window.location.reload()} className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl transition-all transform hover:-translate-y-1">Nueva Factura</button></div>
            )}
        </div>
    );
};

export default InvoiceSection;

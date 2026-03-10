import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    FileText, Search, Download, Calendar, User, 
    RefreshCw, ChevronLeft, ChevronRight, FileCode,
    Filter, AlertCircle, ExternalLink, Mail, Trash2, X, Eye, Archive, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InvoiceListSection = () => {
    const { hasPermission } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingUid, setProcessingUid] = useState(null);
    const [filters, setFilters] = useState({
        month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
        year: new Date().getFullYear().toString(),
        searchTerm: '', // Para buscar por RFC o razón social
        page: 1
    });
    const [pagination, setPagination] = useState({
        total: 0,
        last_page: 1
    });
    const [activeCompanyName, setActiveCompanyName] = useState('');
    const [allInvoices, setAllInvoices] = useState([]); // Guardar todas las facturas

    // Estado para Cancelación
    const [cancelModal, setCancelModal] = useState({ open: false, uid: null, motivo: '02', sustitucion: '' });
    
    // Estados para Email
    const [pdfSource, setPdfSource] = useState('api');
    const [emailModal, setEmailModal] = useState({ open: false, uid: null, email: '' });

    // Cargar empresa activa, pdfSource y facturas al montar
    useEffect(() => {
        const loadData = async () => {
            try {
                const configRes = await api.get('/config');
                const config = configRes.data;
                
                // Cargar pdfSource
                setPdfSource(config.pdfSource || 'api');
                console.log(`[Frontend] Modo de PDF: ${config.pdfSource || 'api'}`);
                
                // Cargar empresa activa
                if (config?.connectionType === 'company' && config?.activeCompanyId) {
                    const companiesRes = await api.get('/companies/credentials');
                    const activeCompany = (companiesRes.data || []).find(c => c._id === config.activeCompanyId);
                    
                    if (activeCompany) {
                        setActiveCompanyName(activeCompany.razons);
                        fetchInvoicesForCompany(activeCompany._id);
                    }
                } else if (config?.connectionType === 'master') {
                    setActiveCompanyName('API Maestra');
                    fetchInvoicesForCompany(null);
                }
            } catch (err) {
                console.error('Error al cargar datos:', err);
            }
        };
        loadData();
    }, []);

    const loadActiveCompanyAndInvoices = async () => {
        // Esta función ahora está integrada en el useEffect principal
    };

    const fetchInvoicesForCompany = async (companyId) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                month: filters.month,
                year: filters.year,
                page: filters.page,
                companyId: companyId || '' // null para maestro, id para empresa
            }).toString();
            
            const res = await api.post(`/invoices/list?${queryParams}`);
            setAllInvoices(res.data.data || []);
            setPagination({
                total: res.data.total,
                last_page: res.data.last_page
            });
        } catch (err) {
            console.error(err);
            setAllInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar facturas localmente por RFC o razón social
    const filteredInvoices = allInvoices.filter(inv => {
        if (!filters.searchTerm) return true;
        const searchLower = filters.searchTerm.toLowerCase();
        return (
            (inv.Receptor && inv.Receptor.toLowerCase().includes(searchLower)) ||
            (inv.RazonSocialReceptor && inv.RazonSocialReceptor.toLowerCase().includes(searchLower))
        );
    });

    useEffect(() => {
        if (activeCompanyName) {
            // Obtener companyId de la configuración
            loadActiveCompanyAndInvoices();
        }
    }, [filters.month, filters.year, filters.page]);

    const handleDownload = async (uid, type) => {
        try {
            const response = await api.get(`/invoices/download/${uid}/${type}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura_${uid}.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert(`Error al descargar el archivo ${type.toUpperCase()}`);
        }
    };

    const handleDownloadZip = async (uid) => {
        try {
            const response = await api.get(`/invoices/download-zip/${uid}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura_${uid}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al descargar el archivo ZIP');
        }
    };

    const handleViewPdf = async (uid) => {
        try {
            const response = await api.get(`/invoices/download/${uid}/pdf`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (err) {
            alert('Error al abrir el PDF');
        }
    };

    const handleSendEmail = async (uid) => {
        console.log(`[Frontend] handleSendEmail llamado - pdfSource: ${pdfSource}, uid: ${uid}`);
        
        // Si es modo API, enviar directo usando GET
        if (pdfSource !== 'local') {
            console.log(`[Frontend] Modo API detectado - enviando directo con GET`);
            setProcessingUid(uid);
            try {
                const res = await api.get(`/invoices/send-email/${uid}`);
                alert(res.data.message || 'Factura enviada exitosamente');
            } catch (err) {
                console.error(`[Frontend] Error en modo API:`, err);
                alert(err.response?.data?.error || 'Error al enviar la factura');
            } finally {
                setProcessingUid(null);
            }
            return;
        }

        // Si es modo LOCAL, abrir modal para pedir email
        console.log(`[Frontend] Modo Local detectado - abriendo modal`);
        setEmailModal({ open: true, uid: uid, email: '' });
    };

    const handleSendEmailLocal = async () => {
        console.log(`[Frontend Local] Email modal state:`, emailModal);
        
        if (!emailModal.email || emailModal.email.trim() === '') {
            console.error(`[Frontend Local] Email vacío o no válido`);
            alert('Por favor ingresa un correo electrónico válido');
            return;
        }

        console.log(`[Frontend Local] Enviando email a: ${emailModal.email} para factura: ${emailModal.uid}`);
        setProcessingUid(emailModal.uid);
        
        try {
            const emailLimpio = emailModal.email.trim();
            console.log(`[Frontend Local] Enviando POST con email en body:`, emailLimpio);
            
            const res = await api.post(`/invoices/send-email/${emailModal.uid}`, {
                emailDestinatario: emailLimpio
            });
            console.log(`[Frontend Local] Respuesta del servidor:`, res.data);
            alert(res.data.message || 'Correo enviado con exito');
            setEmailModal({ open: false, uid: null, email: '' });
        } catch (err) {
            console.error(`[Frontend Local] Error al enviar:`, err);
            alert(err.response?.data?.error || err.response?.data?.details || 'Error al enviar el correo');
        } finally {
            setProcessingUid(null);
        }
    };

    const handleCancelInvoice = async () => {
        if (!hasPermission('invoiceList', 'delete')) {
            alert('No tienes permiso para cancelar facturas.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post(`/invoices/cancel/${cancelModal.uid}`, {
                motivo: cancelModal.motivo,
                sustitucion: cancelModal.sustitucion
            });
            alert(res.data.message || 'Solicitud de cancelación enviada');
            setCancelModal({ open: false, uid: null, motivo: '02', sustitucion: '' });
            loadActiveCompanyAndInvoices();
        } catch (err) {
            alert(err.response?.data?.details?.message || 'Error al cancelar la factura');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // El filtro se aplica localmente, no necesita recargar
    };

    if (!hasPermission('invoiceList', 'view')) {
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Filtros */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Listado de Facturas</h2>
                            <p className="text-xs text-slate-400 font-bold">
                                {activeCompanyName ? `Empresa: ${activeCompanyName}` : 'Configura una empresa activa en Administración'}
                            </p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <select 
                                className="bg-transparent px-4 py-2 text-xs font-black uppercase text-slate-600 outline-none"
                                value={filters.month}
                                onChange={(e) => setFilters({...filters, month: e.target.value, page: 1})}
                            >
                                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                    <option key={m} value={m}>{new Date(2000, parseInt(m)-1).toLocaleString('es', {month: 'short'})}</option>
                                ))}
                            </select>
                            <select 
                                className="bg-transparent px-4 py-2 text-xs font-black uppercase text-slate-600 outline-none border-l border-slate-200"
                                value={filters.year}
                                onChange={(e) => setFilters({...filters, year: e.target.value, page: 1})}
                            >
                                {['2023','2024','2025','2026'].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar por RFC o razón social..."
                                className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all w-56"
                                value={filters.searchTerm}
                                onChange={(e) => setFilters({...filters, searchTerm: e.target.value.toUpperCase()})}
                            />
                        </div>
                        <button type="submit" className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
                            <Filter size={20} />
                        </button>
                    </form>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Folio / Fecha</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receptor</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Consultando SAT...</p>
                                    </td>
                                </tr>
                            ) : !activeCompanyName ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <AlertCircle className="text-amber-500 mx-auto mb-4" size={32} />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            Configura una empresa activa en <strong>Administración → Entorno y Credenciales API</strong>
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                                <tr key={inv.UID} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800">{inv.Folio || 'S/F'}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{inv.FechaTimbrado}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{inv.RazonSocialReceptor}</span>
                                            <span className="text-[10px] font-black text-blue-500 uppercase">{inv.Receptor}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-black text-slate-800">${parseFloat(inv.Total).toFixed(2)}</span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.Status === 'enviada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {inv.Status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button 
                                                onClick={() => handleViewPdf(inv.UID)}
                                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                title="Ver PDF"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDownload(inv.UID, 'xml')}
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Descargar XML"
                                            >
                                                <FileCode size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadZip(inv.UID)}
                                                className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                title="Descargar ZIP"
                                            >
                                                <Archive size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleSendEmail(inv.UID)}
                                                disabled={processingUid === inv.UID}
                                                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                title="Enviar por Correo"
                                            >
                                                {processingUid === inv.UID ? <RefreshCw className="animate-spin" size={18} /> : <Mail size={18} />}
                                            </button>
                                            {hasPermission('invoiceList', 'delete') && inv.Status !== 'cancelada' && (
                                                <button 
                                                    onClick={() => setCancelModal({ open: true, uid: inv.UID, motivo: '02', sustitucion: '' })}
                                                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    title="Cancelar Factura"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <Archive className="mx-auto text-slate-100 mb-4" size={48} />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {filters.searchTerm ? 'No se encontraron facturas con ese criterio' : 'No se encontraron facturas'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {pagination.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página {filters.page} de {pagination.last_page}</p>
                        <div className="flex space-x-2">
                            <button 
                                disabled={filters.page === 1}
                                onClick={() => setFilters({...filters, page: filters.page - 1})}
                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters({...filters, page: filters.page + 1})}
                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Cancelación */}
            {cancelModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cancelar Factura</h3>
                            <button onClick={() => setCancelModal({ open: false, uid: null, motivo: '02', sustitucion: '' })}><X size={24} className="text-slate-400" /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo de Cancelación</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                    value={cancelModal.motivo}
                                    onChange={(e) => setCancelModal({...cancelModal, motivo: e.target.value})}
                                >
                                    <option value="01">01 - Comprobante emitido con errores con relación</option>
                                    <option value="02">02 - Comprobante emitido con errores sin relación</option>
                                    <option value="03">03 - No se llevó a cabo la operación</option>
                                    <option value="04">04 - Operación nominativa relacionada en la factura global</option>
                                </select>
                            </div>

                            {cancelModal.motivo === '01' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UUID Sustitución</label>
                                    <input 
                                        type="text"
                                        placeholder="Ingrese el UUID de la factura que sustituye"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                        value={cancelModal.sustitucion}
                                        onChange={(e) => setCancelModal({...cancelModal, sustitucion: e.target.value})}
                                    />
                                </div>
                            )}

                            <button 
                                onClick={handleCancelInvoice}
                                disabled={loading}
                                className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Cancelando...' : 'Solicitar Cancelación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Envío de Email (Solo Local) */}
            {emailModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Enviar Factura (ZIP)</h3>
                            <button onClick={() => setEmailModal({ open: false, uid: null, email: '' })}><X size={24} className="text-slate-400" /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo del Destinatario</label>
                                <input 
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
                                    value={emailModal.email}
                                    onChange={(e) => {
                                        console.log(`[Frontend] Email input cambió a: ${e.target.value}`);
                                        setEmailModal({...emailModal, email: e.target.value});
                                    }}
                                    autoFocus
                                />
                            </div>

                            <button 
                                onClick={handleSendEmailLocal}
                                disabled={processingUid === emailModal.uid}
                                className="w-full p-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                                {processingUid === emailModal.uid ? 'Enviando...' : 'Enviar por Correo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceListSection;

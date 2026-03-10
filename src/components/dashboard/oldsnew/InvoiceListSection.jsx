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
        rfc: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        total: 0,
        last_page: 1
    });

    // Estado para Cancelación
    const [cancelModal, setCancelModal] = useState({ open: false, uid: null, motivo: '02', sustitucion: '' });

    useEffect(() => {
        fetchInvoices();
    }, [filters.page]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await api.post(`/invoices/list?${queryParams}`);
            setInvoices(res.data.data || []);
            setPagination({
                total: res.data.total,
                last_page: res.data.last_page
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
        setProcessingUid(uid);
        try {
            const res = await api.get(`/invoices/send-email/${uid}`);
            alert(res.data.message || 'Correo enviado con éxito');
        } catch (err) {
            alert('Error al enviar el correo');
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
            fetchInvoices();
        } catch (err) {
            alert(err.response?.data?.details?.message || 'Error al cancelar la factura');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchInvoices();
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
                            <p className="text-xs text-slate-400 font-bold">Consulta, descarga y gestiona tus CFDI 4.0</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <select 
                                className="bg-transparent px-4 py-2 text-xs font-black uppercase text-slate-600 outline-none"
                                value={filters.month}
                                onChange={(e) => setFilters({...filters, month: e.target.value})}
                            >
                                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                                    <option key={m} value={m}>{new Date(2000, parseInt(m)-1).toLocaleString('es', {month: 'short'})}</option>
                                ))}
                            </select>
                            <select 
                                className="bg-transparent px-4 py-2 text-xs font-black uppercase text-slate-600 outline-none border-l border-slate-200"
                                value={filters.year}
                                onChange={(e) => setFilters({...filters, year: e.target.value})}
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
                                placeholder="RFC Receptor..."
                                className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all w-48"
                                value={filters.rfc}
                                onChange={(e) => setFilters({...filters, rfc: e.target.value.toUpperCase()})}
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
                            ) : invoices.length > 0 ? invoices.map((inv) => (
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
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No se encontraron facturas</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
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

                            <div className="bg-rose-50 p-6 rounded-2xl flex items-start space-x-4">
                                <AlertCircle className="text-rose-500 shrink-0" size={20} />
                                <p className="text-[10px] font-bold text-rose-700 leading-relaxed uppercase">Esta acción enviará una solicitud al SAT. El proceso puede demorar y requiere la aprobación del receptor en algunos casos.</p>
                            </div>

                            <button 
                                onClick={handleCancelInvoice}
                                disabled={loading}
                                className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all flex items-center justify-center space-x-3"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                <span>{loading ? 'Procesando...' : 'Confirmar Cancelación'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceListSection;

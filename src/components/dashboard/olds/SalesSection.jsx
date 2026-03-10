import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { 
    Search, Calendar, User, Hash, DollarSign, 
    Eye, Trash2, Printer, X, AlertCircle, 
    RefreshCw, CheckCircle2, UserPlus, Filter,
    ChevronRight, MoreVertical, Edit3, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SalesSection = () => {
    const { hasPermission } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Estados para edición de cliente
    const [showEditClientModal, setShowEditClientModal] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [clientResults, setClientResults] = useState([]);
    const [isSearchingClients, setIsSearchingClients] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sales');
            setSales(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch (err) {
            console.error('Error al cargar ventas:', err);
            setError('No se pudo cargar el historial de ventas.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!hasPermission('sales', 'delete')) {
            alert('No tienes permiso para eliminar ventas.');
            return;
        }
        if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;
        try {
            await api.delete(`/sales/${id}`);
            setSales(sales.filter(s => s._id !== id));
        } catch (err) {
            alert('Error al eliminar la venta');
        }
    };

    const handlePrint = (sale) => {
        const win = window.open('', '', 'width=400,height=600');
        win.document.write(`
            <html>
                <head>
                    <title>Ticket ${sale.folio}</title>
                    <style>
                        body { font-family: monospace; padding: 20px; width: 300px; font-size: 12px; }
                        .text-center { text-align: center; }
                        .flex-between { display: flex; justify-content: space-between; }
                        hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
                        .bold { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <h2 style="margin:0">TICKET DE VENTA</h2>
                        <p style="margin:5px 0">${new Date(sale.createdAt).toLocaleString()}</p>
                        <p class="bold">Folio: ${sale.folio}</p>
                    </div>
                    <hr>
                    <p class="bold">CLIENTE:</p>
                    <p>${sale.clientName}</p>
                    <p>${sale.clientRfc}</p>
                    <hr>
                    <div class="bold flex-between">
                        <span>Cant. Concepto</span>
                        <span>Total</span>
                    </div>
                    ${sale.items.map(item => `
                        <div class="flex-between">
                            <span>${item.quantity} x ${item.name.substring(0, 20)}</span>
                            <span>$${item.total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <hr>
                    <div class="flex-between bold"><span>Subtotal:</span><span>$${sale.subtotal.toFixed(2)}</span></div>
                    <div class="flex-between bold"><span>IVA (16%):</span><span>$${sale.tax.toFixed(2)}</span></div>
                    <div class="flex-between bold" style="font-size:14px"><span>TOTAL:</span><span>$${sale.total.toFixed(2)}</span></div>
                    <hr>
                    <p class="text-center">¡Gracias por su compra!</p>
                </body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 250);
    };

    // Búsqueda de clientes filtrada vía API
    const handleClientSearch = (term) => {
        setClientSearch(term);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (term.length < 3) {
            setClientResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearchingClients(true);
            try {
                // Pasamos el parámetro search que el controlador usará como keyword
                const res = await api.get(`/clients?search=${encodeURIComponent(term)}`);
                // factura devuelve una lista de clientes filtrados
                const results = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setClientResults(results);
            } catch (err) {
                console.error('Error buscando clientes:', err);
            } finally {
                setIsSearchingClients(false);
            }
        }, 500);
    };

    const updateClient = async (client) => {
        if (!hasPermission('sales', 'edit')) {
            alert('No tienes permiso para editar ventas.');
            return;
        }
        try {
            // Aseguramos que los nombres de los campos coincidan con lo que espera el Backend y MongoDB
            // factura usa UID para el ID externo
            const payload = {
                clientExternalId: client._id || client.UID || client.Id,
                clientName: client.razons || client.RazonSocial || client.Name || client.name,
                clientRfc: client.rfc || client.RFC
            };

            if (!payload.clientExternalId) {
                alert('Error: El cliente seleccionado no tiene un ID válido de la API.');
                return;
            }

            const res = await api.put(`/sales/${selectedSale._id}/client`, payload);
            
            setSales(sales.map(s => s._id === selectedSale._id ? res.data : s));
            setShowEditClientModal(false);
            setClientSearch('');
            setClientResults([]);
            alert('Cliente actualizado correctamente');
        } catch (err) {
            console.error('Error al actualizar cliente:', err.response?.data || err.message);
            alert('Error al actualizar el cliente: ' + (err.response?.data?.error || err.message));
        }
    };

    const filteredSales = sales.filter(s => 
        (s.folio || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.clientRfc || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!hasPermission('sales', 'view')) {
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header con Buscador */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historial de Ventas</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gestión de tickets y notas de venta</p>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por folio, cliente o RFC..." 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <RefreshCw className="animate-spin text-slate-300" size={48} />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Cargando historial...</p>
                </div>
            ) : error ? (
                <div className="bg-rose-50 p-10 rounded-[2.5rem] border border-rose-100 text-center space-y-4">
                    <AlertCircle className="mx-auto text-rose-500" size={48} />
                    <p className="text-rose-700 font-bold">{error}</p>
                    <button onClick={fetchSales} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Reintentar</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredSales.length > 0 ? filteredSales.map((sale) => (
                        <div key={sale._id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors duration-500">
                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-500 uppercase">Folio</span>
                                    <span className="text-sm font-black text-slate-800 group-hover:text-white">{sale.folio}</span>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <p className="font-black text-slate-800 text-lg group-hover:text-slate-900">{sale.clientName}</p>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                            (sale.status || '').toLowerCase() === 'facturada' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {sale.status || 'Completada'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
                                        <span className="flex items-center"><Hash size={12} className="mr-1"/> {sale.clientRfc}</span>
                                        <span className="flex items-center"><Calendar size={12} className="mr-1"/> {new Date(sale.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Venta</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">${sale.total.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => { setSelectedSale(sale); setShowDetailModal(true); }}
                                        className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                        title="Ver Detalles"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handlePrint(sale)}
                                        className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                        title="Reimprimir Ticket"
                                    >
                                        <Printer size={20} />
                                    </button>
                                    {hasPermission('sales', 'edit') && (
                                        <button 
                                            onClick={() => { setSelectedSale(sale); setShowEditClientModal(true); }}
                                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                            title="Editar Cliente"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                    )}
                                    {hasPermission('sales', 'delete') && (
                                        <button 
                                            onClick={() => handleDelete(sale._id)}
                                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white py-32 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Calendar size={40} />
                            </div>
                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-xs">No se encontraron ventas</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Detalles */}
            {showDetailModal && selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Detalle de Venta</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Folio: {selectedSale.folio}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white rounded-full transition-all"><X size={24}/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cliente</p>
                                    <p className="font-bold text-slate-800">{selectedSale.clientName}</p>
                                    <p className="text-xs font-bold text-slate-400">{selectedSale.clientRfc}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fecha y Hora</p>
                                    <p className="font-bold text-slate-800">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Conceptos</p>
                                <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100/50 text-[10px] font-black uppercase text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3">Cant</th>
                                                <th className="px-4 py-3">Descripción</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedSale.items.map((item, idx) => (
                                                <tr key={idx} className="font-bold text-slate-600">
                                                    <td className="px-4 py-3">{item.quantity}</td>
                                                    <td className="px-4 py-3">{item.name}</td>
                                                    <td className="px-4 py-3 text-right">${item.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <div className="w-48 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400"><span>Subtotal</span><span>${selectedSale.subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400"><span>IVA (16%)</span><span>${selectedSale.tax.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-100 pt-2"><span>TOTAL</span><span>${selectedSale.total.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Cliente */}
            {showEditClientModal && selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Actualizar Cliente</h3>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Venta Folio: {selectedSale.folio}</p>
                            </div>
                            <button onClick={() => setShowEditClientModal(false)} className="p-2 hover:bg-white rounded-full transition-all"><X size={24}/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar nuevo cliente</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Nombre o RFC (mín. 3 letras)..." 
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                        value={clientSearch}
                                        onChange={(e) => handleClientSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                {isSearchingClients ? (
                                    <div className="flex items-center justify-center py-10 space-x-3">
                                        <RefreshCw className="animate-spin text-indigo-500" size={20} />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Buscando...</span>
                                    </div>
                                ) : clientResults.length > 0 ? clientResults.map((client) => (
                                    <button 
                                        key={client._id || client.UID || client.Id}
                                        onClick={() => updateClient(client)}
                                        className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                                    >
                                        <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600">{client.razons || client.RazonSocial || client.Name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.rfc || client.RFC}</p>
                                    </button>
                                )) : clientSearch.length >= 3 ? (
                                    <p className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest">No se encontraron resultados</p>
                                ) : (
                                    <div className="text-center py-10 space-y-2">
                                        <UserPlus className="mx-auto text-slate-200" size={32} />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Escribe para buscar en factura</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesSection;

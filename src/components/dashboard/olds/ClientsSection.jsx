import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, UserPlus, Edit2, Trash2, X, Mail, Phone, MapPin, Plus, RefreshCw, AlertCircle, ExternalLink, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientsSection = () => {
    const { hasPermission } = useAuth();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClientId, setCurrentClientId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Catálogos
    const [regimenes, setRegimenes] = useState([]);
    const [usosCfdi, setUsosCfdi] = useState([]);
   

    const initialFormState = {
        rfc: '', razons: '', codpos: '', email: '', usocfdi: '', regimen: '',
        calle: '', numero_exterior: '', numero_interior: '', colonia: '',
        ciudad: '', delegacion: '', localidad: '', estado: '', pais: 'MEX',
        numregidtrib: '', nombre: '', apellidos: '', telefono: '',
        email2: '', email3: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        const init = async () => {
            await fetchCatalogs();
            await fetchClients();
        };
        init();
    }, []);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/clients');
            const data = Array.isArray(res.data) ? res.data : [];
            setClients(data);
        } catch (err) {
            console.error('Error al cargar clientes:', err);
            setMessage({ 
                text: err.response?.data?.error || 'Error al conectar con la API externa.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCatalogs = async () => {
        try {
            const [regRes, usoRes] = await Promise.all([
                api.get('/catalogs/regimenes'),
                api.get('/catalogs/usocfdi'),
            ]);
            setRegimenes(Array.isArray(regRes.data) ? regRes.data : []);
            setUsosCfdi(Array.isArray(usoRes.data) ? usoRes.data : []);
        } catch (err) {
            console.error('Error al cargar catálogos:', err);
        }
    };


    const filteredClients = clients.filter(c => 
        (c.razons || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.rfc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        if (!hasPermission('clients', 'create')) {
            alert('No tienes permiso para registrar clientes.');
            return;
        }
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        if (!hasPermission('clients', 'edit')) {
            alert('No tienes permiso para editar clientes.');
            return;
        }
        setFormData({
            ...initialFormState,
            ...client
        });
        setCurrentClientId(client._id); 
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!hasPermission('clients', 'delete')) {
            alert('No tienes permiso para eliminar clientes.');
            return;
        }
        if (!id) {
            setMessage({ text: 'Error: ID de cliente no encontrado.', type: 'error' });
            return;
        }
        if (window.confirm('¿Está seguro de eliminar este cliente permanentemente?')) {
            try {
                await api.delete(`/clients/${id}`);
                setMessage({ text: 'Cliente eliminado exitosamente.', type: 'success' });
                fetchClients();
            } catch (err) {
                setMessage({ text: err.response?.data?.error || 'Error al eliminar cliente', type: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                if (!hasPermission('clients', 'edit')) return;
                if (!currentClientId) throw new Error('ID de cliente no encontrado para actualizar.');
                await api.put(`/clients/${currentClientId}`, formData);
                setMessage({ text: 'Cliente actualizado exitosamente.', type: 'success' });
            } else {
                if (!hasPermission('clients', 'create')) return;
                await api.post('/clients', formData);
                setMessage({ text: 'Cliente registrado exitosamente.', type: 'success' });
            }
            setIsModalOpen(false);
            fetchClients();
        } catch (err) {
            setMessage({ text: err.response?.data?.error || err.message || 'Error en la operación', type: 'error' });
        }
    };

    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium";
    const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1";

    if (!hasPermission('clients', 'view')) {
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
            {/* Header Pro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                        Gestión de Clientes
                        <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">API Live</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Sincronizado con catálogos oficiales del SAT.</p>
                </div>
                {hasPermission('clients', 'create') && (
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Añadir Nuevo Cliente</span>
                    </button>
                )}
            </div>

            {/* Buscador */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Filtrar por nombre, RFC o razón social..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                </div>
                <button onClick={fetchClients} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl border flex justify-between items-center animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    <div className="flex items-center space-x-3">
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({text:'', type:''})} className="p-1 hover:bg-white/50 rounded-full transition-all"><X size={16}/></button>
                </div>
            )}

            {/* Listado de Clientes */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <RefreshCw className="animate-spin text-indigo-600" size={48} />
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Obteniendo datos de la API...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients.length > 0 ? filteredClients.map(client => (
                        <div key={client._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-100">
                                    {(client.razons || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex space-x-2">
                                    {hasPermission('clients', 'edit') && (
                                        <button onClick={() => openEditModal(client)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                    )}
                                    {hasPermission('clients', 'delete') && (
                                        <button onClick={() => handleDelete(client._id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    )}
                                </div>
                            </div>
                            <h3 className="font-black text-slate-800 text-lg leading-tight mb-1 truncate">{client.razons}</h3>
                            <p className="text-[10px] font-black text-indigo-600 mb-4 tracking-wider">{client.rfc}</p>
                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex items-center text-xs text-slate-500 font-bold"><Mail size={14} className="mr-3 text-slate-400"/> {client.email || 'Sin correo'}</div>
                                <div className="flex items-center text-xs text-slate-500 font-bold"><Phone size={14} className="mr-3 text-slate-400"/> {client.telefono || 'Sin teléfono'}</div>
                                <div className="flex items-center text-xs text-slate-500 font-bold truncate"><MapPin size={14} className="mr-3 text-slate-400"/> {client.ciudad}, {client.estado}</div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={32} />
                            </div>
                            <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest">No se encontraron clientes</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Registro/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? 'Actualizar Cliente' : 'Nuevo Cliente Fiscal'}</h2>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Cumplimiento con CFDI 4.0</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={28}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Datos de Identificación</h3>
                                    <div className="space-y-2">
                                        <label className={labelClass}>RFC (Obligatorio)</label>
                                        <input type="text" className={inputClass} value={formData.rfc} onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})} placeholder="XAXX010101000" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Razón Social / Nombre Completo</label>
                                        <input type="text" className={inputClass} value={formData.razons} onChange={(e) => setFormData({...formData, razons: e.target.value.toUpperCase()})} placeholder="PUBLICO EN GENERAL" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Régimen Fiscal</label>
                                            <select className={inputClass} value={formData.regimen} onChange={(e) => setFormData({...formData, regimen: e.target.value})} required>
                                                <option value="">Seleccionar...</option>
                                                {regimenes.map(r => <option key={r.Value} value={r.Value}>{r.Value} - {r.Description}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Uso de CFDI</label>
                                            <select className={inputClass} value={formData.usocfdi} onChange={(e) => setFormData({...formData, usocfdi: e.target.value})} required>
                                                <option value="">Seleccionar...</option>
                                                {usosCfdi.map(u => <option key={u.Value} value={u.Value}>{u.Value} - {u.Description}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Domicilio Fiscal</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>C.P.</label>
                                            <input type="text" className={inputClass} value={formData.codpos} onChange={(e) => setFormData({...formData, codpos: e.target.value})} placeholder="00000" required />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className={labelClass}>Estado</label>
                                            <input type="text" className={inputClass} value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Calle</label>
                                        <input type="text" className={inputClass} value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Ciudad</label>
                                            <input type="text" className={inputClass} value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Colonia</label>
                                            <input type="text" className={inputClass} value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pb-2">Contacto y Notificaciones</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Email Principal</label>
                                        <input type="email" className={inputClass} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Teléfono</label>
                                        <input type="text" className={inputClass} value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="5512345678" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>País</label>
                                        <input type="text" className={inputClass} value={formData.pais} onChange={(e) => setFormData({...formData, pais: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex justify-end space-x-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancelar</button>
                                <button type="submit" className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                                    {isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsSection;

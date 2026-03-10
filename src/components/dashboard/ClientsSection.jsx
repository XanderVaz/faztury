import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, UserPlus, Edit2, Trash2, X, Mail, Phone, MapPin, Plus, RefreshCw, AlertCircle, ExternalLink, ChevronDown, CheckCircle2 } from 'lucide-react';

const ClientsSection = () => {
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
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setFormData({
            ...initialFormState,
            ...client
        });
        // Usamos _id que ya viene mapeado como el UID desde el backend
        setCurrentClientId(client._id); 
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!id) {
            setMessage({ text: 'Error: ID de cliente no encontrado.', type: 'error' });
            return;
        }
        if (window.confirm('¿Está seguro de eliminar este cliente permanentemente de la API externa?')) {
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
                if (!currentClientId) throw new Error('ID de cliente no encontrado para actualizar.');
                await api.put(`/clients/${currentClientId}`, formData);
                setMessage({ text: 'Cliente actualizado exitosamente.', type: 'success' });
            } else {
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
                <button 
                    onClick={openCreateModal}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Añadir Nuevo Cliente</span>
                </button>
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
                                    <button onClick={() => openEditModal(client)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                    <button onClick={() => handleDelete(client._id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
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
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? 'Editar Cliente' : 'Nuevo Registro'}</h2>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Formulario de Cliente Externo</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all border border-slate-100"><X size={24}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[65vh]">
                            {/* Datos Fiscales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>RFC</label>
                                    <input type="text" value={formData.rfc} onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase()})} required className={inputClass} placeholder="XAXX010101000" />
                                </div>
                                <div>
                                    <label className={labelClass}>Razón Social</label>
                                    <input type="text" value={formData.razons} onChange={e => setFormData({...formData, razons: e.target.value.toUpperCase()})} required className={inputClass} placeholder="NOMBRE COMPLETO O EMPRESA" />
                                </div>
                                <div>
                                    <label className={labelClass}>Régimen Fiscal</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.regimen} 
                                            onChange={e => setFormData({...formData, regimen: e.target.value})}
                                            required
                                            className={`${inputClass} appearance-none`}
                                        >
                                            <option value="">Seleccione Régimen</option>
                                            {regimenes.map(r => (
                                                <option key={r.key} value={r.key}>{r.key} - {r.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Uso de CFDI</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.usocfdi} 
                                            onChange={e => setFormData({...formData, usocfdi: e.target.value})}
                                            required
                                            className={`${inputClass} appearance-none`}
                                        >
                                            <option value="">Seleccione Uso</option>
                                            {usosCfdi.map(u => (
                                                <option key={u.key} value={u.key}>{u.key} - {u.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Domicilio */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Ubicación Fiscal</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Calle</label>
                                        <input type="text" value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Código Postal</label>
                                        <input type="text" value={formData.codpos} onChange={e => setFormData({...formData, codpos: e.target.value})} required className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>No. Exterior</label>
                                        <input type="text" value={formData.numero_exterior} onChange={e => setFormData({...formData, numero_exterior: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>No. Interior</label>
                                        <input type="text" value={formData.numero_interior} onChange={e => setFormData({...formData, numero_interior: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Colonia</label>
                                        <input type="text" value={formData.colonia} onChange={e => setFormData({...formData, colonia: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Ciudad</label>
                                        <input type="text" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Estado</label>
                                        <input type="text" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>País</label>
                                        <input type="text" value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Contacto Personal */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Información de Contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={labelClass}>Nombre(s)</label>
                                        <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Apellidos</label>
                                        <input type="text" value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Teléfono</label>
                                        <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className={labelClass}>Email Principal</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white transition-all">Cancelar</button>
                            <button 
                                onClick={handleSubmit}
                                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsSection;

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { Search, Plus, Edit2, Trash2, X, Package, Tag, DollarSign, Hash, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, Boxes, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProductsSection = () => {
    const { hasPermission } = useAuth();
    const [products, setProducts] = useState([]);
    const [claveUnidades, setClaveUnidades] = useState([]);
    const [claveProdServs, setClaveProdServs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
    const [catalogError, setCatalogError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Estados para búsqueda en los selects
    const [searchUnit, setSearchUnit] = useState('');
    const [searchProdServ, setSearchProdServ] = useState('');

    const initialFormState = {
        code: '',
        name: '',
        price: '',
        clavePS: '',
        unity: '',
        claveUnity: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchProducts();
        fetchCatalogs();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/products');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error al cargar productos:', err);
            setMessage({ 
                text: err.response?.data?.error || 'Error al conectar con la API externa de productos.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCatalogs = async () => {
        setIsLoadingCatalogs(true);
        setCatalogError(null);
        
        try {
            try {
                const resUnidades = await api.get('/catalogs/claveunidad');
                setClaveUnidades(Array.isArray(resUnidades.data) ? resUnidades.data : []);
            } catch (e) {
                setCatalogError("Error al cargar unidades SAT.");
            }

            try {
                const resProdServ = await api.get('/catalogs/claveprodserv');
                setClaveProdServs(Array.isArray(resProdServ.data) ? resProdServ.data : []);
            } catch (e) {
                setCatalogError(prev => prev ? prev + " Error al cargar productos SAT." : "Error al cargar productos SAT.");
            }

        } catch (err) {
            setCatalogError("No se pudieron cargar los catálogos del SAT.");
        } finally {
            setIsLoadingCatalogs(false);
        }
    };

    const filteredProducts = products.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUnities = useMemo(() => {
        if (!searchUnit) return claveUnidades.slice(0, 100);
        return claveUnidades.filter(u => 
            (u.key || '').toLowerCase().includes(searchUnit.toLowerCase()) || 
            (u.name || '').toLowerCase().includes(searchUnit.toLowerCase())
        ).slice(0, 100);
    }, [claveUnidades, searchUnit]);

    const filteredProdServs = useMemo(() => {
        if (!searchProdServ) return claveProdServs.slice(0, 100);
        return claveProdServs.filter(cp => 
            (cp.key || '').toLowerCase().includes(searchProdServ.toLowerCase()) || 
            (cp.name || '').toLowerCase().includes(searchProdServ.toLowerCase())
        ).slice(0, 100);
    }, [claveProdServs, searchProdServ]);

    const openCreateModal = () => {
        if (!hasPermission('products', 'create')) {
            alert('No tienes permiso para registrar productos.');
            return;
        }
        setFormData(initialFormState);
        setSearchUnit('');
        setSearchProdServ('');
        setIsEditing(false);
        setIsModalOpen(true);
        if (claveUnidades.length === 0 || claveProdServs.length === 0) {
            fetchCatalogs();
        }
    };

    const openEditModal = (product) => {
        if (!hasPermission('products', 'edit')) {
            alert('No tienes permiso para editar productos.');
            return;
        }
        setFormData({
            code: product.code || '',
            name: product.name || '',
            price: product.price || '',
            clavePS: product.clavePS || '',
            unity: product.unity || '',
            claveUnity: product.claveUnity || ''
        });
        setSearchUnit('');
        setSearchProdServ('');
        setCurrentProductId(product._id);
        setIsEditing(true);
        setIsModalOpen(true);
        if (claveUnidades.length === 0 || claveProdServs.length === 0) {
            fetchCatalogs();
        }
    };

    const handleDelete = async (id) => {
        if (!hasPermission('products', 'delete')) {
            alert('No tienes permiso para eliminar productos.');
            return;
        }
        if (!id) return;
        if (window.confirm('¿Está seguro de eliminar este producto permanentemente?')) {
            try {
                await api.delete(`/products/${id}`);
                setMessage({ text: 'Producto eliminado exitosamente.', type: 'success' });
                fetchProducts();
            } catch (err) {
                setMessage({ text: err.response?.data?.error || 'Error al eliminar producto', type: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                if (!hasPermission('products', 'edit')) return;
                await api.put(`/products/${currentProductId}`, formData);
                setMessage({ text: 'Producto actualizado exitosamente.', type: 'success' });
            } else {
                if (!hasPermission('products', 'create')) return;
                await api.post('/products', formData);
                setMessage({ text: 'Producto registrado exitosamente.', type: 'success' });
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Error en la operación', type: 'error' });
        }
    };

    const handleClaveUnityChange = (e) => {
        const key = e.target.value;
        const selected = claveUnidades.find(u => u.key === key);
        setFormData({
            ...formData,
            claveUnity: key,
            unity: selected ? selected.name : ''
        });
    };

    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium appearance-none";
    const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1";

    if (!hasPermission('products', 'view')) {
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
                        Catálogo de Productos
                        <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">API v3</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión centralizada de artículos y servicios.</p>
                </div>
                {hasPermission('products', 'create') && (
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-100 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Añadir Nuevo Producto</span>
                    </button>
                )}
            </div>

            {/* Buscador */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o código de producto..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                </div>
                <button onClick={fetchProducts} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all">
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

            {/* Listado de Productos */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <RefreshCw className="animate-spin text-amber-600" size={48} />
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Consultando catálogo externo...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.length > 0 ? filteredProducts.map(product => (
                        <div key={product._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-amber-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Package size={28} />
                                </div>
                                <div className="flex space-x-1">
                                    {hasPermission('products', 'edit') && (
                                        <button onClick={() => openEditModal(product)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                    )}
                                    {hasPermission('products', 'delete') && (
                                        <button onClick={() => handleDelete(product._id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    )}
                                </div>
                            </div>
                            <h3 className="font-black text-slate-800 text-lg leading-tight mb-1 truncate">{product.name}</h3>
                            <div className="flex items-center space-x-2 mb-4">
                                <Tag size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.code}</span>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Precio Unitario</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">${parseFloat(product.price).toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Unidad SAT</p>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{product.claveUnity}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Boxes size={32} />
                            </div>
                            <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest">No hay productos registrados</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Registro/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? 'Actualizar Producto' : 'Nuevo Producto / Servicio'}</h2>
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Sincronización con catálogos SAT</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={28}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center"><Tag size={16} className="mr-2 text-amber-500"/> Información General</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Código Interno</label>
                                            <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input type="text" className={`${inputClass} pl-10`} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="PROD-001" required /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Precio (Sin IVA)</label>
                                            <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input type="number" step="0.01" className={`${inputClass} pl-10`} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" required /></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Nombre del Producto / Servicio</label>
                                        <input type="text" className={inputClass} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} placeholder="EJ: SERVICIO DE CONSULTORÍA" required />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center"><ShieldAlert size={16} className="mr-2 text-amber-500"/> Clasificación SAT</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Clave Producto/Servicio (SAT)</label>
                                            <div className="relative">
                                                <input type="text" className="w-full p-2 mb-2 bg-white border border-slate-200 rounded-xl text-xs" placeholder="Filtrar catálogo..." value={searchProdServ} onChange={(e) => setSearchProdServ(e.target.value)} />
                                                <select className={inputClass} value={formData.clavePS} onChange={(e) => setFormData({...formData, clavePS: e.target.value})} required>
                                                    <option value="">Seleccionar clave...</option>
                                                    {filteredProdServs.map(cp => <option key={cp.key} value={cp.key}>{cp.key} - {cp.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Clave Unidad (SAT)</label>
                                            <div className="relative">
                                                <input type="text" className="w-full p-2 mb-2 bg-white border border-slate-200 rounded-xl text-xs" placeholder="Filtrar catálogo..." value={searchUnit} onChange={(e) => setSearchUnit(e.target.value)} />
                                                <select className={inputClass} value={formData.claveUnity} onChange={handleClaveUnityChange} required>
                                                    <option value="">Seleccionar unidad...</option>
                                                    {filteredUnities.map(u => <option key={u.key} value={u.key}>{u.key} - {u.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {catalogError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center space-x-3">
                                    <AlertCircle size={18} />
                                    <span>{catalogError}</span>
                                </div>
                            )}

                            <div className="pt-10 flex justify-end space-x-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancelar</button>
                                <button type="submit" className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95">
                                    {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsSection;

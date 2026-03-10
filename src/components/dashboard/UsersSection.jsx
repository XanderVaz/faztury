import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, UserPlus, Edit2, Trash2, X, ShieldCheck, Mail, User as UserIcon, Lock, CheckCircle2, Eye, Plus, Pencil, Trash, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UsersSection = () => {
    const { user: currentUser, hasPermission } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const initialPermissions = {
        dashboard: { view: true, create: false, edit: false, delete: false },
        tickets: { view: true, create: true, edit: false, delete: false },
        sales: { view: true, create: false, edit: false, delete: false },
        invoices: { view: true, create: true, edit: false, delete: false },
        invoiceList: { view: true, create: false, edit: false, delete: false },
        clients: { view: true, create: true, edit: true, delete: false },
        products: { view: true, create: true, edit: true, delete: false },
        companies: { view: false, create: false, edit: false, delete: false },
        admin: { view: false, create: false, edit: false, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
        logs: { view: false, create: false, edit: false, delete: false }
    };

    const initialFormState = {
        username: '',
        email: '',
        password: '',
        role: 'Asistente',
        permissions: initialPermissions
    };

    const [formData, setFormData] = useState(initialFormState);

    const sections = [
        { id: 'dashboard', label: 'Dashboard', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'tickets', label: 'Punto de Venta', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'sales', label: 'Historial Ventas', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'invoices', label: 'Nueva Factura', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'invoiceList', label: 'Mis Facturas', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'clients', label: 'Clientes', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'products', label: 'Productos', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'companies', label: 'Empresa', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'admin', label: 'Seguridad', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'users', label: 'Personal', actions: ['view', 'create', 'edit', 'delete'] },
        { id: 'logs', label: 'Logs del Sistema', actions: ['view', 'create', 'edit', 'delete'] }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (u) => {
        // Asegurarse de que todos los permisos existan al editar
        const mergedPermissions = {};
        sections.forEach(sec => {
            mergedPermissions[sec.id] = {
                view: u.permissions?.[sec.id]?.view || false,
                create: u.permissions?.[sec.id]?.create || false,
                edit: u.permissions?.[sec.id]?.edit || false,
                delete: u.permissions?.[sec.id]?.delete || false,
            };
        });

        setFormData({ 
            username: u.username,
            email: u.email,
            password: '', 
            role: u.role,
            permissions: mergedPermissions 
        });
        setCurrentUserId(u._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (id === currentUser._id) return alert('No puedes eliminarte a ti mismo');
        if (window.confirm('¿Eliminar este usuario permanentemente?')) {
            try {
                await api.delete(`/auth/users/${id}`);
                setMessage({ text: 'Usuario eliminado', type: 'success' });
                fetchUsers();
            } catch (err) {
                setMessage({ text: 'Error al eliminar', type: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (isEditing && !dataToSend.password) {
                delete dataToSend.password;
            }

            if (isEditing) {
                await api.put(`/auth/users/${currentUserId}`, dataToSend);
                setMessage({ text: 'Usuario actualizado', type: 'success' });
            } else {
                await api.post('/auth/users', dataToSend);
                setMessage({ text: 'Usuario creado exitosamente', type: 'success' });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Error en la operación', type: 'error' });
        }
    };

    const handlePermissionToggle = (sectionId, action) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [sectionId]: {
                    ...prev.permissions[sectionId],
                    [action]: !prev.permissions[sectionId]?.[action]
                }
            }
        }));
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'view': return <Eye size={12} />;
            case 'create': return <Plus size={12} />;
            case 'edit': return <Pencil size={12} />;
            case 'delete': return <Trash size={12} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Gestión de Personal</h1>
                    <p className="text-slate-500 text-sm">Administra los accesos y permisos granulares de los usuarios.</p>
                </div>
                {hasPermission('users', 'create') && (
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                    >
                        <UserPlus size={20} />
                        <span>Registrar Nuevo Usuario</span>
                    </button>
                )}
            </div>

            {/* Filtro */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, correo o rol..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-tighter">
                    {filteredUsers.length} Usuarios encontrados
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border flex justify-between items-center ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <span className="text-sm font-medium">{message.text}</span>
                    <button onClick={() => setMessage({text:'', type:''})}><X size={16}/></button>
                </div>
            )}

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(u => (
                    <div key={u._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-1 h-full ${u.role === 'Administrador' ? 'bg-red-500' : u.role === 'Contador' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors font-bold text-xl">
                                {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 leading-tight">{u.username}</h3>
                                <p className="text-xs text-slate-400 truncate w-40">{u.email}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{u.role}</span>
                            <div className="flex space-x-1">
                                {hasPermission('users', 'edit') && (
                                    <button onClick={() => openEditModal(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16}/></button>
                                )}
                                {hasPermission('users', 'delete') && u._id !== currentUser._id && (
                                    <button onClick={() => handleDelete(u._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={24}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nombre de Usuario</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">{isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!isEditing} placeholder={isEditing ? "Dejar vacío para mantener actual" : ""} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Rol</label>
                                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                        <option value="Administrador">Administrador</option>
                                        <option value="Contador">Contador</option>
                                        <option value="Asistente">Asistente</option>
                                        <option value="Capturista">Capturista</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Permisos Granulares</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sections.map(section => (
                                        <div key={section.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-xs font-black text-slate-700 mb-3 uppercase tracking-tight">{section.label}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {section.actions.map(action => (
                                                    <button
                                                        key={action}
                                                        type="button"
                                                        onClick={() => handlePermissionToggle(section.id, action)}
                                                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                                            formData.permissions[section.id]?.[action]
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-white text-slate-400 border border-slate-200'
                                                        }`}
                                                    >
                                                        {getActionIcon(action)}
                                                        <span>{action === 'view' ? 'Ver' : action === 'create' ? 'Crear' : action === 'edit' ? 'Editar' : 'Borrar'}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
                                <button type="submit" className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-95">
                                    {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersSection;

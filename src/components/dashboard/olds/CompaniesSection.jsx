import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Building, Edit2, Trash2, X, Mail, ShieldCheck, Server, Key, MapPin, Phone, User as UserIcon, Plus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CompaniesSection = () => {
    const { hasPermission } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);
    const [activeFormTab, setActiveFormTab] = useState('fiscal');
    const [message, setMessage] = useState({ text: '', type: '' });

    const initialFormState = {
        razons: '', rfc: '', codpos: '', calle: '', numero_exterior: '', numero_interior: '', colonia: '', estado: '', ciudad: '', delegacion: '', email: '', regimen: '',
        mailtomyconta: false, mail_conta: '', mailtomyself: false, regimen_nomina: '', cant_folios_min: 0,
        smtp: false, smtp_email: '', smtp_password: '', smtp_host: '', smtp_port: '', smtp_encryption: 'TLS',
        telefono: '', curp: '', logo: '',
        cer: '', key: '', password: '',
        fielcer: '', fielkey: '', fielpassword: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies');
            setCompanies(res.data);
        } catch (err) {
            console.error('Error al cargar empresas:', err);
        }
    };

    const filteredCompanies = companies.filter(c => 
        (c.razons || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.rfc || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        if (!hasPermission('companies', 'create')) {
            alert('No tienes permiso para registrar empresas.');
            return;
        }
        setFormData(initialFormState);
        setIsEditing(false);
        setActiveFormTab('fiscal');
        setIsModalOpen(true);
    };

    const openEditModal = (company) => {
        if (!hasPermission('companies', 'edit')) {
            alert('No tienes permiso para editar empresas.');
            return;
        }
        setFormData(company);
        setCurrentCompanyId(company._id);
        setIsEditing(true);
        setActiveFormTab('fiscal');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!hasPermission('companies', 'delete')) {
            alert('No tienes permiso para eliminar empresas.');
            return;
        }
        if (window.confirm('¿Eliminar esta empresa permanentemente?')) {
            try {
                await api.delete(`/companies/${id}`);
                setMessage({ text: 'Empresa eliminada', type: 'success' });
                fetchCompanies();
            } catch (err) {
                setMessage({ text: 'Error al eliminar', type: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                if (!hasPermission('companies', 'edit')) return;
                await api.put(`/companies/${currentCompanyId}`, formData);
                setMessage({ text: 'Empresa actualizada exitosamente', type: 'success' });
            } else {
                if (!hasPermission('companies', 'create')) return;
                await api.post('/companies', formData);
                setMessage({ text: 'Empresa registrada exitosamente', type: 'success' });
            }
            setIsModalOpen(false);
            fetchCompanies();
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Error en la operación', type: 'error' });
        }
    };

    const inputClass = "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm";
    const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";
    const tabBtnClass = (id) => `px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeFormTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`;

    if (!hasPermission('companies', 'view')) {
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Empresas (Emisores)</h1>
                    <p className="text-slate-500 text-sm">Configura tus datos fiscales, sellos digitales y servidores de correo.</p>
                </div>
                {hasPermission('companies', 'create') && (
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Añadir Nueva Empresa</span>
                    </button>
                )}
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por Razón Social o RFC..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-tighter">
                    {filteredCompanies.length} Empresas registradas
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border flex justify-between items-center ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <span className="text-sm font-medium">{message.text}</span>
                    <button onClick={() => setMessage({text:'', type:''})}><X size={16}/></button>
                </div>
            )}

            {/* Listado de Empresas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompanies.map(company => (
                    <div key={company._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all mr-4">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight">{company.razons}</h3>
                                    <div className="flex items-center mt-1">
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{company.rfc}</span>
                                        <span className="mx-2 text-slate-200">|</span>
                                        <span className="text-xs text-slate-400 font-medium">{company.ciudad}, {company.estado}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-1">
                                {hasPermission('companies', 'edit') && (
                                    <button onClick={() => openEditModal(company)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18}/></button>
                                )}
                                {hasPermission('companies', 'delete') && (
                                    <button onClick={() => handleDelete(company._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                            <div className="text-center">
                                <div className="text-[10px] font-black text-slate-300 uppercase">SMTP</div>
                                <div className={`text-xs font-bold mt-1 ${company.smtp ? 'text-green-500' : 'text-slate-300'}`}>{company.smtp ? 'ACTIVO' : 'INACTIVO'}</div>
                            </div>
                            <div className="text-center border-x border-slate-50">
                                <div className="text-[10px] font-black text-slate-300 uppercase">Sellos</div>
                                <div className={`text-xs font-bold mt-1 ${company.cer ? 'text-blue-500' : 'text-slate-300'}`}>{company.cer ? 'CARGADOS' : 'PENDIENTE'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] font-black text-slate-300 uppercase">Folios</div>
                                <div className="text-xs font-bold mt-1 text-slate-700">{company.cant_folios_min} mín.</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Configuración Integral */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">{isEditing ? 'Editar Configuración de Empresa' : 'Registro de Nueva Empresa'}</h2>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Configuración Fiscal y Técnica del Emisor</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={24}/></button>
                        </div>

                        {/* Pestañas del Formulario */}
                        <div className="px-8 py-3 bg-slate-50/50 border-b border-slate-100 flex space-x-2">
                            <button onClick={() => setActiveFormTab('fiscal')} className={tabBtnClass('fiscal')}>
                                <div className="flex items-center"><MapPin size={14} className="mr-2"/> Fiscal y Domicilio</div>
                            </button>
                            <button onClick={() => setActiveFormTab('smtp')} className={tabBtnClass('smtp')}>
                                <div className="flex items-center"><Server size={14} className="mr-2"/> SMTP y Notificaciones</div>
                            </button>
                            <button onClick={() => setActiveFormTab('certs')} className={tabBtnClass('certs')}>
                                <div className="flex items-center"><Key size={14} className="mr-2"/> Certificados (CSD / FIEL)</div>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                            {activeFormTab === 'fiscal' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-left-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelClass}>Razón Social</label>
                                        <input type="text" className={inputClass} value={formData.razons} onChange={(e) => setFormData({...formData, razons: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>RFC</label>
                                        <input type="text" className={inputClass} value={formData.rfc} onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Régimen Fiscal</label>
                                        <select className={inputClass} value={formData.regimen} onChange={(e) => setFormData({...formData, regimen: e.target.value})}>
                                            <option value="">Seleccionar...</option>
                                            <option value="601">601 - General de Ley Personas Morales</option>
                                            <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                                            <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                                            <option value="606">606 - Arrendamiento</option>
                                            <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                                            <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Código Postal</label>
                                        <input type="text" className={inputClass} value={formData.codpos} onChange={(e) => setFormData({...formData, codpos: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Estado</label>
                                        <input type="text" className={inputClass} value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Ciudad</label>
                                        <input type="text" className={inputClass} value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Calle</label>
                                        <input type="text" className={inputClass} value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Email Contacto</label>
                                        <input type="email" className={inputClass} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Teléfono</label>
                                        <input type="text" className={inputClass} value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'smtp' && (
                                <div className="space-y-6 animate-in slide-in-from-left-4">
                                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <input type="checkbox" id="smtp_active" className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500" checked={formData.smtp} onChange={(e) => setFormData({...formData, smtp: e.target.checked})} />
                                        <label htmlFor="smtp_active" className="text-sm font-black text-blue-800 uppercase tracking-widest">Activar Servidor de Correo Propio (SMTP)</label>
                                    </div>
                                    
                                    {formData.smtp && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="space-y-2">
                                                <label className={labelClass}>Host SMTP</label>
                                                <input type="text" placeholder="smtp.gmail.com" className={inputClass} value={formData.smtp_host} onChange={(e) => setFormData({...formData, smtp_host: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={labelClass}>Puerto</label>
                                                <input type="text" placeholder="587" className={inputClass} value={formData.smtp_port} onChange={(e) => setFormData({...formData, smtp_port: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={labelClass}>Usuario / Email</label>
                                                <input type="email" className={inputClass} value={formData.smtp_email} onChange={(e) => setFormData({...formData, smtp_email: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={labelClass}>Contraseña</label>
                                                <input type="password" className={inputClass} value={formData.smtp_password} onChange={(e) => setFormData({...formData, smtp_password: e.target.value})} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeFormTab === 'certs' && (
                                <div className="space-y-8 animate-in slide-in-from-left-4">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center"><ShieldCheck size={18} className="mr-2 text-blue-600"/> Certificado de Sello Digital (CSD)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2"><label className={labelClass}>Archivo .CER (Base64)</label><textarea className={`${inputClass} h-24 font-mono text-[10px]`} value={formData.cer} onChange={(e) => setFormData({...formData, cer: e.target.value})} /></div>
                                            <div className="space-y-2"><label className={labelClass}>Archivo .KEY (Base64)</label><textarea className={`${inputClass} h-24 font-mono text-[10px]`} value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})} /></div>
                                            <div className="space-y-2"><label className={labelClass}>Contraseña de Sellos</label><input type="password" className={inputClass} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-slate-100 flex justify-end space-x-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancelar</button>
                                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar Empresa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompaniesSection;

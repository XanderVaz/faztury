import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Building, Edit2, Trash2, X, Mail, ShieldCheck, Server, Key, MapPin, Phone, User as UserIcon, Plus, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ESTADOS_MEXICO, REGIMENES_FISCALES, formatearRegimen } from '../../constants/mexicoData';

const CompaniesSection = () => {
    const { hasPermission } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompanyUid, setCurrentCompanyUid] = useState(null);
    const [activeFormTab, setActiveFormTab] = useState('fiscal');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const initialFormState = {
        razons: '', rfc: '', codpos: '', calle: '', numero_exterior: '', numero_interior: '', colonia: '', estado: '', ciudad: '', delegacion: '', email: '', regimen: '',
        mailtomyconta: '0', mail_conta: '', mailtomyself: '0', regimen_nomina: '', cant_folios_min: '0',
        smtp: '0', smtp_email: '', smtp_password: '', smtp_port: '', smtp_host: '', smtp_encryption: 'tls',
        telefono: '', curp: '', password: '', fielpassword: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [files, setFiles] = useState({
        logo: null, cer: null, key: null, fielcer: null, fielkey: null
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/companies');
            setCompanies(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error al cargar empresas:', err);
            setMessage({ text: 'Error al conectar con la API de empresas', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => 
        (c.razon_social || c.razons || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.rfc || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setFormData(initialFormState);
        setFiles({ logo: null, cer: null, key: null, fielcer: null, fielkey: null });
        setIsEditing(false);
        setActiveFormTab('fiscal');
        setIsModalOpen(true);
    };

    const openEditModal = (company) => {
        setFormData({
            razons: company.razon_social || company.razons || '',
            rfc: company.rfc || '',
            codpos: company.codpos || '',
            calle: company.calle || '',
            numero_exterior: company.exterior || company.numero_exterior || '',
            numero_interior: company.interior || company.numero_interior || '',
            colonia: company.colonia || '',
            estado: company.estado || '',
            ciudad: company.ciudad || '',
            delegacion: company.delegacion || '',
            email: company.email || '',
            regimen: company.regimen || company.regimen_fiscal || '',
            mailtomyconta: company.mailtomyconta || '0',
            mail_conta: company.mail_conta || '',
            mailtomyself: company.mailtomyself || '0',
            regimen_nomina: company.regimen_nomina || '',
            cant_folios_min: company.cant_folios_min || '0',
            smtp: company.smtp || '0',
            smtp_email: company.smtp_email || '',
            smtp_password: company.smtp_password || '',
            smtp_port: company.smtp_port || '',
            smtp_host: company.smtp_host || '',
            smtp_encryption: company.smtp_encryption || 'tls',
            telefono: company.telefono || '',
            curp: company.curp || '',
            password: '',
            fielpassword: ''
        });
        setFiles({ logo: null, cer: null, key: null, fielcer: null, fielkey: null });
        setCurrentCompanyUid(company.uid);
        setIsEditing(true);
        setActiveFormTab('fiscal');
        setIsModalOpen(true);
    };

    const handleDelete = async (uid) => {
        if (window.confirm('¿Eliminar esta empresa permanentemente de Factura.com?')) {
            try {
                await api.delete(`/companies/${uid}`);
                setMessage({ text: 'Empresa eliminada exitosamente', type: 'success' });
                fetchCompanies();
            } catch (err) {
                console.error('Error al eliminar:', err);
                setMessage({ text: 'Error al eliminar empresa', type: 'error' });
            }
        }
    };

    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        if (uploadedFiles[0]) {
            setFiles({ ...files, [name]: uploadedFiles[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            
            // Agregar campos de texto
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Agregar archivos
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formDataToSend.append(key, files[key]);
                }
            });

            if (isEditing) {
                await api.put(`/companies/${currentCompanyUid}`, formDataToSend);
                setMessage({ text: 'Empresa actualizada exitosamente', type: 'success' });
            } else {
                await api.post('/companies', formDataToSend);
                setMessage({ text: 'Empresa registrada exitosamente', type: 'success' });
            }

            setIsModalOpen(false);
            fetchCompanies();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Error al procesar la solicitud';
            setMessage({ text: `Error: ${errorMsg}`, type: 'error' });
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const labelClass = 'block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider';
    const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const selectClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Building className="mr-3 text-blue-600" size={28} />
                        Empresas
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">Gestiona tus empresas registradas en Factura.com</p>
                </div>
                {hasPermission('create_company') && (
                    <button onClick={openCreateModal} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg">
                        <Plus size={20} className="mr-2" /> Añadir Nueva Empresa
                    </button>
                )}
            </div>

            {/* Mensaje */}
            {message.text && (
                <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="text-green-600 mr-3" size={20} />
                    ) : (
                        <AlertCircle className="text-red-600 mr-3" size={20} />
                    )}
                    <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</span>
                </div>
            )}

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar por razón social o RFC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-10 ${inputClass}`} />
            </div>

            {/* Lista de Empresas */}
            {isLoading ? (
                <div className="text-center py-12">
                    <RefreshCw className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
                    <p className="text-slate-600">Cargando empresas...</p>
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <Building className="mx-auto text-slate-400 mb-3" size={48} />
                    <p className="text-slate-600">No hay empresas registradas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map(company => (
                        <div key={company.uid} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-bold text-slate-900 text-lg">{company.razon_social || company.razons}</h3>
                                {hasPermission('edit_company') && (
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(company)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                                            <Edit2 size={18} />
                                        </button>
                                        {hasPermission('delete_company') && (
                                            <button onClick={() => handleDelete(company.uid)} className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                <p className="flex items-center"><UserIcon size={16} className="mr-2" /> <strong>RFC:</strong> {company.rfc}</p>
                                <p className="flex items-center"><MapPin size={16} className="mr-2" /> <strong>Estado:</strong> {company.estado}</p>
                                <p className="flex items-center"><Phone size={16} className="mr-2" /> <strong>Teléfono:</strong> {company.telefono}</p>
                                <p><strong>Régimen:</strong> {formatearRegimen(company.regimen || company.regimen_fiscal)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isEditing ? 'Editar Empresa' : 'Crear Nueva Empresa'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-slate-200">
                                {['fiscal', 'contacto', 'smtp', 'certs'].map(tab => (
                                    <button key={tab} type="button" onClick={() => setActiveFormTab(tab)} className={`px-4 py-2 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${activeFormTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
                                        {tab === 'fiscal' && 'Datos Fiscales'}
                                        {tab === 'contacto' && 'Contacto'}
                                        {tab === 'smtp' && 'Configuración'}
                                        {tab === 'certs' && 'Certificados'}
                                    </button>
                                ))}
                            </div>

                            {/* Tab: Datos Fiscales */}
                            {activeFormTab === 'fiscal' && (
                                <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Razón Social</label>
                                            <input type="text" required className={inputClass} value={formData.razons} onChange={(e) => setFormData({...formData, razons: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>RFC</label>
                                            <input type="text" required className={inputClass} value={formData.rfc} onChange={(e) => setFormData({...formData, rfc: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Código Postal</label>
                                            <input type="text" required className={inputClass} value={formData.codpos} onChange={(e) => setFormData({...formData, codpos: e.target.value})} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Calle</label>
                                            <input type="text" className={inputClass} value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>No. Exterior</label>
                                            <input type="text" className={inputClass} value={formData.numero_exterior} onChange={(e) => setFormData({...formData, numero_exterior: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>No. Interior</label>
                                            <input type="text" className={inputClass} value={formData.numero_interior} onChange={(e) => setFormData({...formData, numero_interior: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Colonia</label>
                                            <input type="text" className={inputClass} value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} />
                                        </div>

                                        {/* SELECT: Estado */}
                                        <div>
                                            <label className={labelClass}>Estado</label>
                                            <select required className={selectClass} value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}>
                                                <option value="">-- Selecciona un estado --</option>
                                                {ESTADOS_MEXICO.map(estado => (
                                                    <option key={estado.id} value={estado.valor}>
                                                        {estado.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Ciudad</label>
                                            <input type="text" className={inputClass} value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Delegación</label>
                                            <input type="text" className={inputClass} value={formData.delegacion} onChange={(e) => setFormData({...formData, delegacion: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email de la Empresa</label>
                                            <input type="email" required className={inputClass} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                        </div>

                                        {/* SELECT: Régimen Fiscal */}
                                        <div>
                                            <label className={labelClass}>Régimen Fiscal</label>
                                            <select required className={selectClass} value={formData.regimen} onChange={(e) => setFormData({...formData, regimen: e.target.value})}>
                                                <option value="">-- Selecciona un régimen --</option>
                                                {REGIMENES_FISCALES.map(regimen => (
                                                    <option key={regimen.clave} value={regimen.clave}>
                                                        {regimen.clave} - {regimen.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.regimen && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    ✓ Seleccionado: {formatearRegimen(formData.regimen)}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>CURP (Opcional)</label>
                                            <input type="text" className={inputClass} value={formData.curp} onChange={(e) => setFormData({...formData, curp: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Teléfono</label>
                                            <input type="text" className={inputClass} value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Contacto */}
                            {activeFormTab === 'contacto' && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Nota:</strong> Estos campos son para configurar cómo Factura.com enviará las notificaciones de tus facturas.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClass}>Contraseña de Acceso</label>
                                            <input type="password" required className={inputClass} placeholder="Contraseña para acceder a Factura.com" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                        </div>
                                        <div className="border-t border-slate-200 pt-4">
                                            <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                                                <Mail className="mr-2 text-blue-600" size={18} />
                                                Notificaciones por Email
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm font-bold text-slate-700">Enviar copia a mi contador</span>
                                                    <select className="p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold" value={formData.mailtomyconta} onChange={(e) => setFormData({...formData, mailtomyconta: e.target.value})}>
                                                        <option value="0">No</option>
                                                        <option value="1">Sí</option>
                                                    </select>
                                                </div>
                                                {formData.mailtomyconta === '1' && (
                                                    <input type="email" placeholder="Email del contador" className={inputClass} value={formData.mail_conta} onChange={(e) => setFormData({...formData, mail_conta: e.target.value})} />
                                                )}
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="text-sm font-bold text-slate-700">Enviar copia a mí mismo</span>
                                                    <select className="p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold" value={formData.mailtomyself} onChange={(e) => setFormData({...formData, mailtomyself: e.target.value})}>
                                                        <option value="0">No</option>
                                                        <option value="1">Sí</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Alerta de folios mínimos</label>
                                                    <input type="number" className={inputClass} placeholder="Número mínimo de folios antes de alertar" value={formData.cant_folios_min} onChange={(e) => setFormData({...formData, cant_folios_min: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: SMTP */}
                            {activeFormTab === 'smtp' && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                                                <Server className="mr-2 text-blue-500" size={16}/> Servidor SMTP
                                            </h4>
                                            <select className="p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold" value={formData.smtp} onChange={(e) => setFormData({...formData, smtp: e.target.value})}>
                                                <option value="0">Desactivado</option>
                                                <option value="1">Activado</option>
                                            </select>
                                        </div>
                                        <div className={`space-y-4 transition-all ${formData.smtp === '0' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                                            <input type="text" placeholder="Host (ej: smtp.gmail.com)" className={inputClass} value={formData.smtp_host} onChange={(e) => setFormData({...formData, smtp_host: e.target.value})} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Puerto (ej: 587)" className={inputClass} value={formData.smtp_port} onChange={(e) => setFormData({...formData, smtp_port: e.target.value})} />
                                                <select className={inputClass} value={formData.smtp_encryption} onChange={(e) => setFormData({...formData, smtp_encryption: e.target.value})}>
                                                    <option value="tls">TLS</option>
                                                    <option value="ssl">SSL</option>
                                                </select>
                                            </div>
                                            <input type="email" placeholder="Usuario/Email SMTP" className={inputClass} value={formData.smtp_email} onChange={(e) => setFormData({...formData, smtp_email: e.target.value})} />
                                            <input type="password" placeholder="Contraseña SMTP" className={inputClass} value={formData.smtp_password} onChange={(e) => setFormData({...formData, smtp_password: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Certificados */}
                            {activeFormTab === 'certs' && (
                                <div className="space-y-6 animate-in zoom-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Logo */}
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <label className={labelClass}>Logo de la Empresa</label>
                                            <div className="mt-2 flex items-center space-x-4">
                                                <div className="w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden">
                                                    {files.logo ? (
                                                        <img src={URL.createObjectURL(files.logo)} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Upload size={24} />
                                                    )}
                                                </div>
                                                <input type="file" name="logo" accept="image/*" onChange={handleFileChange} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            </div>
                                        </div>

                                        {/* Certificados CSD */}
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                                                <ShieldCheck className="mr-2 text-blue-500" size={16}/> Certificados CSD
                                            </h4>
                                            <div>
                                                <label className={labelClass}>Archivo .CER</label>
                                                <input type="file" name="cer" accept=".cer" onChange={handleFileChange} className="text-xs w-full" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Archivo .KEY</label>
                                                <input type="file" name="key" accept=".key" onChange={handleFileChange} className="text-xs w-full" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Contraseña CSD</label>
                                                <input type="password" className={inputClass} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                            </div>
                                        </div>

                                        {/* Certificados FIEL */}
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 md:col-span-2">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                                                <Key className="mr-2 text-blue-500" size={16}/> Certificados FIEL (Opcional)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className={labelClass}>Archivo .CER FIEL</label>
                                                    <input type="file" name="fielcer" accept=".cer" onChange={handleFileChange} className="text-xs w-full" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Archivo .KEY FIEL</label>
                                                    <input type="file" name="fielkey" accept=".key" onChange={handleFileChange} className="text-xs w-full" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Contraseña FIEL</label>
                                                    <input type="password" className={inputClass} value={formData.fielpassword} onChange={(e) => setFormData({...formData, fielpassword: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-bold transition-all">
                                    {isLoading ? 'Procesando...' : (isEditing ? 'Actualizar' : 'Crear')}
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
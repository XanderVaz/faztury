import React, { useState, useEffect } from 'react';
import './StaffManagement.css';

/**
 * Componente para gestión de empleados (Staff)
 * Solo visible para usuarios con rol OWNER
 */
export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Asistente'
    });
    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem('token');

    // Obtener lista de empleados
    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/users/staff', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener empleados');
            }

            const data = await response.json();
            setStaff(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const url = editingId ? `/api/users/staff/${editingId}` : '/api/users/staff';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId 
                ? { username: formData.username, email: formData.email, role: formData.role }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar empleado');
            }

            // Actualizar lista
            await fetchStaff();

            // Limpiar formulario
            setFormData({ username: '', email: '', password: '', role: 'Asistente' });
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (staffMember) => {
        setFormData({
            username: staffMember.username,
            email: staffMember.email,
            password: '',
            role: staffMember.role
        });
        setEditingId(staffMember._id);
        setShowForm(true);
    };

    const handleDelete = async (staffId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/staff/${staffId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar empleado');
            }

            await fetchStaff();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ username: '', email: '', password: '', role: 'Asistente' });
    };

    return (
        <div className="staff-management">
            <div className="staff-header">
                <h2>Gestión de Empleados</h2>
                <button 
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancelar' : 'Agregar Empleado'}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showForm && (
                <form className="staff-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuario *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            placeholder="Nombre de usuario"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="correo@example.com"
                        />
                    </div>

                    {!editingId && (
                        <div className="form-group">
                            <label htmlFor="password">Contraseña *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!editingId}
                                placeholder="Contraseña segura"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="role">Rol *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="Asistente">Asistente</option>
                            <option value="Contador">Contador</option>
                            <option value="Capturista">Capturista</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Actualizar' : 'Crear'} Empleado
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleCancel}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="loading">Cargando empleados...</div>
            ) : staff.length === 0 ? (
                <div className="empty-state">
                    <p>No tienes empleados registrados aún.</p>
                    <p>Haz clic en "Agregar Empleado" para crear uno.</p>
                </div>
            ) : (
                <div className="staff-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member._id}>
                                    <td>{member.username}</td>
                                    <td>{member.email}</td>
                                    <td>{member.role}</td>
                                    <td>
                                        <span className={`status ${member.isActive ? 'active' : 'inactive'}`}>
                                            {member.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(member)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(member._id)}
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

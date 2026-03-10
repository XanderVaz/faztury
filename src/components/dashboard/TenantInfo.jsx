import React, { useState, useEffect } from 'react';
import './TenantInfo.css';

/**
 * Componente para mostrar información del usuario actual y su tenant
 */
export default function TenantInfo() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al obtener perfil');
            }

            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="tenant-info loading">Cargando información...</div>;
    }

    if (error) {
        return <div className="tenant-info error">Error: {error}</div>;
    }

    if (!user) {
        return null;
    }

    const getRoleLabel = (role) => {
        const roles = {
            'SUPER_ADMIN': 'Administrador del Sistema',
            'OWNER': 'Jefe (Owner)',
            'STAFF': 'Empleado (Staff)'
        };
        return roles[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            'SUPER_ADMIN': '#dc3545',
            'OWNER': '#007bff',
            'STAFF': '#28a745'
        };
        return colors[role] || '#6c757d';
    };

    return (
        <div className="tenant-info">
            <div className="tenant-card">
                <div className="tenant-header">
                    <h3>Información de Cuenta</h3>
                </div>

                <div className="tenant-body">
                    <div className="info-row">
                        <label>Usuario:</label>
                        <span>{user.username}</span>
                    </div>

                    <div className="info-row">
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>

                    <div className="info-row">
                        <label>Rol:</label>
                        <span 
                            className="role-badge"
                            style={{ backgroundColor: getRoleColor(user.systemRole) }}
                        >
                            {getRoleLabel(user.systemRole)}
                        </span>
                    </div>

                    <div className="info-row">
                        <label>Estado:</label>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    {user.systemRole === 'STAFF' && user.ownerId && (
                        <div className="info-row">
                            <label>Jefe:</label>
                            <span>{user.ownerId.username || 'N/A'}</span>
                        </div>
                    )}

                    {user.systemRole === 'OWNER' && user.staffIds && (
                        <div className="info-row">
                            <label>Empleados:</label>
                            <span>{user.staffIds.length} empleado(s)</span>
                        </div>
                    )}

                    {user.createdAt && (
                        <div className="info-row">
                            <label>Miembro desde:</label>
                            <span>{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Información de permisos */}
            {user.permissions && (
                <div className="permissions-card">
                    <div className="permissions-header">
                        <h4>Permisos</h4>
                    </div>

                    <div className="permissions-body">
                        {Object.entries(user.permissions).map(([section, perms]) => (
                            <div key={section} className="permission-section">
                                <h5>{section}</h5>
                                <div className="permission-list">
                                    {typeof perms === 'object' ? (
                                        Object.entries(perms).map(([action, allowed]) => (
                                            <div key={action} className="permission-item">
                                                <span className={`permission-badge ${allowed ? 'allowed' : 'denied'}`}>
                                                    {allowed ? '✓' : '✗'}
                                                </span>
                                                <span>{action}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="permission-item">
                                            <span className={`permission-badge ${perms ? 'allowed' : 'denied'}`}>
                                                {perms ? '✓' : '✗'}
                                            </span>
                                            <span>Acceso</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
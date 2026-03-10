import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                } catch (err) {
                    console.error('Error al verificar sesión:', err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const userData = res.data;
            
            // Guardar token
            localStorage.setItem('token', userData.token);
            
            // Estructurar el usuario (el backend devuelve el objeto directamente en la raíz de res.data)
            const userToSet = {
                _id: userData._id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                permissions: userData.permissions
            };
            
            setUser(userToSet);
            return userToSet;
        } catch (error) {
            console.error('Error en login context:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    /**
     * Verifica si el usuario tiene un permiso específico.
     * @param {string} section - La sección (ej: 'products', 'clients')
     * @param {string} action - La acción (ej: 'view', 'create', 'edit', 'delete')
     */
    const hasPermission = (section, action = 'view') => {
        if (!user) return false;
        
        // El administrador siempre tiene permiso
        if (user.role === 'Administrador') return true;
        
        // Verificar permisos granulares
        if (user.permissions && typeof user.permissions === 'object') {
            const sectionPerms = user.permissions[section];
            if (sectionPerms && typeof sectionPerms === 'object') {
                return sectionPerms[action] === true;
            }
        }
        
        return false;
    };

    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

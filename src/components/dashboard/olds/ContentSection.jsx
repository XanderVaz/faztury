import React from 'react';

const ContentSection = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Gestión de Contenido</h1>
            <p className="text-gray-600">Aquí puedes editar y gestionar el contenido del sitio.</p>
            <div className="mt-6 bg-white p-4 rounded shadow-sm border border-gray-200">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Título</th>
                            <th className="py-2">Fecha</th>
                            <th className="py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-2">Artículo de ejemplo</td>
                            <td className="py-2">2026-01-28</td>
                            <td className="py-2"><button className="text-blue-600 hover:underline">Editar</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContentSection;

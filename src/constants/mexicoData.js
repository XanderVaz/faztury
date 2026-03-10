/**
 * Datos de México para formularios
 * Estados y Regímenes Fiscales
 */

// Lista de Estados de México (32 estados)
export const ESTADOS_MEXICO = [
    { id: 1, nombre: 'Aguascalientes', valor: 'Aguascalientes' },
    { id: 2, nombre: 'Baja California', valor: 'Baja California' },
    { id: 3, nombre: 'Baja California Sur', valor: 'Baja California Sur' },
    { id: 4, nombre: 'Campeche', valor: 'Campeche' },
    { id: 5, nombre: 'Chiapas', valor: 'Chiapas' },
    { id: 6, nombre: 'Chihuahua', valor: 'Chihuahua' },
    { id: 7, nombre: 'Ciudad de México', valor: 'Ciudad de México' },
    { id: 8, nombre: 'Coahuila', valor: 'Coahuila' },
    { id: 9, nombre: 'Colima', valor: 'Colima' },
    { id: 10, nombre: 'Durango', valor: 'Durango' },
    { id: 11, nombre: 'Guanajuato', valor: 'Guanajuato' },
    { id: 12, nombre: 'Guerrero', valor: 'Guerrero' },
    { id: 13, nombre: 'Hidalgo', valor: 'Hidalgo' },
    { id: 14, nombre: 'Jalisco', valor: 'Jalisco' },
    { id: 15, nombre: 'México', valor: 'México' },
    { id: 16, nombre: 'Michoacán', valor: 'Michoacán' },
    { id: 17, nombre: 'Morelos', valor: 'Morelos' },
    { id: 18, nombre: 'Nayarit', valor: 'Nayarit' },
    { id: 19, nombre: 'Nuevo León', valor: 'Nuevo León' },
    { id: 20, nombre: 'Oaxaca', valor: 'Oaxaca' },
    { id: 21, nombre: 'Puebla', valor: 'Puebla' },
    { id: 22, nombre: 'Querétaro', valor: 'Querétaro' },
    { id: 23, nombre: 'Quintana Roo', valor: 'Quintana Roo' },
    { id: 24, nombre: 'San Luis Potosí', valor: 'San Luis Potosí' },
    { id: 25, nombre: 'Sinaloa', valor: 'Sinaloa' },
    { id: 26, nombre: 'Sonora', valor: 'Sonora' },
    { id: 27, nombre: 'Tabasco', valor: 'Tabasco' },
    { id: 28, nombre: 'Tamaulipas', valor: 'Tamaulipas' },
    { id: 29, nombre: 'Tlaxcala', valor: 'Tlaxcala' },
    { id: 30, nombre: 'Veracruz', valor: 'Veracruz' },
    { id: 31, nombre: 'Yucatán', valor: 'Yucatán' },
    { id: 32, nombre: 'Zacatecas', valor: 'Zacatecas' }
];

/**
 * Regímenes Fiscales de México
 * Formato: { clave: 'XXX', nombre: 'Nombre del Régimen' }
 * 
 * La clave es lo que se envía a la API
 * El nombre es lo que se muestra al usuario
 */
export const REGIMENES_FISCALES = [
    { clave: '601', nombre: 'General de Ley Personas Morales' },
    { clave: '603', nombre: 'Personas Morales con Fines no Lucrativos' },
    { clave: '605', nombre: 'Sueldos y Salarios e Ingresos Asimilados' },
    { clave: '606', nombre: 'Arrendamiento' },
    { clave: '607', nombre: 'Otros Ingresos por Bienesraíces' },
    { clave: '608', nombre: 'Plusvalía' },
    { clave: '609', nombre: 'Ganancia por Enajenación de Valores' },
    { clave: '610', nombre: 'Ingresos por Intereses' },
    { clave: '611', nombre: 'Renta de Inmuebles' },
    { clave: '612', nombre: 'Ingresos por Dividendos (Socios)' },
    { clave: '614', nombre: 'Ingresos por Intereses de Valores' },
    { clave: '616', nombre: 'Sin Obligación Fiscal' },
    { clave: '620', nombre: 'Sociedades Cooperativas' },
    { clave: '621', nombre: 'Personas Físicas con Actividades Empresariales' },
    { clave: '622', nombre: 'Personas Físicas con Actividades Profesionales' },
    { clave: '623', nombre: 'Personas Físicas sin Actividades Económicas' },
    { clave: '624', nombre: 'Personas Morales - Régimen General de Ley' },
    { clave: '625', nombre: 'Régimen de Pequeños Contribuyentes' },
    { clave: '626', nombre: 'Sociedades por Acciones Simplificadas' },
    { clave: '627', nombre: 'Sociedades en Nombre Colectivo' },
    { clave: '628', nombre: 'Sociedades en Comandita Simple' },
    { clave: '629', nombre: 'Sociedades en Comandita por Acciones' },
    { clave: '630', nombre: 'Sociedades Limitadas' },
    { clave: '631', nombre: 'Sucursales de Sociedades Extranjeras' },
    { clave: '632', nombre: 'Asociaciones en Participación' },
    { clave: '633', nombre: 'Fideicomiso' },
    { clave: '634', nombre: 'Fondo de Ahorro' },
    { clave: '635', nombre: 'Instituciones de Crédito' },
    { clave: '636', nombre: 'Seguros y Fianzas' },
    { clave: '637', nombre: 'Fondos de Pensiones y Jubilaciones' },
    { clave: '638', nombre: 'Fondos de Inversión' },
    { clave: '640', nombre: 'Administradoras de Fondos para el Retiro' },
    { clave: '641', nombre: 'Sociedades de Inversión' },
    { clave: '642', nombre: 'Instituciones para el Fomento de la Construcción' },
    { clave: '643', nombre: 'Intermediarios Financieros' },
    { clave: '644', nombre: 'Arrendadoras Financieras' },
    { clave: '645', nombre: 'Sociedades de Información Crediticia' },
    { clave: '646', nombre: 'Sociedades Calificadoras de Valores' },
    { clave: '647', nombre: 'Casas de Bolsa' },
    { clave: '648', nombre: 'Instituciones Distribuidoras de Fondos de Inversión' },
    { clave: '649', nombre: 'Instituciones Operadoras de Fondos de Inversión' },
    { clave: '651', nombre: 'Organismos Reguladores del Mercado de Valores' },
    { clave: '652', nombre: 'Instituciones para el Depósito de Valores' },
    { clave: '653', nombre: 'Instituciones de Transferencia de Fondos' },
    { clave: '655', nombre: 'Instituciones de Seguros' },
    { clave: '656', nombre: 'Instituciones de Fianzas' },
    { clave: '659', nombre: 'Bolsa de Valores' },
    { clave: '670', nombre: 'Asociaciones Religiosas' },
    { clave: '901', nombre: 'Extranjero sin Establecimiento Permanente' },
    { clave: '902', nombre: 'Extranjero con Establecimiento Permanente' }
];

/**
 * Función auxiliar para obtener el nombre de un régimen fiscal por su clave
 * @param {string} clave - La clave del régimen fiscal
 * @returns {string} - El nombre del régimen o 'No encontrado'
 */
export const obtenerNombreRegimen = (clave) => {
    const regimen = REGIMENES_FISCALES.find(r => r.clave === String(clave));
    return regimen ? regimen.nombre : 'No encontrado';
};

/**
 * Función auxiliar para obtener el nombre de un estado por su valor
 * @param {string} valor - El valor del estado
 * @returns {string} - El nombre del estado o 'No encontrado'
 */
export const obtenerNombreEstado = (valor) => {
    const estado = ESTADOS_MEXICO.find(e => e.valor === valor);
    return estado ? estado.nombre : 'No encontrado';
};

/**
 * Función para formatear un régimen fiscal para mostrar
 * @param {string} clave - La clave del régimen
 * @returns {string} - Formato: "601 - General de Ley Personas Morales"
 */
export const formatearRegimen = (clave) => {
    const regimen = REGIMENES_FISCALES.find(r => r.clave === String(clave));
    return regimen ? `${regimen.clave} - ${regimen.nombre}` : clave;
};
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, User, Package, CreditCard, X, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TicketsSection = () => {
    const { hasPermission } = useAuth();
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const [clientsRes, productsRes] = await Promise.all([
                api.get('/clients'),
                api.get('/products')
            ]);
            setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('No se pudo conectar con la API de clientes o productos.');
        } finally {
            setIsLoadingData(false);
        }
    };

    const addToCart = (product) => {
        const productId = product.UID || product._id;
        const existing = cart.find(item => item.productExternalId === productId);
        
        if (existing) {
            setCart(cart.map(item => 
                item.productExternalId === productId 
                ? { 
                    ...item, 
                    quantity: item.quantity + 1, 
                    subtotal: (item.quantity + 1) * item.price,
                    total: (item.quantity + 1) * item.price * 1.16
                  }
                : item
            ));
        } else {
            const price = parseFloat(product.price) || 0;
            setCart([...cart, {
                productExternalId: productId,
                name: product.name,
                code: product.code,
                price: price,
                quantity: 1,
                subtotal: price,
                tax: price * 0.16,
                total: price * 1.16
            }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.productExternalId === id) {
                const newQty = Math.max(1, item.quantity + delta);
                const newSubtotal = newQty * item.price;
                return { 
                    ...item, 
                    quantity: newQty, 
                    subtotal: newSubtotal,
                    tax: newSubtotal * 0.16,
                    total: newSubtotal * 1.16
                };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.productExternalId !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = cart.reduce((acc, item) => acc + item.tax, 0);
    const total = subtotal + tax;

    const handleProcessSale = async () => {
        if (!hasPermission('sales', 'create')) {
            alert('No tienes permiso para crear ventas.');
            return;
        }
        if (!selectedClient) return alert('Seleccione un cliente');
        if (cart.length === 0) return alert('El carrito está vacío');

        setIsProcessing(true);
        try {
            const saleData = {
                clientExternalId: selectedClient.UID || selectedClient._id,
                clientName: selectedClient.razons || selectedClient.name,
                clientRfc: selectedClient.rfc,
                items: cart,
                subtotal,
                tax,
                total,
                paymentMethod
            };
            const res = await api.post('/sales', saleData);
            setLastSale(res.data);
            setShowSuccess(true);
            setCart([]);
            setSelectedClient(null);
            setProductSearch('');
        } catch (err) {
            console.error('Error al procesar venta:', err);
            alert(err.response?.data?.error || 'Error al procesar la venta');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('ticket-print-area');
        const win = window.open('', '', 'width=400,height=600');
        win.document.write('<html><head><title>Imprimir Ticket</title>');
        win.document.write('<style>body{font-family:monospace;padding:20px;width:300px} .text-center{text-align:center} .flex-between{display:flex;justify-content:space-between} hr{border:none;border-top:1px dashed #000;margin:10px 0}</style>');
        win.document.write('</head><body>');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 250);
    };

    const filteredClients = clients.filter(c => 
        (c.razons || c.name || '').toLowerCase().includes(clientSearch.toLowerCase()) || 
        (c.rfc || '').toLowerCase().includes(clientSearch.toLowerCase())
    );

    const filteredProducts = products.filter(p => 
        (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) || 
        (p.code || '').toLowerCase().includes(productSearch.toLowerCase())
    );

    if (!hasPermission('sales', 'view')) {
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
            {/* Columna Izquierda: Selección de Cliente y Productos */}
            <div className="xl:col-span-2 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                        <button onClick={fetchData} className="p-2 hover:bg-rose-100 rounded-xl transition-all"><RefreshCw size={16} /></button>
                    </div>
                )}

                {/* Selección de Cliente */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center">
                        <User className="mr-2 text-blue-600" size={20} />
                        Seleccionar Cliente
                    </h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente por RFC o Razón Social..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                        />
                    </div>
                    {clientSearch && (
                        <div className="max-h-40 overflow-y-auto space-y-2 mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            {filteredClients.length > 0 ? filteredClients.map(c => (
                                <button 
                                    key={c.UID || c._id}
                                    onClick={() => { setSelectedClient(c); setClientSearch(''); }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-blue-100 transition-all flex justify-between items-center"
                                >
                                    <span className="font-bold text-sm text-slate-700">{c.razons || c.name}</span>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{c.rfc}</span>
                                </button>
                            )) : (
                                <p className="text-center py-4 text-xs text-slate-400 font-bold uppercase tracking-widest">No se encontraron clientes</p>
                            )}
                        </div>
                    )}
                    {selectedClient && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Cliente Seleccionado</p>
                                <p className="font-bold text-slate-800">{selectedClient.razons || selectedClient.name}</p>
                                <p className="text-xs text-slate-500">{selectedClient.rfc}</p>
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={18}/></button>
                        </div>
                    )}
                </div>

                {/* Catálogo de Productos */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-black text-slate-800 flex items-center">
                            <Package className="mr-2 text-emerald-600" size={20} />
                            Catálogo de Productos
                        </h2>
                        {isLoadingData && <RefreshCw size={18} className="animate-spin text-slate-400" />}
                    </div>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar producto por nombre o código..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                            <button 
                                key={p.UID || p._id}
                                onClick={() => addToCart(p)}
                                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-emerald-100 rounded-2xl transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{p.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.code}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">${parseFloat(p.price).toFixed(2)}</p>
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase">+ IVA</p>
                                </div>
                            </button>
                        )) : (
                            <div className="col-span-2 py-10 text-center">
                                <Package className="mx-auto text-slate-200 mb-2" size={40} />
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No hay productos disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Carrito y Resumen */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center relative z-10">
                    <ShoppingCart className="mr-3 text-blue-400" size={24} />
                    Carrito de Venta
                </h2>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar-white relative z-10">
                    {cart.length > 0 ? cart.map(item => (
                        <div key={item.productExternalId} className="bg-white/5 border border-white/10 p-4 rounded-2xl group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="max-w-[150px]">
                                    <p className="font-bold text-sm truncate">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">${item.price.toFixed(2)} c/u</p>
                                </div>
                                <button onClick={() => removeFromCart(item.productExternalId)} className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center bg-white/10 rounded-xl overflow-hidden">
                                    <button onClick={() => updateQuantity(item.productExternalId, -1)} className="p-2 hover:bg-white/10 text-blue-400"><Minus size={14}/></button>
                                    <span className="px-3 font-black text-xs">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productExternalId, 1)} className="p-2 hover:bg-white/10 text-blue-400"><Plus size={14}/></button>
                                </div>
                                <p className="font-black text-blue-400">${item.subtotal.toFixed(2)}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">El carrito está vacío</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'].map(method => (
                                <button 
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === method ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>IVA (16%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                            <span className="text-sm font-black uppercase text-blue-400 tracking-widest">Total MXN</span>
                            <span className="text-3xl font-black tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {hasPermission('sales', 'create') && (
                        <button 
                            onClick={handleProcessSale}
                            disabled={isProcessing || cart.length === 0 || !selectedClient}
                            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-3"
                        >
                            {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CreditCard size={18} />}
                            <span>{isProcessing ? 'Procesando...' : 'Completar Venta'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Éxito */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-12 text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tight uppercase">¡Venta Exitosa!</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">La nota de venta ha sido generada correctamente</p>
                        
                        {/* Área de Impresión (Invisible) */}
                        <div id="ticket-print-area" className="hidden">
                            <div className="text-center">
                                <h3>SISTEMA DE VENTAS</h3>
                                <p>RFC: {lastSale?.clientRfc}</p>
                                <p>Folio: {lastSale?.folio}</p>
                                <p>Fecha: {new Date(lastSale?.createdAt).toLocaleString()}</p>
                                <hr />
                                <div className="text-left">
                                    {lastSale?.items.map((item, i) => (
                                        <div key={i} className="flex-between">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>${item.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <hr />
                                <div className="flex-between font-bold">
                                    <span>TOTAL:</span>
                                    <span>${lastSale?.total.toFixed(2)}</span>
                                </div>
                                <p className="text-center">¡Gracias por su compra!</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handlePrint} className="py-5 bg-slate-100 text-slate-700 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center space-x-2">
                                <Printer size={18} />
                                <span>Imprimir</span>
                            </button>
                            <button onClick={() => setShowSuccess(false)} className="py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">
                                Nueva Venta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketsSection;

import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle, User, Package, CreditCard, X, RefreshCw, AlertCircle } from 'lucide-react';

const TicketsSection = () => {
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
        // Usamos el ID de la API externa (UID o _id según lo que devuelva la API)
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
                ClaveProdServ: product.clavePS || product.ClaveProdServ || '01010101',
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
                            <div key={p.UID || p._id} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex justify-between items-center bg-white">
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.code}</p>
                                    <p className="text-sm font-black text-emerald-600 mt-1">${parseFloat(p.price).toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => addToCart(p)}
                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all ml-4"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-full py-10 text-center">
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No hay productos disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Carrito y Resumen */}
            <div className="xl:col-span-1 space-y-6 flex flex-col h-full">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full">
                    <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                        <ShoppingCart className="mr-2 text-rose-600" size={20} />
                        Nota de Venta
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
                                <ShoppingCart size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">Carrito Vacío</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.productExternalId} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-xl transition-all">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-black">${item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.productExternalId, -1)} className="p-1 hover:bg-white rounded-md transition-all"><Minus size={12}/></button>
                                            <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productExternalId, 1)} className="p-1 hover:bg-white rounded-md transition-all"><Plus size={12}/></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.productExternalId)} className="p-2 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">Subtotal</span>
                            <span className="font-black text-slate-800">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">IVA (16%)</span>
                            <span className="font-black text-slate-800">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-black text-slate-800 uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black text-rose-600">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Método de Pago</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => (
                                    <button 
                                        key={method}
                                        type="button"
                                        onClick={() => setPaymentMethod(method)}
                                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${paymentMethod === method ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            disabled={isProcessing || cart.length === 0 || !selectedClient}
                            onClick={handleProcessSale}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isProcessing || cart.length === 0 || !selectedClient ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:from-rose-700 hover:to-orange-600 shadow-rose-100 active:scale-95'}`}
                        >
                            {isProcessing ? 'Procesando...' : 'Emitir Ticket'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Éxito e Impresión */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">¡Venta Exitosa!</h2>
                            <p className="text-slate-500 font-medium mb-8">La nota de venta ha sido guardada con el folio <span className="text-blue-600 font-bold">{lastSale?.folio}</span></p>
                            
                            {/* Área de Impresión */}
                            <div id="ticket-print-area" className="hidden">
                                <div className="text-center">
                                    <h2 style={{margin:0}}>SISTEMA NEXUS</h2>
                                    <p style={{fontSize:'12px'}}>Comprobante de Venta</p>
                                    <hr/>
                                    <div className="flex-between"><span>Folio:</span> <span>{lastSale?.folio}</span></div>
                                    <div className="flex-between"><span>Fecha:</span> <span>{new Date(lastSale?.createdAt).toLocaleString()}</span></div>
                                    <hr/>
                                    <div className="text-center"><strong>CLIENTE</strong></div>
                                    <div className="text-center">{lastSale?.clientName}</div>
                                    <div className="text-center">{lastSale?.clientRfc}</div>
                                    <hr/>
                                    <div className="flex-between"><strong>ARTICULO</strong> <strong>TOTAL</strong></div>
                                    {lastSale?.items.map((item, i) => (
                                        <div key={i} className="flex-between">
                                            <span>{item.quantity}x {item.name.substring(0,15)}</span>
                                            <span>${item.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <hr/>
                                    <div className="flex-between"><span>Subtotal:</span> <span>${lastSale?.subtotal.toFixed(2)}</span></div>
                                    <div className="flex-between"><span>IVA (16%):</span> <span>${lastSale?.tax.toFixed(2)}</span></div>
                                    <div className="flex-between" style={{fontSize:'18px', fontWeight:'bold'}}><span>TOTAL:</span> <span>${lastSale?.total.toFixed(2)}</span></div>
                                    <hr/>
                                    <div className="text-center">Método: {lastSale?.paymentMethod}</div>
                                    <div className="text-center" style={{marginTop:'20px'}}>¡GRACIAS POR SU COMPRA!</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center justify-center space-x-2 bg-slate-800 text-white py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all"
                                >
                                    <Printer size={18} />
                                    <span>Imprimir</span>
                                </button>
                                <button 
                                    onClick={() => setShowSuccess(false)}
                                    className="bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketsSection;

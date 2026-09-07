import React from 'react';
import { FaShoppingCart, FaEnvelope, FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaRupeeSign } from 'react-icons/fa';
import axios from 'axios';

const Marketplace = () => {
  const farmerEmail = localStorage.getItem('userEmail');
  const farmerName = localStorage.getItem('userName');
  
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    search: ''
  });
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [orderForm, setOrderForm] = React.useState({
    quantity: 1,
    deliveryAddress: ''
  });
  const [requestForm, setRequestForm] = React.useState({
    message: ''
  });
  const [toast, setToast] = React.useState({ msg: '', type: 'success' });
  const [orderLoading, setOrderLoading] = React.useState(false);
  const [requestLoading, setRequestLoading] = React.useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  React.useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'All') params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      const res = await axios.get(`/api/user/marketplace/products?${params.toString()}`);
      let filteredProducts = res.data;
      
      if (filters.search) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setOrderForm({
      quantity: 1,
      deliveryAddress: ''
    });
    setShowOrderModal(true);
  };

  const handleSendRequest = (product) => {
    setSelectedProduct(product);
    setRequestForm({
      message: `Hi, I'm interested in ${product.name}. Could you please provide more details about pricing and availability?`
    });
    setShowRequestModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      await axios.post('/api/user/order', {
        farmerEmail,
        productId: selectedProduct._id,
        quantity: Number(orderForm.quantity),
        deliveryAddress: orderForm.deliveryAddress
      });
      showToast(`Order placed for ${orderForm.quantity}x ${selectedProduct.name}! The seller will confirm soon.`);
      setShowOrderModal(false);
      setSelectedProduct(null);
      // Reload products so quantity reflects the change
      setTimeout(loadProducts, 500);
    } catch (error) {
      console.error('Error placing order:', error);
      showToast(error.response?.data?.message || 'Error placing order. Please try again.', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      await axios.post('/api/user/request', {
        farmerEmail,
        productId: selectedProduct._id,
        message: requestForm.message
      });
      showToast('Your enquiry has been sent to the seller!');
      setShowRequestModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error sending request:', error);
      showToast(error.response?.data?.message || 'Error sending request. Please try again.', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  const calculateDiscountedPrice = (product) => {
    const discountAmount = (product.price * product.discount) / 100;
    return product.price - discountAmount;
  };

  if (!farmerEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <div className="text-2xl font-bold text-[#2F855A] mb-2">Please log in</div>
          <a href="/login" className="text-[#2F855A] font-semibold underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Toast notification */}
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          borderRadius: 10, padding: '12px 20px', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', maxWidth: 380
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'} {toast.msg}</span>
          <button onClick={() => setToast({ msg: '', type: 'success' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'inherit' }}>×</button>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F855A]">Marketplace</h1>
              <p className="text-gray-600 mt-1">Discover agricultural products and services</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {farmerName}</span>
              <a href="/farmer-dashboard" className="bg-[#2F855A] text-white px-4 py-2 rounded-lg">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <FaFilter className="mr-2 text-[#2F855A]" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A]"
              >
                <option value="All">All Categories</option>
                <option value="Seed">Seed</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Machinery">Machinery</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A]"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500">No products found matching your criteria.</div>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {product.imagePath && (
                  <img 
                    src={product.imagePath} 
                    alt={product.name} 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <span className="px-2 py-1 bg-[#2F855A]/10 text-[#2F855A] text-xs rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center mb-2">
                    <FaMapMarkerAlt className="text-gray-400 mr-1 text-sm" />
                    <span className="text-sm text-gray-600">{product.ownerId?.city || 'Location not specified'}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600">Seller: </span>
                    <span className="text-sm font-medium text-gray-800 ml-1">{product.ownerId?.agroName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.discount > 0 ? (
                        <div>
                          <div className="text-lg font-bold text-[#2F855A]">
                            ₹{calculateDiscountedPrice(product)}
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            ₹{product.price}
                          </div>
                          <div className="text-xs text-red-600">
                            -{product.discount}% off
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-[#2F855A]">₹{product.price}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Stock: {product.quantity} kg
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 bg-[#2F855A] text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center hover:bg-[#246a46] transition-colors"
                    >
                      <FaShoppingCart className="mr-1" />
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleSendRequest(product)}
                      className="flex-1 bg-[#D69E2E] text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center hover:bg-[#B7791F] transition-colors"
                    >
                      <FaEnvelope className="mr-1" />
                      Enquiry
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowOrderModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">Place Order</h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedProduct.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#2F855A]">
                  ₹{calculateDiscountedPrice(selectedProduct)}/kg
                </span>
                {selectedProduct.discount > 0 && (
                  <span className="text-sm text-red-600">-{selectedProduct.discount}% off</span>
                )}
              </div>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.quantity}
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Available: {selectedProduct.quantity} kg in stock</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  value={orderForm.deliveryAddress}
                  onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg"
                  rows="3"
                  placeholder="Enter your delivery address"
                  required
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-[#2F855A]">
                    ₹{(calculateDiscountedPrice(selectedProduct) * orderForm.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-[#2F855A] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#246a46] transition-all duration-200"
                style={{ opacity: orderLoading ? 0.7 : 1 }}
              >
                {orderLoading ? 'Placing Order…' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowRequestModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">Send Enquiry</h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedProduct.category}</p>
              <p className="text-sm text-gray-600">Seller: {selectedProduct.ownerId?.agroName}</p>
            </div>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Message</label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-[#2F855A] text-lg"
                  rows="4"
                  placeholder="Ask about pricing, availability, or any other details..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={requestLoading}
                className="w-full bg-[#D69E2E] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#B7791F] transition-all duration-200"
                style={{ opacity: requestLoading ? 0.7 : 1 }}
              >
                {requestLoading ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

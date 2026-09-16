import React, { useState, useEffect } from 'react';
import './index.css';

// API Services
import { fetchCategories, fetchProducts, submitOrder, submitCustomCakeRequest, checkOrderStatus } from './api';

// Reusable Components
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PaymentTemplateModal from './components/PaymentTemplateModal';
import CustomCakeBuilder from './components/CustomCakeBuilder';
import OrderTracker from './components/OrderTracker';
import QuickSearchModal from './components/QuickSearchModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';
import { SkeletonGrid } from './components/SkeletonLoader';
import { EmptyState, ErrorState } from './components/States';

export default function App() {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  
  // State management
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('srb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('srb_favs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentPortalOpen, setIsPaymentPortalOpen] = useState(false);
  const [paymentPortalInitialData, setPaymentPortalInitialData] = useState(null);
  const [checkoutTotals, setCheckoutTotals] = useState({ subtotal: 0, discount: 0, deliveryCharge: 0, grandTotal: 0 });

  // Custom cake success reference
  const [customSuccessId, setCustomSuccessId] = useState(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('srb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('srb_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Keyboard Command+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load backend data
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      
      const defaultCats = cats.length ? cats : [
        { name: 'all', category_name: 'All' },
        { name: 'cakes', category_name: 'Cakes' },
        { name: 'bento', category_name: 'Bento Cakes' },
        { name: 'brownies', category_name: 'Brownies' },
        { name: 'tubs', category_name: 'Dessert Tubs' }
      ];

      const defaultProds = prods.length ? prods : [
        { 
          name: '1', 
          product_name: 'Signature Chocolate Truffle Cake', 
          starting_price: 650, 
          short_description: '500g layered dark chocolate ganache made with 70% Belgian Cocoa & moist chocolate sponge.', 
          category: 'Cakes', 
          product_weight_label: '500g / 1.1 lbs',
          default_egg_type: 'Eggless',
          serves: '4-6 Servings',
          thumbnail_image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', 
          is_featured: 1 
        },
        { 
          name: '2', 
          product_name: 'Red Velvet Bento Cake', 
          starting_price: 350, 
          short_description: '250g mini celebration bento cake with rich Philadelphia cream cheese frosting.', 
          category: 'Bento Cakes', 
          product_weight_label: '250g Bento',
          default_egg_type: 'Eggless',
          serves: '1-2 Servings',
          thumbnail_image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600' 
        },
        { 
          name: '3', 
          product_name: 'Belgian Fudge Brownie Box (6 Pcs)', 
          starting_price: 490, 
          short_description: 'Box of 6 fudgy, crinkly-top dark chocolate brownies infused with pure butter.', 
          category: 'Brownies', 
          product_weight_label: 'Box of 6 Pcs',
          default_egg_type: 'Egg',
          serves: '3-6 Servings',
          thumbnail_image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', 
          is_featured: 1 
        },
        { 
          name: '4', 
          product_name: 'Lotus Biscoff Brownie Box (6 Pcs)', 
          starting_price: 540, 
          short_description: 'Box of 6 signature brownies topped with thick Lotus Biscoff spread and crushed cookies.', 
          category: 'Brownies', 
          product_weight_label: 'Box of 6 Pcs',
          default_egg_type: 'Eggless',
          serves: '3-6 Servings',
          thumbnail_image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600',
          is_featured: 1
        },
        { 
          name: '5', 
          product_name: 'Alphonso Mango Dessert Tub', 
          starting_price: 280, 
          short_description: '350ml tub with fresh Alphonso mango pulp, vanilla sponge, and whipped cream layers.', 
          category: 'Dessert Tubs', 
          product_weight_label: '350ml Tub',
          default_egg_type: 'Eggless',
          serves: '1-2 Servings',
          thumbnail_image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600' 
        },
        { 
          name: '6', 
          product_name: 'Salted Caramel Cake Tub', 
          starting_price: 320, 
          short_description: '350ml layered tub of vanilla cake, housemade sea salted caramel, and roasted pecans.', 
          category: 'Dessert Tubs', 
          product_weight_label: '350ml Tub',
          default_egg_type: 'Eggless',
          serves: '1-2 Servings',
          thumbnail_image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600' 
        }
      ];

      setProducts(defaultProds);

      // Only display categories with at least 1 product
      const activeCatNames = new Set(defaultProds.map(p => p.category || p.category_name));
      const availableCats = (cats.length ? cats : [
        { name: 'all', category_name: 'All' },
        { name: 'cakes', category_name: 'Cakes' },
        { name: 'bento', category_name: 'Bento Cakes' },
        { name: 'brownies', category_name: 'Brownies' },
        { name: 'tubs', category_name: 'Dessert Tubs' }
      ]).filter(c => c.category_name === 'All' || c.name === 'all' || activeCatNames.has(c.category_name || c.name));

      setCategories(availableCats);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to compute effective unit price of a product
  const getProductUnitPrice = (product) => {
    const base = parseFloat(product.starting_price) || 0;
    const offer = parseFloat(product.offer_price) || 0;
    return (offer > 0 && offer !== base) ? offer : base;
  };

  // Cart operations
  const handleAddToCart = (product) => {
    const unitPrice = getProductUnitPrice(product);
    const itemQty = product.qty || 1;

    setCart(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => item.name === product.name ? { ...item, qty: item.qty + itemQty } : item);
      }
      return [...prev, { ...product, starting_price: unitPrice, unit_price: unitPrice, qty: itemQty }];
    });
    addToast(`Added "${product.product_name}" to your cart!`, 'success');
  };

  const updateCartQty = (name, delta) => {
    setCart(prev => 
      prev
        .map(item => {
          if (item.name === name) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter(item => item.qty > 0)
    );
  };

  const removeCartItem = (name) => {
    setCart(prev => prev.filter(item => item.name !== name));
    addToast("Item removed from cart", 'info');
  };

  // Favorites toggle
  const toggleFavorite = (name) => {
    setFavorites(prev => {
      if (prev.includes(name)) {
        addToast("Removed from saved favorites", 'info');
        return prev.filter(id => id !== name);
      }
      addToast("Saved to your favorites ❤️", 'success');
      return [...prev, name];
    });
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unit_price || getProductUnitPrice(item)) * item.qty, 0);

  // Submissions
  const handleProceedCheckout = (totals) => {
    setCheckoutTotals(totals);
    setIsCheckoutOpen(true);
  };

  const handleFinalOrderSubmit = async (formData) => {
    const orderItems = cart.map(i => ({
      product: i.name,
      product_name: i.product_name,
      product_category: i.category || i.category_name || '',
      qty: i.qty,
      unit_price: i.unit_price || getProductUnitPrice(i)
    }));

    const paymentsPayload = formData.upi_transaction_id || formData.payment_proof_image || formData.payment_method ? [
      {
        payment_method: formData.payment_method || 'UPI',
        amount: checkoutTotals.grandTotal,
        payment_date: formData.delivery_date || new Date().toISOString().split('T')[0],
        payment_status: formData.payment_method === 'UPI' ? 'Needs Verification' : 'Pending',
        utr_number: formData.upi_transaction_id || '',
        payment_proof_image: formData.payment_proof_image || '',
        notes: formData.customer_notes || 'Website Checkout'
      }
    ] : [];


    const payload = {
      ...formData,
      order_source: 'Website',
      order_type: 'Standard',
      delivery_type: 'Delivery',
      order_status: 'Placed',
      payment_status: formData.payment_method === 'UPI' && formData.upi_transaction_id ? 'Needs Verification' : 'Pending',
      items: orderItems,
      payments: paymentsPayload
    };

    try {
      const res = await submitOrder(payload);
      const createdId = res.data ? res.data.name : 'SRB-ORD-' + Math.floor(Math.random()*90000 + 10000);
      setCart([]);
      setIsCheckoutOpen(false);
      addToast(`🎉 Order Placed Successfully! Reference ID: ${createdId}`, 'success');
      setActiveTab('track');
    } catch (err) {
      addToast("Failed to submit order. Please check backend connection.", 'error');
    }
  };

  const handleCustomCakeSubmit = async (formData) => {
    const payload = {
      customer_name: formData.customer_name,
      mobile_number: formData.mobile_number,
      email: formData.email,
      source: 'Website',
      delivery_type: 'Delivery',
      delivery_date: formData.delivery_date,
      flavour: formData.cake_flavour,
      weight_requirement: `${formData.cake_weight_kg} Kg`,
      cake_theme_description: formData.cake_theme,
      design_name: formData.cake_theme,
      address_line_1: formData.address_line_1,
      pincode: formData.pincode,
      status: 'New'
    };

    const res = await submitCustomCakeRequest(payload);
    if (res && res.data && res.data.name) {
      setCustomSuccessId(res.data.name);
      addToast(`🎂 Custom Cake Inquiry Received! ID: ${res.data.name}`, 'success');
    } else {
      setCustomSuccessId('CCR-' + Math.floor(Math.random()*10000));
      addToast("Inquiry recorded successfully!", 'success');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All'
      ? true
      : (p.category === selectedCategory || p.category_name === selectedCategory);

    const q = menuSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.short_description && p.short_description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.default_egg_type && p.default_egg_type.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });


  const favoriteProducts = products.filter(p => favorites.includes(p.name));

  return (
    <div className="srb-app">
      {/* Toast Feedback System */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((a, b) => a + b.qty, 0)}
        favoritesCount={favorites.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPaymentPortal={() => setIsPaymentPortalOpen(true)}
      />

      {/* Main Pages */}
      {activeTab === 'menu' && (
        <>
          {/* Top Bar Header (Reference: Menu - Ovenly Atelier - Order Now) */}
          <header className="srb-atelier-hero animate-fade">
            <div className="srb-hero-full-bg">
              <img 
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1600&auto=format&fit=crop" 
                alt="Freshly baked butter croissants"
                className="srb-hero-bg-img"
              />
              <div className="srb-hero-gradient-overlay" />
              
              <div className="srb-container srb-hero-content-wrapper">
                <div className="srb-hero-badge-tag">Freshly baked every sunrise</div>
                
                <h1 className="srb-hero-serif-title">
                  Crafted with warmth,<br />
                  butter & love.
                </h1>
                
                <p className="srb-hero-serif-sub">
                  Artisan breads, buttery pastries, and handcrafted cakes baked fresh every morning using slow fermentation and premium ingredients.
                </p>

                <div className="srb-hero-cta-row">
                  <button 
                    className="srb-btn srb-btn-pill-primary"
                    onClick={() => document.getElementById('bestsellers-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Explore Menu
                  </button>
                  <button 
                    className="srb-btn srb-btn-pill-outline"
                    onClick={() => setActiveTab('custom')}
                  >
                    Custom Cakes
                  </button>
                </div>

                <div className="srb-badge-stamp">
                  <span className="srb-stamp-year">EST. 1988</span>
                  <span className="srb-stamp-text">HANDMADE DAILY</span>
                </div>
              </div>

              {/* Curved Bottom Wave / Divider */}
              <div className="srb-hero-wave-divider">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0,0 C480,100 960,100 1440,0 L1440,120 L0,120 Z" fill="var(--bg-cream)"></path>
                </svg>
              </div>
            </div>
          </header>

          {/* Section 1: Our Best Sellers (Featured Favorites) */}
          <section id="bestsellers-section" className="srb-section srb-container animate-fade">
            <div className="srb-section-header text-center">
              <span className="srb-sub-heading">FEATURED FAVORITES</span>
              <h2 className="srb-serif-heading">Our Best Sellers</h2>
              <p className="srb-serif-lead">The pastries our guests return for every morning.</p>
            </div>

            {loading ? (
              <SkeletonGrid count={3} />
            ) : (
              <div className="srb-bestseller-grid">
                {products.slice(0, 3).map(product => {
                  const cartItem = cart.find(i => i.name === product.name);
                  return (
                    <ProductCard 
                      key={product.name}
                      product={product}
                      onAddToCart={handleAddToCart}
                      cartQty={cartItem ? cartItem.qty : 0}
                      onUpdateQty={updateCartQty}
                      isFavorite={favorites.includes(product.name)}
                      onToggleFavorite={toggleFavorite}
                      onSelectProduct={(p) => setSelectedProductModal(p)}
                    />
                  );
                })}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button 
                className="srb-btn srb-btn-serif-link"
                onClick={() => document.getElementById('full-menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Full Menu ▾
              </button>
            </div>
          </section>

          {/* Section 2: Baking happiness every single morning */}
          <section className="srb-section srb-happiness-section">
            <div className="srb-container srb-happiness-grid">
              <div className="srb-happiness-left">
                <span className="srb-sub-heading">DAILY SPIRIT</span>
                <h2 className="srb-serif-heading">
                  Baking happiness every single morning.
                </h2>
                <div className="srb-happiness-img-box">
                  <img 
                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop" 
                    alt="Baker hands kneading dough"
                    className="srb-organic-img"
                  />
                </div>
              </div>

              <div className="srb-happiness-right">
                <div className="srb-story-card">
                  <p>
                    Every morning before sunrise, our bakers begin the quiet ritual of creating fresh pastries the way they were meant to be made—slowly, carefully, with attention.
                  </p>
                  <p>
                    We use only non-GMO organic flour, European butter, and stone-ground spices. Every croissant fold, sourdough loaf, and cake sponge is shaped by hand, raised with patience.
                  </p>
                  <p className="srb-highlight-quote">
                    This isn't just baking. This is a morning ritual. This is our gift to you.
                  </p>
                </div>

                <div className="srb-happiness-side-img">
                  <img 
                    src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=600&auto=format&fit=crop" 
                    alt="Dusting flour on artisan bread"
                    className="srb-organic-img-vertical"
                  />
                </div>
              </div>
            </div>

            {/* Stat Counters Bar */}
            <div className="srb-container srb-stats-bar">
              <div className="srb-stat-item">
                <div className="srb-stat-number">10+</div>
                <div className="srb-stat-label">YEARS EXPERIENCE</div>
              </div>
              <div className="srb-stat-item">
                <div className="srb-stat-number">5K+</div>
                <div className="srb-stat-label">LOAVES MONTHLY</div>
              </div>
              <div className="srb-stat-item">
                <div className="srb-stat-number">100%</div>
                <div className="srb-stat-label">HANDMADE</div>
              </div>
              <div className="srb-stat-item">
                <div className="srb-stat-number">1K+</div>
                <div className="srb-stat-label">HAPPY CUSTOMERS</div>
              </div>
            </div>
          </section>

          {/* Section 3: Why people return every morning */}
          <section className="srb-section srb-why-section">
            <div className="srb-container">
              <div className="srb-section-header text-center">
                <h2 className="srb-serif-heading">Why people return every morning</h2>
              </div>

              <div className="srb-pillars-grid">
                <div className="srb-pillar-card">
                  <div className="srb-pillar-icon">🥐</div>
                  <h3>Fresh Daily</h3>
                  <p>Every pastry is baked before sunrise. Never frozen, never preserved. Pure fresh goodness.</p>
                </div>
                <div className="srb-pillar-card">
                  <div className="srb-pillar-icon">🌾</div>
                  <h3>Organic Ingredients</h3>
                  <p>We source only organic flour, French AOP butter, and seasonal fruits from local farms.</p>
                </div>
                <div className="srb-pillar-card">
                  <div className="srb-pillar-icon">⏳</div>
                  <h3>Slow Fermented</h3>
                  <p>Our sourdough ferments for 48 hours for rich flavor, easy digestion, and perfect crust.</p>
                </div>
                <div className="srb-pillar-card">
                  <div className="srb-pillar-icon">💛</div>
                  <h3>Handmade Passion</h3>
                  <p>Every cake is shaped by hand, baked with love, and decorated by our master pastaios.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Full Menu & Handcrafted Collection */}
          <section id="full-menu-section" className="srb-section srb-container">
            <div className="srb-section-header text-center" style={{ marginBottom: '2rem' }}>
              <span className="srb-sub-heading">CATEGORY MENU</span>
              <h2 className="srb-serif-heading">Discover our handcrafted collection</h2>
            </div>

            <div className="srb-category-pills" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
              {categories.map(c => {
                const catName = c.category_name || c.name;
                const isAll = catName === 'all' || catName === 'All';
                const label = isAll ? 'All Bakes' : catName;

                return (
                  <button 
                    key={c.name || catName}
                    className={`srb-pill-btn ${selectedCategory === catName || (selectedCategory === 'All' && isAll) ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(isAll ? 'All' : catName)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <SkeletonGrid count={6} />
            ) : errorMsg ? (
              <ErrorState message={errorMsg} onRetry={loadData} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState 
                icon="🔍"
                title="No Products Found"
                description={`We couldn't find any bakes matching your selection.`}
                actionText="Reset All Filters"
                onAction={() => { setSelectedCategory('All'); setMenuSearchQuery(''); }}
              />
            ) : (

              <div className="srb-product-grid">
                {filteredProducts.map(product => {
                  const cartItem = cart.find(i => i.name === product.name);
                  return (
                    <ProductCard 
                      key={product.name}
                      product={product}
                      onAddToCart={handleAddToCart}
                      cartQty={cartItem ? cartItem.qty : 0}
                      onUpdateQty={updateCartQty}
                      isFavorite={favorites.includes(product.name)}
                      onToggleFavorite={toggleFavorite}
                      onSelectProduct={(p) => setSelectedProductModal(p)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Custom Cake Wizard */}
      {activeTab === 'custom' && (
        <main className="srb-container animate-fade" style={{ padding: '4rem 1.5rem' }}>
          {customSuccessId ? (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Custom Cake Inquiry Received!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Reference ID: <strong style={{ color: 'var(--primary)' }}>{customSuccessId}</strong></p>
              <p style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>Our head baker will review your theme, flavor, and delivery details and contact you on WhatsApp with a personalized price quote.</p>
              <button className="srb-btn srb-btn-primary" onClick={() => { setCustomSuccessId(null); setActiveTab('menu'); }}>
                Return to Bakery Menu
              </button>
            </div>
          ) : (
            <CustomCakeBuilder onSubmitCustomCake={handleCustomCakeSubmit} addToast={addToast} />
          )}
        </main>
      )}

      {/* Real-time Order Tracker */}
      {activeTab === 'track' && (
        <OrderTracker onTrackOrder={checkOrderStatus} loading={false} />
      )}

      {/* Saved Favorites Page */}
      {activeTab === 'favorites' && (
        <main className="srb-container animate-fade" style={{ padding: '4rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Your Saved Favorites ❤️</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Quickly access your bookmarked cakes and desserts.</p>

          {favoriteProducts.length === 0 ? (
            <EmptyState 
              icon="❤️"
              title="No Favorites Saved Yet"
              description="Click the heart icon on any cake or bake card to save it here for quick access."
              actionText="Explore Bakery Menu"
              onAction={() => setActiveTab('menu')}
            />
          ) : (
            <div className="srb-product-grid">
              {favoriteProducts.map(product => (
                <ProductCard 
                  key={product.name}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer 
        isOpen={activeTab === 'cart'} 
        onClose={() => setActiveTab('menu')}
        cart={cart}
        updateQty={updateCartQty}
        removeItem={removeCartItem}
        onCheckout={handleProceedCheckout}
        subtotal={cartSubtotal}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartTotals={checkoutTotals}
        onSubmitOrder={handleFinalOrderSubmit}
        onOpenPaymentPortal={(data) => {
          setPaymentPortalInitialData(data);
          setIsPaymentPortalOpen(true);
        }}
      />

      {/* Standalone Redesigned Payment Portal Modal */}
      <PaymentTemplateModal
        isOpen={isPaymentPortalOpen}
        onClose={() => {
          setIsPaymentPortalOpen(false);
          setPaymentPortalInitialData(null);
        }}
        initialData={paymentPortalInitialData || {
          totalAmount: checkoutTotals.grandTotal || 500,
          amountPaid: checkoutTotals.grandTotal || 500
        }}
        onSavePayment={async (paymentData) => {
          const payload = {
            customer_name: paymentData.customer_name,
            mobile_number: paymentData.mobile_number,
            email: paymentData.email || '',
            address: paymentData.address || '',
            pincode: paymentData.pincode || '',
            order_source: 'Website',
            order_type: 'Standard',
            delivery_type: 'Delivery',
            delivery_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
            order_status: 'Placed',
            payment_status: paymentData.payment_status || 'Paid',
            items: cart.length ? cart.map(i => ({ product_name: i.product_name, qty: i.qty, unit_price: i.starting_price || 500 })) : [{ product_name: 'Custom Order', qty: 1, unit_price: paymentData.total_amount }],
            subtotal: paymentData.total_amount,
            grand_total: paymentData.total_amount,
            amount_paid: paymentData.amount_paid,
            upi_transaction_id: paymentData.transaction_ref || '',
            payment_proof_image: paymentData.payment_proof_image || '',
            payments: [
              {
                payment_method: paymentData.payment_method || 'UPI',
                amount: paymentData.amount_paid,
                payment_date: paymentData.payment_date,
                payment_status: paymentData.payment_status,
                utr_number: paymentData.transaction_ref || '',
                payment_proof_image: paymentData.payment_proof_image || '',
                notes: paymentData.notes || 'Recorded via Payment Portal'
              }
            ]
          };
          await submitOrder(payload);
          setCart([]);
          addToast(`🎉 Payment of ₹${paymentData.amount_paid} recorded & stored in Payment Child Table for ${paymentData.customer_name}!`, 'success');
          setActiveTab('track');
        }}
      />

      {/* Product Detail Modal */}
      {selectedProductModal && (
        <ProductDetailModal
          productName={selectedProductModal.name}
          initialProduct={selectedProductModal}
          isOpen={!!selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={handleAddToCart}
          cartQty={cart.find(i => i.name === selectedProductModal.name)?.qty || 0}
          onUpdateQty={updateCartQty}
        />
      )}

      {/* Quick Search Command Modal */}
      <QuickSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProductModal(p)}
        onAddToCart={handleAddToCart}
        cart={cart}
        onUpdateQty={updateCartQty}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

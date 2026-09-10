/* =============================================
   WATEMURA — Cart & State Management
   Persistent via localStorage
   ============================================= */

const CART_KEY = 'watemura_cart';
const WISHLIST_KEY = 'watemura_wishlist';

/* ─── Cart ─── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadges();
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.variant === (product.variant || null));
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, product.stock || 99);
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showToast(`« ${product.name} » ajouté au panier`, 'success');
  return cart;
}

function removeFromCart(id, variant = null) {
  const cart = getCart().filter(i => !(i.id === id && i.variant === variant));
  saveCart(cart);
}

function updateQty(id, qty, variant = null) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.variant === variant);
  if (!item) return;
  if (qty <= 0) { removeFromCart(id, variant); return; }
  item.qty = qty;
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadges() {
  const count = getCartCount();
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    el.textContent = count;
    el.hidden = count === 0;
  });
}

/* ─── Wishlist ─── */
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
}
function toggleWishlist(id) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx > -1) { list.splice(idx, 1); showToast('Retiré des favoris'); }
  else { list.push(id); showToast('Ajouté aux favoris ♡', 'info'); }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  document.querySelectorAll(`[data-wishlist-id="${id}"]`).forEach(el => {
    el.classList.toggle('active', list.includes(id));
    el.setAttribute('aria-pressed', list.includes(id));
  });
  return list;
}
function isWishlisted(id) { return getWishlist().includes(id); }

/* ─── Toasts ─── */
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 300ms ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

/* ─── Price format ─── */
function formatPrice(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);
}

/* ─── Init badges on any page ─── */
document.addEventListener('DOMContentLoaded', updateCartBadges);

window.WatemuraCart = { getCart, addToCart, removeFromCart, updateQty, clearCart, getCartTotal, getCartCount, toggleWishlist, isWishlisted, formatPrice, showToast };

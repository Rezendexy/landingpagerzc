(function () {
  var STORAGE_KEY = 'rzc_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function persist(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = cart.filter(function (i) { return i.key === item.key; })[0];
    if (existing) existing.qty += item.qty || 1;
    else cart.push(Object.assign({ qty: 1 }, item));
    persist(cart);
    openPanel();
  }

  function removeItem(key) {
    persist(getCart().filter(function (i) { return i.key !== key; }));
  }

  function changeQty(key, delta) {
    var cart = getCart();
    var item = cart.filter(function (i) { return i.key === key; })[0];
    if (!item) return;
    item.qty += delta;
    persist(item.qty <= 0 ? cart.filter(function (i) { return i.key !== key; }) : cart);
  }

  function formatBRL(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseBRL(str) {
    if (typeof str === 'number') return str;
    var n = parseFloat(String(str || '').replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  var panelEl, badgeEl, cartBtn;

  function buildPanel() {
    panelEl = document.createElement('div');
    panelEl.className = 'cart-panel';
    panelEl.id = 'cart-panel';
    panelEl.hidden = true;
    panelEl.setAttribute('role', 'dialog');
    panelEl.setAttribute('aria-label', 'Carrinho de compras');
    panelEl.innerHTML =
      '<div class="cart-panel-head"><strong>Seu carrinho</strong>' +
      '<button type="button" class="cart-close" aria-label="Fechar carrinho">&times;</button></div>' +
      '<div class="cart-items"></div>' +
      '<div class="cart-panel-foot">' +
        '<div class="cart-total-row"><span>Total</span><span class="cart-total-value">R$ 0,00</span></div>' +
        '<a class="btn-checkout" href="contato.html">Finalizar pedido</a>' +
      '</div>';
    cartBtn.insertAdjacentElement('afterend', panelEl);
    panelEl.querySelector('.cart-close').addEventListener('click', closePanel);
    panelEl.querySelector('.cart-items').addEventListener('click', onItemsClick);
  }

  function onItemsClick(e) {
    var row = e.target.closest('.cart-item');
    if (!row) return;
    var key = row.dataset.key;
    if (e.target.matches('.cart-item-remove')) removeItem(key);
    else if (e.target.matches('[data-action="inc"]')) changeQty(key, 1);
    else if (e.target.matches('[data-action="dec"]')) changeQty(key, -1);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  function renderCart() {
    var cart = getCart();
    var count = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
    if (badgeEl) {
      badgeEl.textContent = count;
      badgeEl.hidden = count === 0;
    }
    if (!panelEl) return;
    var itemsEl = panelEl.querySelector('.cart-items');
    var totalEl = panelEl.querySelector('.cart-total-value');
    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
    } else {
      itemsEl.innerHTML = cart.map(function (i) {
        return (
          '<div class="cart-item" data-key="' + escapeHtml(i.key) + '">' +
            '<img src="' + escapeHtml(i.image) + '" alt="">' +
            '<div class="cart-item-info">' +
              '<div class="cart-item-name">' + escapeHtml(i.name) + '</div>' +
              '<div class="cart-item-meta">' + (i.size ? ('Tam. ' + escapeHtml(i.size) + ' · ') : '') + formatBRL(i.price) + '</div>' +
              '<div class="cart-item-qty">' +
                '<button type="button" class="qty-btn" data-action="dec" aria-label="Diminuir quantidade">−</button>' +
                '<span>' + i.qty + '</span>' +
                '<button type="button" class="qty-btn" data-action="inc" aria-label="Aumentar quantidade">+</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="cart-item-remove" aria-label="Remover item">&times;</button>' +
          '</div>'
        );
      }).join('');
    }
    var total = cart.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
    totalEl.textContent = formatBRL(total);
  }

  function openPanel() {
    if (!panelEl) buildPanel();
    renderCart();
    panelEl.hidden = false;
    document.addEventListener('click', onOutsideClick, true);
    document.addEventListener('keydown', onEscape);
  }
  function closePanel() {
    if (panelEl) panelEl.hidden = true;
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('keydown', onEscape);
  }
  function togglePanel() {
    if (panelEl && !panelEl.hidden) closePanel();
    else openPanel();
  }
  function onOutsideClick(e) {
    if (panelEl && !panelEl.contains(e.target) && e.target !== cartBtn && !cartBtn.contains(e.target)) closePanel();
  }
  function onEscape(e) { if (e.key === 'Escape') closePanel(); }

  function init() {
    cartBtn = document.querySelector('.nav-cart');
    if (!cartBtn) return;
    cartBtn.style.position = 'relative';
    badgeEl = document.createElement('span');
    badgeEl.className = 'cart-badge';
    badgeEl.hidden = true;
    cartBtn.appendChild(badgeEl);
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      togglePanel();
    });
    renderCart();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.RZCCart = { addToCart: addToCart, formatBRL: formatBRL, parseBRL: parseBRL };
})();

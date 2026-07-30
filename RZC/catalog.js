(function () {
  function cardData(card) {
    var img = card.querySelector('.card-media img');
    var name = card.querySelector('.card-name');
    var price = card.querySelector('.card-price');
    var installment = card.querySelector('.card-installment');
    var old = card.querySelector('.card-old');
    return {
      name: name ? name.textContent.trim() : '',
      price: price ? price.textContent.trim() : '',
      installment: installment ? installment.textContent.trim() : '',
      old: old ? old.textContent.trim() : '',
      image: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : ''
    };
  }

  function wireCards() {
    var cards = document.querySelectorAll('.product-grid .card');
    cards.forEach(function (card) {
      card.tabIndex = 0;
      card.setAttribute('role', 'link');
      var go = function () {
        var d = cardData(card);
        var params = new URLSearchParams({
          name: d.name, price: d.price, installment: d.installment,
          old: d.old, image: d.image, alt: d.alt
        });
        window.location.href = 'produto.html?' + params.toString();
      };
      card.addEventListener('click', go);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  }

  function populateProductPage() {
    var buyCard = document.querySelector('.buy-card');
    if (!buyCard) return;
    var params = new URLSearchParams(window.location.search);
    if (!params.has('name')) return;

    var titleEl = document.querySelector('.product-title');
    var priceEl = document.querySelector('.buy-price');
    var instEl = document.querySelector('.buy-installment');
    var oldEl = document.querySelector('.buy-old');
    var imgEl = document.querySelector('.shoe-stage img');

    if (titleEl) titleEl.textContent = params.get('name') || '';
    if (priceEl) priceEl.textContent = params.get('price') || '';
    if (instEl) instEl.textContent = params.get('installment') || '';
    var oldVal = params.get('old');
    if (oldEl) {
      if (oldVal) { oldEl.textContent = oldVal; oldEl.hidden = false; }
      else { oldEl.hidden = true; }
    }
    if (imgEl) {
      var src = params.get('image');
      if (src) imgEl.setAttribute('src', src);
      imgEl.setAttribute('alt', params.get('alt') || params.get('name') || '');
    }

    buyCard.dataset.name = params.get('name') || '';
    buyCard.dataset.price = params.get('price') || '';
    buyCard.dataset.image = (imgEl && imgEl.getAttribute('src')) || '';
  }

  function wireAddToCart() {
    var btn = document.querySelector('.buy-add');
    var buyCard = document.querySelector('.buy-card');
    if (!btn || !buyCard || !window.RZCCart) return;
    btn.addEventListener('click', function () {
      var select = buyCard.querySelector('.buy-select');
      var size = select && select.selectedIndex > 0 ? select.value : '';
      if (select && !size) {
        select.focus();
        select.style.borderColor = 'var(--red)';
        return;
      }
      var titleEl = document.querySelector('.product-title');
      var priceEl = document.querySelector('.buy-price');
      var imgEl = document.querySelector('.shoe-stage img');
      var name = buyCard.dataset.name || (titleEl && titleEl.textContent.trim()) || '';
      var priceText = buyCard.dataset.price || (priceEl && priceEl.textContent.trim()) || '';
      var image = buyCard.dataset.image || (imgEl && imgEl.getAttribute('src')) || '';
      window.RZCCart.addToCart({
        key: name + '|' + size,
        name: name,
        price: window.RZCCart.parseBRL(priceText),
        image: image,
        size: size
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireCards();
    populateProductPage();
    wireAddToCart();
  });
})();

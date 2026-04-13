gsap.registerPlugin(ScrollTrigger);

// ===== DATA =====
const images = [
  { full: './images/image-product-1.jpg', thumb: './images/image-product-1-thumbnail.jpg' },
  { full: './images/image-product-2.jpg', thumb: './images/image-product-2-thumbnail.jpg' },
  { full: './images/image-product-3.jpg', thumb: './images/image-product-3-thumbnail.jpg' },
  { full: './images/image-product-4.jpg', thumb: './images/image-product-4-thumbnail.jpg' },
];

let currentIndex = 0;
let lightboxIndex = 0;
let quantity = 0;
let cartItems = [];

// ===== ELEMENTS =====
const mainImage       = document.getElementById('mainImage');
const thumbnails      = document.querySelectorAll('#thumbnails .thumb');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const decreaseQty     = document.getElementById('decreaseQty');
const increaseQty     = document.getElementById('increaseQty');
const qtyValue        = document.getElementById('qtyValue');
const addToCart       = document.getElementById('addToCart');
const cartBtn         = document.getElementById('cartBtn');
const cartBadge       = document.getElementById('cartBadge');
const cartDropdown    = document.getElementById('cartDropdown');
const cartEmpty       = document.getElementById('cartEmpty');
const cartItemsEl     = document.getElementById('cartItems');
const cartCheckout    = document.getElementById('cartCheckout');
const lightbox        = document.getElementById('lightbox');
const lightboxImage   = document.getElementById('lightboxImage');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxThumbs  = document.querySelectorAll('#lightboxThumbs .thumb');
const hamburger       = document.getElementById('hamburger');
const mobileNav       = document.getElementById('mobileNav');
const mobileOverlay   = document.getElementById('mobileOverlay');
const closeMenu       = document.getElementById('closeMenu');
const header          = document.getElementById('header');
const toast           = document.getElementById('toast');
const mainImageWrapper = document.querySelector('.main-image-wrapper');

// ===== GALLERY =====
function setMainImage(index) {
  currentIndex = index;
  gsap.to(mainImage, {
    opacity: 0, scale: 0.96, duration: 0.18, ease: 'power2.in',
    onComplete: () => {
      mainImage.src = images[index].full;
      gsap.to(mainImage, { opacity: 1, scale: 1, duration: 0.32, ease: 'power2.out' });
    }
  });
  thumbnails.forEach((t, i) => t.classList.toggle('active', i === index));
}

thumbnails.forEach(t => t.addEventListener('click', () => setMainImage(+t.dataset.index)));
prevBtn.addEventListener('click', () => setMainImage((currentIndex - 1 + images.length) % images.length));
nextBtn.addEventListener('click', () => setMainImage((currentIndex + 1) % images.length));

// Open lightbox on desktop click
mainImageWrapper.addEventListener('click', () => {
  if (window.innerWidth > 768) openLightbox(currentIndex);
});

// ===== LIGHTBOX =====
function openLightbox(index) {
  lightboxIndex = index;
  lightboxImage.src = images[index].full;
  lightboxThumbs.forEach((t, i) => t.classList.toggle('active', i === index));
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function setLightboxImage(index) {
  lightboxIndex = index;
  gsap.to(lightboxImage, {
    opacity: 0, x: -15, duration: 0.18, ease: 'power2.in',
    onComplete: () => {
      lightboxImage.src = images[index].full;
      gsap.to(lightboxImage, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    }
  });
  lightboxThumbs.forEach((t, i) => t.classList.toggle('active', i === index));
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lightboxPrev.addEventListener('click', () => setLightboxImage((lightboxIndex - 1 + images.length) % images.length));
lightboxNext.addEventListener('click', () => setLightboxImage((lightboxIndex + 1) % images.length));
lightboxThumbs.forEach(t => t.addEventListener('click', () => setLightboxImage(+t.dataset.index)));

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  setLightboxImage((lightboxIndex - 1 + images.length) % images.length);
  if (e.key === 'ArrowRight') setLightboxImage((lightboxIndex + 1) % images.length);
  if (e.key === 'Escape')     closeLightbox();
});

// ===== QUANTITY =====
decreaseQty.addEventListener('click', () => {
  if (quantity > 0) {
    quantity--;
    qtyValue.textContent = quantity;
    gsap.fromTo(qtyValue, { scale: 0.75 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  }
});

increaseQty.addEventListener('click', () => {
  quantity++;
  qtyValue.textContent = quantity;
  gsap.fromTo(qtyValue, { scale: 1.35 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
});

// ===== CART =====
addToCart.addEventListener('click', () => {
  if (quantity === 0) {
    gsap.to(addToCart, { x: -5, duration: 0.07, yoyo: true, repeat: 5, ease: 'power1.inOut' });
    return;
  }

  // Fly-to-cart animation
  flyCartAnimation();

  const existing = cartItems.find(i => i.name === 'Fall Limited Edition Sneakers');
  if (existing) existing.qty += quantity;
  else cartItems.push({ name: 'Fall Limited Edition Sneakers', price: 125.00, qty: quantity, thumb: './images/image-product-1-thumbnail.jpg' });

  quantity = 0;
  qtyValue.textContent = 0;

  // Button bounce
  gsap.timeline()
    .to(addToCart, { scale: 0.93, duration: 0.1 })
    .to(addToCart, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });

  // Delay cart update so fly animation is visible
  setTimeout(() => {
    updateCart();
    showToast('Item added to cart');
  }, 600);
});

function flyCartAnimation() {
  const btnRect  = addToCart.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  // Create flying dot
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    width: 22px; height: 22px;
    background: var(--orange);
    border-radius: 50%;
    z-index: 9999;
    pointer-events: none;
    top: ${btnRect.top + btnRect.height / 2 - 11}px;
    left: ${btnRect.left + btnRect.width / 2 - 11}px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px hsla(26,100%,55%,0.5);
  `;
  // Cart icon inside dot
  dot.innerHTML = `<img src="./images/icon-cart.svg" style="width:12px;filter:brightness(0) invert(1);">`;
  document.body.appendChild(dot);

  const targetX = cartRect.left + cartRect.width / 2 - 11;
  const targetY = cartRect.top  + cartRect.height / 2 - 11;

  gsap.timeline({ onComplete: () => dot.remove() })
    .to(dot, { scale: 1.3, duration: 0.15, ease: 'power2.out' })
    .to(dot, {
      left: targetX,
      top:  targetY,
      scale: 0.4,
      duration: 0.55,
      ease: 'power3.inOut',
    })
    .to(dot, { opacity: 0, duration: 0.15 });

  // Wiggle the cart icon on arrival
  gsap.to(cartBtn, {
    rotation: 15, duration: 0.1, delay: 0.65, yoyo: true, repeat: 3,
    ease: 'power1.inOut',
    onComplete: () => gsap.set(cartBtn, { rotation: 0 })
  });
}

function updateCart() {
  const total = cartItems.reduce((s, i) => s + i.qty, 0);
  cartBadge.textContent = total;
  if (total > 0) {
    cartBadge.classList.add('visible');
    gsap.fromTo(cartBadge, { scale: 1.6 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  } else {
    cartBadge.classList.remove('visible');
  }
  renderCartItems();
}

function renderCartItems() {
  cartItemsEl.innerHTML = '';
  if (cartItems.length === 0) {
    cartEmpty.style.display = 'flex';
    cartCheckout.style.display = 'none';
    return;
  }
  cartEmpty.style.display = 'none';
  cartCheckout.style.display = 'block';

  cartItems.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.thumb}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)} x ${item.qty} <span>$${(item.price * item.qty).toFixed(2)}</span></p>
      </div>
      <button class="cart-item-delete" data-idx="${idx}" aria-label="Remove item">
        <img src="./images/icon-delete.svg" alt="Delete">
      </button>`;
    cartItemsEl.appendChild(el);
  });

  cartItemsEl.querySelectorAll('.cart-item-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.idx;
      const el = cartItemsEl.children[idx];
      gsap.to(el, {
        opacity: 0, x: 20, duration: 0.22, ease: 'power2.in',
        onComplete: () => { cartItems.splice(idx, 1); updateCart(); }
      });
    });
  });
}

// Toggle cart
cartBtn.addEventListener('click', e => {
  e.stopPropagation();
  cartDropdown.classList.toggle('open');
  // close user panel if open
  userPanel.classList.remove('open');
  avatarBtn.classList.remove('active');
});

document.addEventListener('click', e => {
  if (!cartDropdown.contains(e.target) && e.target !== cartBtn)
    cartDropdown.classList.remove('open');
});

// ===== USER PANEL =====
const avatarBtn     = document.getElementById('avatarBtn');
const userPanel     = document.getElementById('userPanel');
const userPanelClose = document.getElementById('userPanelClose');

function closeUserPanel() {
  userPanel.classList.remove('open');
  avatarBtn.classList.remove('active');
}

avatarBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = userPanel.classList.toggle('open');
  avatarBtn.classList.toggle('active', isOpen);
  cartDropdown.classList.remove('open');
  if (isOpen) {
    gsap.fromTo(userPanel,
      { y: -8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
    );
    gsap.fromTo('.user-panel-menu li, .user-panel-logout',
      { x: 12, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, stagger: 0.06, delay: 0.1, ease: 'power2.out' }
    );
  }
});

userPanelClose.addEventListener('click', e => {
  e.stopPropagation();
  gsap.to(userPanel, {
    y: -8, opacity: 0, duration: 0.2, ease: 'power2.in',
    onComplete: closeUserPanel
  });
});

document.addEventListener('click', e => {
  if (!userPanel.contains(e.target) && e.target !== avatarBtn) {
    closeUserPanel();
  }
});

// ===== MOBILE NAV =====
hamburger.addEventListener('click', () => {
  mobileNav.classList.add('open');
  mobileOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeMobileNav() {
  mobileNav.classList.remove('open');
  mobileOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

closeMenu.addEventListener('click', closeMobileNav);
mobileOverlay.addEventListener('click', closeMobileNav);

// ===== HEADER SCROLL =====
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== TOUCH SWIPE =====
let touchStartX = 0;
mainImageWrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
mainImageWrapper.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50)
    setMainImage(diff > 0 ? (currentIndex + 1) % images.length : (currentIndex - 1 + images.length) % images.length);
});

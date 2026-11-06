document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('minishop_cart')) || [];
    let currentQvProduct = null;

    const cartBadge = document.querySelector('#cartBadge');
    const buyButtons = document.querySelectorAll('.btn--buy');
    const navLinks = document.querySelectorAll('.navbar__link');
    const btnFavorite = document.querySelector('#btnFavorite');
    const btnCheckout = document.querySelector('#btnCheckout');

    const cartButton = document.querySelector('#cartButton');
    const cartModal = document.querySelector('#cartModal');
    const btnCloseModal = document.querySelector('#btnCloseModal');
    const modalOverlay = document.querySelector('#modalOverlay');
    const cartItemList = document.querySelector('#cartItemList');
    const cartEmptyMessage = document.querySelector('#cartEmptyMessage');
    const cartTotalPrice = document.querySelector('#cartTotalPrice');
    const btnClearCart = document.querySelector('#btnClearCart');
    const btnOrderSubmit = document.querySelector('#btnOrderSubmit');

    const searchInput = document.querySelector('#searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const noProductFound = document.querySelector('#noProductFound');

    const quickViewModal = document.querySelector('#quickViewModal');
    const quickViewOverlay = document.querySelector('#quickViewOverlay');
    const btnCloseQuickView = document.querySelector('#btnCloseQuickView');
    const quickViewButtons = document.querySelectorAll('.btn-quickview');
    const qvName = document.querySelector('#qvName');
    const qvPrice = document.querySelector('#qvPrice');
    const qvImage = document.querySelector('#qvImage');
    const qvAddToCart = document.querySelector('#qvAddToCart');
    const sizeButtons = document.querySelectorAll('.size-btn');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.add('badge--bounce');
            setTimeout(() => cartBadge.classList.remove('badge--bounce'), 250);
        }

        if (cartTotalPrice) {
            cartTotalPrice.textContent = formatCurrency(totalMoney);
        }

        if (cartItemList && cartEmptyMessage) {
            if (cart.length === 0) {
                cartEmptyMessage.style.display = 'block';
                cartItemList.innerHTML = '';
            } else {
                cartEmptyMessage.style.display = 'none';
                cartItemList.innerHTML = cart.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.img}" alt="${item.name}" class="cart-item__img">
                        <div class="cart-item__info">
                            <div class="cart-item__name">${item.name} ${item.size ? '(' + item.size + ')' : ''}</div>
                            <div class="cart-item__price">${formatCurrency(item.price)}</div>
                        </div>
                        <div class="cart-item__controls">
                            <button class="cart-item__btn btn-decrease" data-id="${item.id}">-</button>
                            <span class="cart-item__qty">${item.quantity}</span>
                            <button class="cart-item__btn btn-increase" data-id="${item.id}">+</button>
                            <button class="cart-item__del btn-remove" data-id="${item.id}" title="Xóa">&times;</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        localStorage.setItem('minishop_cart', JSON.stringify(cart));
    }

    function addToCart(id, name, price, img, size = 'M') {
        const cartItemId = size ? `${id}_${size}` : id;
        const existingItem = cart.find(item => item.id === cartItemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: cartItemId, name, price, img, size, quantity: 1 });
        }
        updateCartUI();
    }

    function openModal() {
        if (cartModal) {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateCartUI();
        }
    }

    function closeModal() {
        if (cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function openQuickView(card) {
        currentQvProduct = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: parseInt(card.dataset.price, 10),
            img: card.dataset.img,
            size: 'S'
        };

        qvName.textContent = currentQvProduct.name;
        qvPrice.textContent = formatCurrency(currentQvProduct.price);
        qvImage.src = currentQvProduct.img;
        qvImage.alt = currentQvProduct.name;

        sizeButtons.forEach(btn => btn.classList.remove('active'));
        if (sizeButtons.length > 0) sizeButtons[0].classList.add('active');

        quickViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeQuickView() {
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function filterProducts() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const selectedCat = activeFilterBtn ? activeFilterBtn.dataset.category : 'all';

        let visibleCount = 0;

        productCards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const cat = card.dataset.category;

            const matchQuery = name.includes(query);
            const matchCat = (selectedCat === 'all' || cat === selectedCat);

            if (matchQuery && matchCat) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noProductFound) {
            noProductFound.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            addToCart(card.dataset.id, card.dataset.name, parseInt(card.dataset.price, 10), card.dataset.img);
        });
    });

    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            openQuickView(card);
        });
    });

    if (btnCloseQuickView) btnCloseQuickView.addEventListener('click', closeQuickView);
    if (quickViewOverlay) quickViewOverlay.addEventListener('click', closeQuickView);

    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (currentQvProduct) {
                currentQvProduct.size = btn.textContent.trim();
            }
        });
    });

    if (qvAddToCart) {
        qvAddToCart.addEventListener('click', () => {
            if (currentQvProduct) {
                addToCart(currentQvProduct.id, currentQvProduct.name, currentQvProduct.price, currentQvProduct.img, currentQvProduct.size);
                closeQuickView();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });

    if (cartItemList) {
        cartItemList.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (!id) return;

            if (e.target.classList.contains('btn-increase')) {
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.quantity++;
                    updateCartUI();
                }
            } else if (e.target.classList.contains('btn-decrease')) {
                const item = cart.find(i => i.id === id);
                if (item) {
                    if (item.quantity > 1) {
                        item.quantity--;
                    } else {
                        cart = cart.filter(i => i.id !== id);
                    }
                    updateCartUI();
                }
            } else if (e.target.classList.contains('btn-remove')) {
                cart = cart.filter(i => i.id !== id);
                updateCartUI();
            }
        });
    }

    if (cartButton) cartButton.addEventListener('click', openModal);

    if (btnCheckout) {
        btnCheckout.addEventListener('click', openModal);
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    if (btnClearCart) {
        btnClearCart.addEventListener('click', () => {
            if (cart.length === 0) return;
            cart = [];
            updateCartUI();
        });
    }

    if (btnOrderSubmit) {
        btnOrderSubmit.addEventListener('click', () => {
            if (cart.length === 0) return;
            cart = [];
            updateCartUI();
            closeModal();
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
        });
    });

    if (btnFavorite) {
        let isLiked = false;
        btnFavorite.addEventListener('click', () => {
            isLiked = !isLiked;
            if (isLiked) {
                btnFavorite.classList.add('btn--pink-filled');
                btnFavorite.textContent = '♥ Đã yêu thích';
            } else {
                btnFavorite.classList.remove('btn--pink-filled');
                btnFavorite.textContent = 'Yêu thích';
            }
        });
    }

    updateCartUI();
});

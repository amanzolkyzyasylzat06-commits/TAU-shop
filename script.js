// =====================================
// НАСТРОЙКИ И ТОВАРЫ
// =====================================

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Худи Тұран-Астана",
        cat: "Одежда",
        price: 18000,
        img: "",
        desc: "Тёплое худи с символикой университета.",
        popular: true,
        new: true
    },
    {
        id: 2,
        name: "Футболка с логотипом",
        cat: "Одежда",
        price: 8000,
        img: "",
        desc: "Футболка с логотипом университета.",
        popular: true,
        new: false
    },
    {
        id: 3,
        name: "Шоппер",
        cat: "Аксессуары",
        price: 4500,
        img: "",
        desc: "Удобная сумка-шоппер на каждый день.",
        popular: true,
        new: false
    },
    {
        id: 4,
        name: "Термокружка",
        cat: "Аксессуары",
        price: 9000,
        img: "",
        desc: "Термокружка для учёбы и поездок.",
        popular: false,
        new: true
    },
    {
        id: 5,
        name: "Блокнот",
        cat: "Канцелярия",
        price: 2500,
        img: "",
        desc: "Блокнот для лекций и заметок.",
        popular: false,
        new: true
    },
    {
        id: 6,
        name: "Ручка с логотипом",
        cat: "Канцелярия",
        price: 1000,
        img: "",
        desc: "Фирменная ручка университета.",
        popular: false,
        new: false
    }
];

function loadData(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

let products = loadData("shop_products_v2", DEFAULT_PRODUCTS);
let cart = loadData("shop_cart", {});
let favorites = loadData("shop_favorites", []);
let reviews = loadData("shop_reviews", []);

const categories = ["Одежда", "Аксессуары", "Канцелярия", "Новинки"];

const money = value =>
    Number(value).toLocaleString("ru-RU") + " ₸";

function saveData() {
    localStorage.setItem("shop_products_v2", JSON.stringify(products));
    localStorage.setItem("shop_cart", JSON.stringify(cart));
    localStorage.setItem("shop_favorites", JSON.stringify(favorites));
    localStorage.setItem("shop_reviews", JSON.stringify(reviews));
    updateCounters();
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// =====================================
// НАВИГАЦИЯ
// =====================================

function showPage(pageName, anchor) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    document.getElementById("hero").classList.add("hidden");

    const page = document.getElementById(pageName);

    if (page) {
        page.classList.remove("hidden");
    }

    if (pageName === "home") {
        document.getElementById("hero").classList.remove("hidden");
    }

    if (pageName === "catalog") renderCatalog();
    if (pageName === "favorites") renderFavorites();
    if (pageName === "reviews") renderReviews();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (anchor) {
        setTimeout(() => {
            const target = document.getElementById(anchor);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    }
}

// =====================================
// КАТЕГОРИИ
// =====================================

function renderCategories() {
    const container = document.getElementById("categories");

    container.innerHTML = categories.map(category => `
        <div class="category" onclick="filterCategory('${category}')">
            <h3>${category}</h3>
        </div>
    `).join("");

    const select = document.getElementById("categoryFilter");

    categories.forEach(category => {
        select.innerHTML += `
            <option value="${category}">${category}</option>
        `;
    });
}

function filterCategory(category) {
    showPage("catalog");

    document.getElementById("categoryFilter").value = category;

    renderCatalog();
}

// =====================================
// КАРТОЧКИ ТОВАРОВ
// =====================================

function productCard(product) {
    const photo = product.img
        ? `<img src="${product.img}" alt="${escapeHTML(product.name)}">`
        : `<div class="product-placeholder">ФОТО ТОВАРА</div>`;

    return `
        <article class="product">

            <button class="favorite ${favorites.includes(product.id) ? "active" : ""}"
                onclick="toggleFavorite(${product.id})">
                ${favorites.includes(product.id) ? "♥" : "♡"}
            </button>

            <div class="product-image">
                ${photo}
            </div>

            <div class="product-info">

                <h3>${escapeHTML(product.name)}</h3>

                <div class="price">
                    ${money(product.price)}
                </div>

                <button class="btn"
                    onclick="addToCart(${product.id})">
                    Добавить в корзину
                </button>

            </div>
        </article>
    `;
}

// =====================================
// ГЛАВНАЯ
// =====================================

function renderHome() {
    document.getElementById("popular").innerHTML =
        products.filter(p => p.popular)
            .map(productCard)
            .join("");

    document.getElementById("newProducts").innerHTML =
        products.filter(p => p.new)
            .map(productCard)
            .join("");
}

// =====================================
// КАТАЛОГ
// =====================================

function renderCatalog() {
    const search = document.getElementById("search")
        .value.toLowerCase();

    const category = document.getElementById("categoryFilter").value;

    const sort = document.getElementById("sort").value;

    let result = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(search);

        const matchesCategory =
            !category || product.cat === category;

        return matchesSearch && matchesCategory;
    });

    if (sort === "asc") {
        result.sort((a, b) => a.price - b.price);
    }

    if (sort === "desc") {
        result.sort((a, b) => b.price - a.price);
    }

    document.getElementById("catalogProducts").innerHTML =
        result.map(productCard).join("") ||
        "<p>Товары не найдены.</p>";
}

// =====================================
// ИЗБРАННОЕ
// =====================================

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    saveData();

    renderHome();
    renderCatalog();
    renderFavorites();
}

function renderFavorites() {
    const favoriteItems = products.filter(product =>
        favorites.includes(product.id)
    );

    document.getElementById("favoriteProducts").innerHTML =
        favoriteItems.map(productCard).join("") ||
        "<p>Избранное пока пусто.</p>";
}

// =====================================
// КОРЗИНА
// =====================================

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;

    saveData();
    renderCart();

    showToast("Товар добавлен в корзину!");
}

function changeQuantity(id, amount) {
    cart[id] = (cart[id] || 0) + amount;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    saveData();
    renderCart();
}

function removeFromCart(id) {
    delete cart[id];

    saveData();
    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItems");

    let total = 0;

    container.innerHTML = Object.entries(cart).map(([id, quantity]) => {
        const product = products.find(p => p.id == id);

        if (!product) return "";

        total += product.price * quantity;

        return `
            <div class="cart-item">

                <div class="cart-img">
                    ${product.img
                        ? `<img src="${product.img}">`
                        : "Фото"}
                </div>

                <div>
                    <h4>${escapeHTML(product.name)}</h4>

                    <strong>${money(product.price)}</strong>

                    <div class="quantity">

                        <button onclick="changeQuantity(${product.id}, -1)">
                            −
                        </button>

                        <span>${quantity}</span>

                        <button onclick="changeQuantity(${product.id}, 1)">
                            +
                        </button>

                    </div>
                </div>

                <button class="remove"
                    onclick="removeFromCart(${product.id})">
                    ×
                </button>

            </div>
        `;
    }).join("");

    if (!container.innerHTML) {
        container.innerHTML = "<p>Корзина пустая.</p>";
    }

    document.getElementById("total").textContent = money(total);
}

function bump(element) {
    element.classList.remove("bump");
    void element.offsetWidth;
    element.classList.add("bump");
}

function updateCounters() {
    const cartEl = document.getElementById("cartCount");
    const favEl = document.getElementById("favCount");

    const cartTotal = Object.values(cart).reduce((sum, value) => sum + value, 0);

    if (cartEl.textContent !== "" && Number(cartEl.textContent) !== cartTotal) bump(cartEl);
    if (favEl.textContent !== "" && Number(favEl.textContent) !== favorites.length) bump(favEl);

    cartEl.textContent = cartTotal;
    favEl.textContent = favorites.length;
}

function openCart() {
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("cart").classList.add("open");
}

function closeCart() {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("cart").classList.remove("open");
}

// =====================================
// ОФОРМЛЕНИЕ ЗАКАЗА
// =====================================

function checkout() {
    if (Object.keys(cart).length === 0) {
        alert("Корзина пустая!");
        return;
    }

    closeCart();

    document.getElementById("checkoutForm").classList.remove("hidden");
}

function closeCheckout() {
    document.getElementById("checkoutForm").classList.add("hidden");
}

document.getElementById("orderForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const data = new FormData(this);

    const name = data.get("name");
    const phone = data.get("phone");
    const address = data.get("address");
    const payment = data.get("payment");

    let orderDetails = "";

    let total = 0;

    for (const [id, quantity] of Object.entries(cart)) {
        const product = products.find(p => p.id == id);

        if (!product) continue;

        orderDetails += `${product.name} x ${quantity}\n`;

        total += product.price * quantity;
    }

    alert(
        "ЗАКАЗ ОФОРМЛЕН (демо)\n\n" +
        "Имя: " + name + "\n" +
        "Телефон: " + phone + "\n" +
        "Адрес: " + address + "\n" +
        "Оплата: " + payment + "\n\n" +
        orderDetails +
        "\nИтого: " + money(total)
    );

    cart = {};

    saveData();
    renderCart();

    this.reset();

    closeCheckout();
});

// =====================================
// АДМИН-ПАНЕЛЬ
// =====================================

function openAdmin() {
    document.getElementById("admin").classList.remove("hidden");

    document.getElementById("overlay").classList.remove("hidden");

    renderAdmin();
}

function closeAdmin() {
    document.getElementById("admin").classList.add("hidden");

    document.getElementById("overlay").classList.add("hidden");
}

function renderAdmin() {
    const container = document.getElementById("adminProducts");

    container.innerHTML = products.map(product => `
        <div class="admin-product">

            <div>
                <strong>${escapeHTML(product.name)}</strong>
                <p>${money(product.price)}</p>
            </div>

            <div>
                <button class="outline"
                    onclick="editProduct(${product.id})">
                    Изменить
                </button>

                <button class="outline"
                    onclick="deleteProduct(${product.id})">
                    Удалить
                </button>
            </div>

        </div>
    `).join("");
}

function deleteProduct(id) {
    if (!confirm("Удалить товар?")) return;

    products = products.filter(p => p.id !== id);

    delete cart[id];

    favorites = favorites.filter(item => item !== id);

    saveData();
    renderAdmin();
    renderHome();
    renderCatalog();
    renderFavorites();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    const newName = prompt("Название:", product.name);

    if (newName === null) return;

    const newPrice = prompt("Цена:", product.price);

    if (newPrice === null) return;

    const newDescription = prompt("Описание:", product.desc);

    if (newDescription === null) return;

    product.name = newName;
    product.price = Number(newPrice) || 0;
    product.desc = newDescription;

    saveData();

    renderAdmin();
    renderHome();
    renderCatalog();
    renderFavorites();
}

// =====================================
// ДОБАВЛЕНИЕ ТОВАРОВ
// =====================================

document.getElementById("productForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value;
    const price = Number(document.getElementById("productPrice").value);
    const description = document.getElementById("productDescription").value;
    const imageFile = document.getElementById("productImage").files[0];

    let image = "";

    if (imageFile) {
        image = await fileToBase64(imageFile);
    }

    const product = {
        id: Date.now(),
        name: name,
        cat: category,
        price: price,
        img: image,
        desc: description,
        popular: document.getElementById("isPopular").checked,
        new: document.getElementById("isNew").checked
    };

    products.unshift(product);

    saveData();

    renderAdmin();
    renderHome();
    renderCatalog();
    renderFavorites();

    this.reset();

    alert("Товар успешно добавлен!");
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

// =====================================
// ОТЗЫВЫ
// =====================================

function renderReviews() {
    const list = document.getElementById("reviewsList");

    list.innerHTML = reviews.length
        ? reviews.map(review => `
            <article class="review">
                <div class="review-head">
                    <strong>${escapeHTML(review.name)}</strong>
                    <span class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span>
                </div>
                <p>${escapeHTML(review.text)}</p>
                <small>${escapeHTML(review.date)}</small>
            </article>
        `).join("")
        : "<p>Пока нет отзывов. Будьте первым!</p>";
}

document.getElementById("reviewForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    const rating = Number(document.getElementById("reviewRating").value) || 5;

    if (!name || !text) return;

    reviews.unshift({
        name: name,
        rating: rating,
        text: text,
        date: new Date().toLocaleDateString("ru-RU")
    });

    saveData();
    renderReviews();

    this.reset();

    alert("Спасибо за отзыв!");
});

// =====================================
// ЗАПУСК
// =====================================

renderCategories();
renderHome();
renderCatalog();
renderFavorites();
renderReviews();
renderCart();
updateCounters();


// =====================================
// ПЕРЕВОДЫ: ҚАЗ / РУС / ENG
// =====================================

/* =====================================================
   i18n.js — переводы сайта: ҚАЗ / РУС / ENG
   Подключите в index.html ПОСЛЕ script.js (если не вставлен в script.js):
   <script src="i18n.js"></script>

   Как это работает: тексты на сайте остаются на русском,
   а этот файл подменяет их на выбранный язык. Чтобы добавить
   перевод нового текста — допишите строку в массив ROWS:
   ["русский текст", "қазақша", "english"]
   ===================================================== */
(function () {
    "use strict";

    var STORAGE_KEY = "tau_lang";
    var LANGS = ["kk", "ru", "en"];
    var LABELS = { kk: "ҚАЗ", ru: "РУС", en: "ENG" };

    // ---------------------------------------------
    // СЛОВАРЬ: [русский, қазақша, english]
    // ---------------------------------------------
    var ROWS = [
        // Меню и главная
        ["Главная", "Басты бет", "Home"],
        ["Каталог", "Каталог", "Catalog"],
        ["Отзывы", "Пікірлер", "Reviews"],
        ["О нас", "Біз туралы", "About us"],
        ["Контакты", "Байланыс", "Contacts"],
        ["МЕРЧ УНИВЕРСИТЕТА", "УНИВЕРСИТЕТ МЕРЧІ", "UNIVERSITY MERCH"],
        ["Мерч, которым", "Мақтан тұтатын", "Merch you"],
        ["гордятся", "мерч", "can be proud of"],
        ["Официальная одежда и аксессуары Тұран-Астана университета.", "Тұран-Астана университетінің ресми киімі мен аксессуарлары.", "Official clothing and accessories of Turan-Astana University."],
        ["Смотреть каталог", "Каталогты қарау", "Browse catalog"],
        ["МЕСТО ДЛЯ БАННЕРА", "БАННЕР ОРНЫ", "BANNER PLACEHOLDER"],
        ["Категории", "Санаттар", "Categories"],
        ["Популярные товары", "Танымал тауарлар", "Popular products"],
        ["Новинки", "Жаңалықтар", "New arrivals"],

        // Каталог и фильтры
        ["Поиск товара...", "Тауарды іздеу...", "Search products..."],
        ["Все категории", "Барлық санаттар", "All categories"],
        ["Сортировка", "Сұрыптау", "Sort by"],
        ["Сначала дешевле", "Алдымен арзандары", "Price: low to high"],
        ["Сначала дороже", "Алдымен қымбаттары", "Price: high to low"],
        ["Товары не найдены.", "Тауар табылмады.", "No products found."],
        ["Добавить в корзину", "Себетке қосу", "Add to cart"],
        ["ФОТО ТОВАРА", "ТАУАР ФОТОСЫ", "PRODUCT PHOTO"],
        ["Фото", "Фото", "Photo"],

        // Избранное
        ["Избранное", "Таңдаулылар", "Favorites"],
        ["Избранное пока пусто.", "Таңдаулылар әзірге бос.", "Your favorites list is empty."],

        // Отзывы
        ["Пока нет отзывов. Будьте первым!", "Әзірге пікір жоқ. Бірінші болыңыз!", "No reviews yet. Be the first!"],
        ["Оставить отзыв", "Пікір қалдыру", "Leave a review"],
        ["Имя", "Аты", "Name"],
        ["Оценка", "Бағалау", "Rating"],
        ["Отзыв", "Пікір", "Review"],
        ["Отправить отзыв", "Пікірді жіберу", "Submit review"],

        // Помощь
        ["Помощь", "Көмек", "Help"],
        ["Как заказать", "Қалай тапсырыс беру керек", "How to order"],
        ["Добавьте товары в корзину, нажмите «Оформить заказ», укажите имя, телефон и адрес, выберите способ оплаты и подтвердите заказ.",
            "Тауарларды себетке қосыңыз, «Тапсырыс беру» түймесін басыңыз, аты-жөніңізді, телефоныңызды және мекенжайыңызды көрсетіп, төлем әдісін таңдаңыз да, тапсырысты растаңыз.",
            "Add items to your cart, tap “Checkout”, enter your name, phone and address, choose a payment method and confirm your order."],
        ["Оплата", "Төлем", "Payment"],
        ["Оплатить заказ можно при получении или онлайн — способ выбирается при оформлении заказа.",
            "Тапсырысты алған кезде немесе онлайн төлеуге болады — әдісті тапсырыс беру кезінде таңдайсыз.",
            "You can pay on delivery or online — choose the method at checkout."],
        ["Доставка", "Жеткізу", "Delivery"],
        ["Доставка осуществляется по адресу, указанному при оформлении заказа. Сроки и стоимость уточняйте по телефону +7 778 867 35 04.",
            "Тауар тапсырыс беру кезінде көрсетілген мекенжайға жеткізіледі. Мерзімі мен құнын +7 778 867 35 04 телефоны бойынша нақтылаңыз.",
            "Orders are delivered to the address given at checkout. Please call +7 778 867 35 04 to confirm delivery time and cost."],
        ["Возврат и обмен", "Қайтару және айырбастау", "Returns & exchanges"],
        ["По вопросам возврата и обмена свяжитесь с нами по телефону +7 778 867 35 04 или по email info@tau-edu.kz.",
            "Қайтару және айырбастау мәселелері бойынша +7 778 867 35 04 телефоны немесе info@tau-edu.kz поштасы арқылы хабарласыңыз.",
            "For returns and exchanges, call +7 778 867 35 04 or email info@tau-edu.kz."],

        // О нас / контакты
        ["Добро пожаловать в магазин мерча Тұран-Астана университета!", "Тұран-Астана университетінің мерч дүкеніне қош келдіңіз!", "Welcome to the Turan-Astana University merch store!"],
        ["Здесь студенты, выпускники, преподаватели и гости университета могут выбрать одежду и аксессуары с символикой университета.",
            "Мұнда студенттер, түлектер, оқытушылар және университет қонақтары университет символикасы бар киім мен аксессуарларды таңдай алады.",
            "Here students, alumni, faculty and guests can choose clothing and accessories with the university's branding."],
        ["Телефон: +7 778 867 35 04", "Телефон: +7 778 867 35 04", "Phone: +7 778 867 35 04"],
        ["Адрес: г. Астана, улица Ықылас Дукенулы, 29", "Мекенжай: Астана қ., Ықылас Дүкенұлы көшесі, 29", "Address: 29 Ykylas Dukenuly St., Astana"],

        // Корзина
        ["Корзина", "Себет", "Cart"],
        ["Итого:", "Барлығы:", "Total:"],
        ["Оформить заказ", "Тапсырыс беру", "Checkout"],
        ["Корзина пустая.", "Себет бос.", "Your cart is empty."],
        ["Товар добавлен в корзину!", "Тауар себетке қосылды!", "Item added to cart!"],

        // Оформление заказа
        ["Оформление заказа", "Тапсырысты рәсімдеу", "Checkout"],
        ["Имя и фамилия", "Аты-жөні", "Full name"],
        ["Номер телефона", "Телефон нөмірі", "Phone number"],
        ["Адрес доставки", "Жеткізу мекенжайы", "Delivery address"],
        ["Оплата при получении", "Алған кезде төлеу", "Pay on delivery"],
        ["Онлайн-оплата", "Онлайн төлем", "Online payment"],
        ["Подтвердить заказ", "Тапсырысты растау", "Confirm order"],

        // Админ-панель
        ["Управление товарами", "Тауарларды басқару", "Manage products"],
        ["Название товара", "Тауардың атауы", "Product name"],
        ["Цена", "Бағасы", "Price"],
        ["Описание", "Сипаттамасы", "Description"],
        ["Одежда", "Киім", "Clothing"],
        ["Аксессуары", "Аксессуарлар", "Accessories"],
        ["Канцелярия", "Кеңсе тауарлары", "Stationery"],
        ["Популярный товар", "Танымал тауар", "Popular product"],
        ["Новинка", "Жаңалық", "New"],
        ["Добавить товар", "Тауар қосу", "Add product"],
        ["Изменить", "Өзгерту", "Edit"],
        ["Удалить", "Жою", "Delete"],

        // Подвал
        ["Магазин", "Дүкен", "Store"],
        ["Университет", "Университет", "University"],
        ["Сайт университета", "Университет сайты", "University website"],
        ["г. Астана, улица Ықылас Дукенулы, 29", "Астана қ., Ықылас Дүкенұлы көшесі, 29", "29 Ykylas Dukenuly St., Astana"],
        ["© 2026 TURAN-ASTANA UNIVERSITY. Все права защищены.", "© 2026 TURAN-ASTANA UNIVERSITY. Барлық құқықтар қорғалған.", "© 2026 TURAN-ASTANA UNIVERSITY. All rights reserved."],

        // Заголовок вкладки
        ["TAU Merch | Мерч университета", "TAU Merch | Университет мерчі", "TAU Merch | University merch"],

        // Товары по умолчанию
        ["Худи Тұран-Астана", "Тұран-Астана худиі", "Turan-Astana hoodie"],
        ["Тёплое худи с символикой университета.", "Университет символикасы бар жылы худи.", "A warm hoodie with university branding."],
        ["Футболка с логотипом", "Логотипі бар футболка", "Logo T-shirt"],
        ["Футболка с логотипом университета.", "Университет логотипі бар футболка.", "A T-shirt with the university logo."],
        ["Шоппер", "Шоппер сөмке", "Tote bag"],
        ["Удобная сумка-шоппер на каждый день.", "Күнделікті қолдануға ыңғайлы шоппер сөмке.", "A handy everyday tote bag."],
        ["Термокружка", "Термо-кружка", "Travel mug"],
        ["Термокружка для учёбы и поездок.", "Оқу мен сапарларға арналған термо-кружка.", "A travel mug for classes and trips."],
        ["Блокнот", "Блокнот", "Notebook"],
        ["Блокнот для лекций и заметок.", "Дәрістер мен жазбаларға арналған блокнот.", "A notebook for lectures and notes."],
        ["Ручка с логотипом", "Логотипі бар қалам", "Logo pen"],
        ["Фирменная ручка университета.", "Университеттің фирмалық қаламы.", "The university's branded pen."]
    ];

    // Тексты окон alert / confirm / prompt (подставляются как фрагменты)
    var ALERT_ROWS = [
        ["Товар добавлен в корзину!", "Тауар себетке қосылды!", "Item added to cart!"],
        ["Корзина пустая!", "Себет бос!", "Your cart is empty!"],
        ["ЗАКАЗ ОФОРМЛЕН (демо)", "ТАПСЫРЫС РӘСІМДЕЛДІ (демо)", "ORDER PLACED (demo)"],
        ["Удалить товар?", "Тауарды жою керек пе?", "Delete this product?"],
        ["Товар успешно добавлен!", "Тауар сәтті қосылды!", "Product added successfully!"],
        ["Оплата при получении", "Алған кезде төлеу", "Pay on delivery"],
        ["Онлайн-оплата", "Онлайн төлем", "Online payment"],
        ["Название:", "Атауы:", "Name:"],
        ["Описание:", "Сипаттамасы:", "Description:"],
        ["Телефон:", "Телефон:", "Phone:"],
        ["Оплата:", "Төлем:", "Payment:"],
        ["Адрес:", "Мекенжай:", "Address:"],
        ["Итого:", "Барлығы:", "Total:"],
        ["Цена:", "Бағасы:", "Price:"],
        ["Имя:", "Аты:", "Name:"],
        ["Спасибо за отзыв!", "Пікіріңіз үшін рахмет!", "Thank you for your review!"]
    ].sort(function (a, b) { return b[0].length - a[0].length; });

    // ---------------------------------------------
    // ВНУТРЕННЕЕ УСТРОЙСТВО
    // ---------------------------------------------
    var norm = function (s) { return String(s).replace(/\s+/g, " ").trim(); };

    var MAP = new Map();
    ROWS.forEach(function (r) {
        MAP.set(norm(r[0]), { ru: r[0], kk: r[1], en: r[2] });
    });

    var lang = "ru";
    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (LANGS.indexOf(saved) !== -1) lang = saved;
    } catch (e) { /* localStorage недоступен */ }

    var textState = new WeakMap();
    var attrState = new WeakMap();
    var ATTRS = ["placeholder", "title", "aria-label"];
    var SKIP = "script,style,textarea,[data-no-i18n]";
    var titleOriginal = document.title;
    var switchButtons = {};

    function applyNode(node) {
        var parent = node.parentElement;
        if (!parent || parent.closest(SKIP)) return;

        var st = textState.get(node);
        if (!st || st.shown !== node.data) {
            st = { orig: node.data, shown: node.data };
            textState.set(node, st);

            // У <option> без value значением служит текст — фиксируем русский,
            // чтобы фильтры и заказ не ломались при смене языка.
            if (parent.tagName === "OPTION" && !parent.hasAttribute("value")) {
                parent.setAttribute("value", norm(st.orig));
            }
        }

        if (!st.orig.trim()) return;

        var entry = MAP.get(norm(st.orig));
        var out = st.orig;

        if (lang !== "ru" && entry) {
            var lead = st.orig.match(/^\s*/)[0];
            var trail = st.orig.match(/\s*$/)[0];
            out = lead + entry[lang] + trail;
        }

        if (node.data !== out) node.data = out;
        st.shown = out;
    }

    function applyAttrs(el) {
        if (el.closest("[data-no-i18n]")) return;

        ATTRS.forEach(function (attr) {
            if (!el.hasAttribute(attr)) return;

            var states = attrState.get(el);
            if (!states) {
                states = {};
                attrState.set(el, states);
            }

            var current = el.getAttribute(attr);
            var rec = states[attr];
            if (!rec || rec.shown !== current) {
                rec = states[attr] = { orig: current, shown: current };
            }

            var entry = MAP.get(norm(rec.orig));
            var out = (lang !== "ru" && entry) ? entry[lang] : rec.orig;

            if (out !== current) el.setAttribute(attr, out);
            rec.shown = out;
        });
    }

    function translateTree(root) {
        if (!root) return;

        if (root.nodeType === 3) {
            applyNode(root);
            return;
        }

        if (root.nodeType !== 1 || root.closest("[data-no-i18n]")) return;

        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        var node;
        while ((node = walker.nextNode())) applyNode(node);

        applyAttrs(root);
        root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(applyAttrs);
    }

    function applyTitle() {
        var entry = MAP.get(norm(titleOriginal));
        document.title = (lang !== "ru" && entry) ? entry[lang] : titleOriginal;
    }

    // Следим за новым содержимым (карточки, корзина и т.д. рисуются скриптом)
    var OBSERVE = { childList: true, subtree: true, characterData: true };

    var observer = new MutationObserver(function (mutations) {
        observer.disconnect(); // чтобы не реагировать на собственные правки

        mutations.forEach(function (m) {
            if (m.type === "characterData") {
                applyNode(m.target);
            } else {
                m.addedNodes.forEach(translateTree);
            }
        });

        observer.observe(document.body, OBSERVE);
    });

    // ---------------------------------------------
    // ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА
    // ---------------------------------------------
    var CODE_BY_TEXT = {
        "ҚАЗ": "kk", "КАЗ": "kk", "KAZ": "kk", "KZ": "kk",
        "РУС": "ru", "RUS": "ru", "RU": "ru",
        "ENG": "en", "EN": "en"
    };

    // Если на сайте уже есть кнопки ҚАЗ / РУС / ENG — подключаем их
    function findExistingSwitch() {
        var found = {};

        document.querySelectorAll("button, a, span, li, div").forEach(function (el) {
            if (el.children.length || el.closest("[data-no-i18n]")) return;
            var code = CODE_BY_TEXT[el.textContent.trim().toUpperCase()];
            if (code && !found[code]) found[code] = el;
        });

        return Object.keys(found).length >= 2 ? found : null;
    }

    function addStyles() {
        var style = document.createElement("style");
        style.textContent =
            ".tau-lang{display:flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:inherit}" +
            ".tau-lang .tau-lang-btn{background:none;border:0;padding:6px 8px;color:inherit;font:inherit;" +
            "cursor:pointer;opacity:.65;border-bottom:2px solid transparent;border-radius:0;transition:opacity .2s}" +
            ".tau-lang .tau-lang-btn:hover{opacity:1}" +
            ".tau-lang .tau-lang-btn[aria-pressed='true']{opacity:1;border-bottom-color:currentColor}" +
            ".tau-lang .tau-lang-btn:focus-visible{outline:2px solid currentColor;outline-offset:2px}";
        document.head.appendChild(style);
    }

    function buildSwitch() {
        var existing = findExistingSwitch();

        if (existing) {
            switchButtons = existing;
            Object.keys(existing).forEach(function (code) {
                existing[code].addEventListener("click", function (e) {
                    e.preventDefault();
                    setLang(code);
                });
            });
            return;
        }

        addStyles();

        var box = document.createElement("div");
        box.className = "tau-lang";
        box.setAttribute("data-no-i18n", "");
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", "Language / Тіл / Язык");

        LANGS.forEach(function (code) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tau-lang-btn";
            btn.textContent = LABELS[code];
            btn.addEventListener("click", function () { setLang(code); });
            box.appendChild(btn);
            switchButtons[code] = btn;
        });

        var buttons = document.querySelector(".header-buttons");
        var header = document.querySelector("header");

        if (buttons && buttons.parentNode) {
            buttons.parentNode.insertBefore(box, buttons);
        } else if (header) {
            header.appendChild(box);
        } else {
            box.style.cssText = "position:fixed;top:10px;right:10px;z-index:30";
            document.body.appendChild(box);
        }
    }

    function markSwitch() {
        Object.keys(switchButtons).forEach(function (code) {
            var active = code === lang;
            switchButtons[code].setAttribute("aria-pressed", active ? "true" : "false");
            switchButtons[code].classList.toggle("active", active);
        });
    }

    function render() {
        observer.disconnect();
        document.documentElement.lang = lang;
        translateTree(document.body);
        applyTitle();
        markSwitch();
        observer.observe(document.body, OBSERVE);
        window.dispatchEvent(new CustomEvent("tau:lang", { detail: lang }));
    }

    function setLang(code) {
        if (LANGS.indexOf(code) === -1) return;
        lang = code;
        try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
        render();
    }

    // ---------------------------------------------
    // alert / confirm / prompt на выбранном языке
    // ---------------------------------------------
    function translateDialog(message) {
        var text = String(message);
        if (lang === "ru") return text;

        ALERT_ROWS.forEach(function (r) {
            text = text.split(r[0]).join(lang === "kk" ? r[1] : r[2]);
        });
        return text;
    }

    ["alert", "confirm"].forEach(function (name) {
        var original = window[name].bind(window);
        window[name] = function (message) { return original(translateDialog(message)); };
    });

    var originalPrompt = window.prompt.bind(window);
    window.prompt = function (message, value) {
        return originalPrompt(translateDialog(message), value);
    };

    // ---------------------------------------------
    // ПУБЛИЧНЫЙ API (используется помощником TAU AI)
    // ---------------------------------------------
    window.TAU_I18N = {
        getLang: function () { return lang; },
        setLang: setLang,
        t: function (text, code) {
            code = code || lang;
            if (code === "ru") return text;
            var entry = MAP.get(norm(text));
            return entry ? entry[code] : text;
        }
    };

    function init() {
        buildSwitch();
        render();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();


// =====================================
// ИИ-ПОМОЩНИК TAU AI
// =====================================

/* =====================================================
   assistant.js — ИИ-помощник магазина «TAU AI»
   Подключите в index.html ПОСЛЕ i18n.js:
   <script src="i18n.js"></script>
   <script src="assistant.js"></script>

   Помощник работает без сервера: отвечает на вопросы о товарах,
   ценах, заказе, доставке, оплате, возврате и контактах на
   казахском, русском и английском языках.
   ===================================================== */
(function () {
    "use strict";

    if (document.getElementById("tauAI")) return;

    // ---------------------------------------------
    // НАСТРОЙКИ — меняйте под свой магазин
    // ---------------------------------------------
    var STORE = {
        phone: "+7 778 867 35 04",
        email: "info@tau-edu.kz",
        address: {
            ru: "г. Астана, улица Ықылас Дукенулы, 29",
            kk: "Астана қ., Ықылас Дүкенұлы көшесі, 29",
            en: "29 Ykylas Dukenuly St., Astana"
        },
        // Свои ответы. Если поле заполнено — оно заменит стандартный ответ.
        // Пример: custom.delivery.ru = "Доставка по Астане — 1–2 дня, 1500 ₸."
        custom: {
            delivery: { ru: "", kk: "", en: "" },
            payment:  { ru: "", kk: "", en: "" },
            returns:  { ru: "", kk: "", en: "" }
        }
    };

    // ---------------------------------------------
    // ТЕКСТЫ ИНТЕРФЕЙСА
    // ---------------------------------------------
    var UI = {
        ru: {
            sub: "Помощник магазина",
            ph: "Напишите вопрос…",
            send: "Отправить",
            open: "Открыть чат с TAU AI",
            close: "Закрыть чат",
            typing: "TAU AI печатает…",
            add: "В корзину",
            welcome: "Здравствуйте! Я TAU AI — помощник магазина мерча университета. Помогу выбрать товар, оформить заказ и отвечу про доставку, оплату и возврат.",
            chips: { catalog: "Каталог", delivery: "Доставка", payment: "Оплата", returns: "Возврат", contacts: "Контакты" },
            act: { catalog: "Открыть каталог", cart: "Открыть корзину", fav: "Открыть избранное", reviews: "Открыть отзывы" }
        },
        kk: {
            sub: "Дүкен көмекшісі",
            ph: "Сұрағыңызды жазыңыз…",
            send: "Жіберу",
            open: "TAU AI чатын ашу",
            close: "Чатты жабу",
            typing: "TAU AI жазып жатыр…",
            add: "Себетке",
            welcome: "Сәлеметсіз бе! Мен TAU AI — университет мерч дүкенінің көмекшісімін. Тауар таңдауға, тапсырыс беруге көмектесіп, жеткізу, төлем және қайтару туралы жауап беремін.",
            chips: { catalog: "Каталог", delivery: "Жеткізу", payment: "Төлем", returns: "Қайтару", contacts: "Байланыс" },
            act: { catalog: "Каталогты ашу", cart: "Себетті ашу", fav: "Таңдаулыларды ашу", reviews: "Пікірлерді ашу" }
        },
        en: {
            sub: "Store assistant",
            ph: "Type your question…",
            send: "Send",
            open: "Open TAU AI chat",
            close: "Close chat",
            typing: "TAU AI is typing…",
            add: "Add to cart",
            welcome: "Hi! I'm TAU AI, the university merch store assistant. I can help you pick products, place an order and answer questions about delivery, payment and returns.",
            chips: { catalog: "Catalog", delivery: "Delivery", payment: "Payment", returns: "Returns", contacts: "Contacts" },
            act: { catalog: "Open catalog", cart: "Open cart", fav: "Open favorites", reviews: "Open reviews" }
        }
    };

    // ---------------------------------------------
    // ОТВЕТЫ
    // ---------------------------------------------
    var M = {
        greet: {
            ru: "Здравствуйте! Чем могу помочь?",
            kk: "Сәлеметсіз бе! Қалай көмектесе аламын?",
            en: "Hello! How can I help you?"
        },
        thanks: {
            ru: "Пожалуйста! Если появятся вопросы — пишите.",
            kk: "Оқасы жоқ! Сұрақтарыңыз болса — жазыңыз.",
            en: "You're welcome! Ask me anything else anytime."
        },
        bye: {
            ru: "До встречи! Хорошего дня.",
            kk: "Көріскенше! Күніңіз сәтті өтсін.",
            en: "See you! Have a great day."
        },
        howorder: {
            ru: "Заказать просто:\n1. Откройте каталог и нажмите «Добавить в корзину».\n2. Откройте корзину (🛒) и нажмите «Оформить заказ».\n3. Укажите имя, телефон и адрес, выберите способ оплаты и подтвердите заказ.",
            kk: "Тапсырыс беру оңай:\n1. Каталогты ашып, «Себетке қосу» түймесін басыңыз.\n2. Себетті (🛒) ашып, «Тапсырыс беру» түймесін басыңыз.\n3. Аты-жөніңізді, телефоныңызды және мекенжайыңызды енгізіп, төлем әдісін таңдаңыз да, тапсырысты растаңыз.",
            en: "Ordering is easy:\n1. Open the catalog and tap “Add to cart”.\n2. Open the cart (🛒) and tap “Checkout”.\n3. Enter your name, phone and address, choose a payment method and confirm."
        },
        payment: {
            ru: "При оформлении заказа можно выбрать оплату при получении или онлайн-оплату.",
            kk: "Тапсырыс беру кезінде алған кезде төлеуді немесе онлайн төлемді таңдауға болады.",
            en: "At checkout you can choose to pay on delivery or pay online."
        },
        delivery: {
            ru: "Доставка осуществляется по адресу, который вы укажете при оформлении заказа. Сроки и стоимость уточняйте по телефону {phone}.",
            kk: "Тауар тапсырыс беру кезінде көрсеткен мекенжайыңызға жеткізіледі. Жеткізу мерзімі мен құнын {phone} телефоны бойынша нақтылаңыз.",
            en: "Orders are delivered to the address you enter at checkout. Please call {phone} to confirm delivery time and cost."
        },
        returns: {
            ru: "По вопросам возврата и обмена свяжитесь с нами: {phone}, {email}.",
            kk: "Қайтару және айырбастау мәселелері бойынша бізге хабарласыңыз: {phone}, {email}.",
            en: "For returns and exchanges, please contact us: {phone}, {email}."
        },
        contacts: {
            ru: "Телефон: {phone}\nEmail: {email}\nАдрес: {address}",
            kk: "Телефон: {phone}\nEmail: {email}\nМекенжай: {address}",
            en: "Phone: {phone}\nEmail: {email}\nAddress: {address}"
        },
        fav: {
            ru: "Нажмите ♡ на карточке товара, чтобы сохранить его. Все сохранённые товары собраны в разделе «Избранное».",
            kk: "Тауарды сақтау үшін карточкадағы ♡ белгісін басыңыз. Сақталған тауарлар «Таңдаулылар» бөлімінде жиналады.",
            en: "Tap ♡ on a product card to save it. All saved items are in the “Favorites” section."
        },
        reviews: {
            ru: "Отзыв можно оставить в разделе «Отзывы»: укажите имя, оценку и напишите пару слов.",
            kk: "Пікірді «Пікірлер» бөлімінде қалдыруға болады: атыңызды, бағаны көрсетіп, бірнеше сөз жазыңыз.",
            en: "You can leave a review in the “Reviews” section: add your name, a rating and a few words."
        },
        university: {
            ru: "Это магазин мерча университета Тұран-Астана. Подробнее — в разделе «О нас».",
            kk: "Бұл — Тұран-Астана университетінің мерч дүкені. Толығырақ «Біз туралы» бөлімінде.",
            en: "This is the Turan-Astana University merch store. Learn more in the “About us” section."
        },
        language: {
            ru: "Язык сайта меняется кнопками ҚАЗ / РУС / ENG вверху страницы. Я отвечаю на языке вашего вопроса.",
            kk: "Сайт тілі беттің жоғарғы жағындағы ҚАЗ / РУС / ENG түймелерімен ауысады. Мен сұрағыңыз жазылған тілде жауап беремін.",
            en: "Switch the site language with the ҚАЗ / РУС / ENG buttons at the top. I reply in the language of your question."
        },
        help: {
            ru: "Я могу рассказать о товарах и ценах, помочь с заказом и ответить про доставку, оплату, возврат и контакты. Выберите тему ниже или напишите свой вопрос.",
            kk: "Мен тауарлар мен бағалар туралы айтып, тапсырыс беруге көмектесіп, жеткізу, төлем, қайтару және байланыс туралы жауап бере аламын. Төмендегі тақырыпты таңдаңыз немесе сұрағыңызды жазыңыз.",
            en: "I can tell you about products and prices, help with an order, and answer questions on delivery, payment, returns and contacts. Pick a topic below or type your question."
        },
        fallbackLead: {
            ru: "Не уверен, что понял вас. ",
            kk: "Сұрағыңызды толық түсінбедім. ",
            en: "I'm not sure I understood. "
        },
        catalog: {
            ru: "Вот что сейчас есть в каталоге:",
            kk: "Қазір каталогта бар тауарлар:",
            en: "Here's what's in the catalog right now:"
        },
        catalogEmpty: {
            ru: "Каталог пока пуст — товары скоро появятся.",
            kk: "Каталог әзірге бос — тауарлар жақында қосылады.",
            en: "The catalog is empty for now — products are coming soon."
        },
        found: {
            ru: "Вот что нашлось по вашему запросу:",
            kk: "Сұрауыңыз бойынша табылғаны:",
            en: "Here's what I found:"
        },
        priceRange: {
            ru: "Цены в каталоге — от {min} до {max}. Самые доступные товары:",
            kk: "Каталогтағы бағалар — {min} бастап {max} дейін. Ең қолжетімді тауарлар:",
            en: "Prices in the catalog range from {min} to {max}. The most affordable items:"
        },
        priceNone: {
            ru: "Цена указана на карточке каждого товара в каталоге.",
            kk: "Баға каталогтағы әр тауар карточкасында көрсетілген.",
            en: "The price is shown on each product card in the catalog."
        },
        cart: {
            ru: "Товары в корзине можно изменить и оформить в окне корзины (🛒).",
            kk: "Себеттегі тауарларды себет терезесінде (🛒) өзгертіп, тапсырыс беруге болады.",
            en: "You can edit your items and check out in the cart (🛒)."
        },
        cartFull: {
            ru: " Сейчас в корзине: {n} шт.",
            kk: " Қазір себетте: {n} дана.",
            en: " Items in your cart now: {n}."
        },
        cartEmpty: {
            ru: " Сейчас корзина пуста.",
            kk: " Қазір себет бос.",
            en: " Your cart is empty right now."
        }
    };

    // Какие кнопки-действия показывать под ответом
    var ACTIONS_BY_INTENT = {
        howorder: ["catalog", "cart"],
        cart: ["cart"],
        fav: ["fav"],
        reviews: ["reviews"],
        catalog: ["catalog"],
        price: ["catalog"],
        found: ["catalog"]
    };

    // ---------------------------------------------
    // ПОНИМАНИЕ ВОПРОСА (ключевые слова на 3 языках)
    // ---------------------------------------------
    var RULES = [
        ["thanks", /спасибо|благодар|рахмет|thank/],
        ["bye", /(^|\s)(пока|до свидания|сау бол|көріскенше|bye|goodbye)(\s|$|!|\.)/],
        ["howorder", /как (заказ|купить|оформ)|заказать|оформить|қалай (тапсырыс|сатып)|тапсырыс бер|how (to|do i) (order|buy)|place an order|checkout/],
        ["delivery", /доставк|курьер|привез|жеткіз|жеткiз|delivery|deliver|shipping|ship/],
        ["payment", /оплат|заплат|картой|kaspi|каспи|наличн|төлем|төле|(^|\s)pay(\s|$|ment)|payment|credit card/],
        ["returns", /возврат|вернуть|обмен|обменя|қайтар|айырбас|ауыстыр|return|exchange|refund/],
        ["contacts", /контакт|телефон|позвон|почт|email|e-mail|адрес|где наход|как добраться|байланыс|мекенжай|қайда|phone|call you|address|where are you|located|contact/],
        ["reviews", /отзыв|оценк|пікір|review|rating|feedback/],
        ["cart", /корзин|себет|cart|basket/],
        ["fav", /избран|таңдаул|favorite|favourite|wishlist/],
        ["price", /цен[аыуе]|стоим|сколько|дешев|недорог|бюджет|қанша|баға|арзан|price|cost|cheap|how much|afford/],
        ["university", /университет|универ|тұран|туран|(^|\s)tau(\s|$)|university/],
        ["language", /язык|тіл(?!ек)|language|перевод|translate/],
        ["catalog", /каталог|товар|ассортимент|что (у вас )?(есть|прода)|мерч|одежд|аксессуар|канцеляр|кеңсе|худи|футболк|шоппер|блокнот|кружк|ручк|тауар|өнім|киім|не сатасыз|product|catalog|merch|stationery|hoodie|t-shirt|what do you (sell|have)|clothes/],
        ["help", /что (ты )?умеешь|помощь|помоги|көмек|help|what can you/],
        ["greet", /(^|\s)(привет|здравствуй|здравствуйте|добрый (день|вечер|утро)|салем|сәлем|сәлеметсіз бе|hello|hi|hey)(\s|$|!|,|\.)/]
    ];

    function normalize(text) {
        return String(text).toLowerCase().replace(/ё/g, "е").trim();
    }

    function detectIntent(text) {
        for (var i = 0; i < RULES.length; i++) {
            if (RULES[i][1].test(text)) return RULES[i][0];
        }
        return null;
    }

    // Язык ответа: определяем по буквам вопроса, иначе — язык сайта
    function detectLang(text) {
        if (/[әғқңөұүһі]/i.test(text)) return "kk";
        if (/[ёъщь]/i.test(text)) return "ru";
        if (/[a-z]/i.test(text) && !/[а-яәғқңөұүһі]/i.test(text)) return "en";
        return siteLang();
    }

    function siteLang() {
        return (window.TAU_I18N && window.TAU_I18N.getLang()) || "ru";
    }

    // ---------------------------------------------
    // ДАННЫЕ МАГАЗИНА
    // ---------------------------------------------
    function getProducts() {
        try {
            if (typeof products !== "undefined" && Array.isArray(products)) return products;
        } catch (e) { /* переменная недоступна */ }

        try {
            return JSON.parse(localStorage.getItem("shop_products_v2")) || [];
        } catch (e) {
            return [];
        }
    }

    function cartCount() {
        try {
            if (typeof cart !== "undefined") {
                return Object.keys(cart).reduce(function (sum, id) { return sum + cart[id]; }, 0);
            }
        } catch (e) { /* переменная недоступна */ }
        return 0;
    }

    function money(value) {
        return Number(value).toLocaleString("ru-RU") + " ₸";
    }

    function productName(product, lang) {
        return window.TAU_I18N ? window.TAU_I18N.t(product.name, lang) : product.name;
    }

    // Поиск товара по словам из вопроса (на трёх языках)
    function matchProducts(text) {
        var tokens = text.split(/[^\p{L}\p{N}]+/u).filter(function (t) { return t.length >= 4; });
        if (!tokens.length) return [];

        return getProducts().filter(function (product) {
            var names = [product.name];
            if (window.TAU_I18N) {
                names.push(window.TAU_I18N.t(product.name, "kk"), window.TAU_I18N.t(product.name, "en"));
            }
            var haystack = names.join(" ").toLowerCase();

            return tokens.some(function (token) {
                var stem = token.length >= 7 ? token.slice(0, -2) : token.length >= 5 ? token.slice(0, -1) : token;
                return haystack.indexOf(stem) !== -1;
            });
        });
    }

    function fill(template, lang) {
        return template
            .replace(/\{phone\}/g, STORE.phone)
            .replace(/\{email\}/g, STORE.email)
            .replace(/\{address\}/g, STORE.address[lang]);
    }

    function pick(key, lang) {
        return fill(M[key][lang], lang);
    }

    // ---------------------------------------------
    // ФОРМИРОВАНИЕ ОТВЕТА
    // ---------------------------------------------
    function buildReply(intent, lang, text) {
        var reply = { text: "", products: null, actions: ACTIONS_BY_INTENT[intent] || [] };
        var list = getProducts();
        var custom = STORE.custom[intent] && STORE.custom[intent][lang];

        if (custom) {
            reply.text = custom;
            return reply;
        }

        switch (intent) {
            case "catalog":
                if (list.length) {
                    reply.text = pick("catalog", lang);
                    reply.products = list.slice(0, 4);
                } else {
                    reply.text = pick("catalogEmpty", lang);
                    reply.actions = [];
                }
                break;

            case "price":
                if (list.length) {
                    var sorted = list.slice().sort(function (a, b) { return a.price - b.price; });
                    reply.text = pick("priceRange", lang)
                        .replace("{min}", money(sorted[0].price))
                        .replace("{max}", money(sorted[sorted.length - 1].price));
                    reply.products = sorted.slice(0, 3);
                } else {
                    reply.text = pick("priceNone", lang);
                    reply.actions = [];
                }
                break;

            case "cart":
                var n = cartCount();
                reply.text = pick("cart", lang) +
                    (n > 0 ? M.cartFull[lang].replace("{n}", n) : M.cartEmpty[lang]);
                break;

            case "found":
                reply.text = pick("found", lang);
                reply.products = text;
                break;

            case "fallback":
                reply.text = M.fallbackLead[lang] + pick("help", lang);
                break;

            default:
                reply.text = pick(intent, lang);
        }

        return reply;
    }

    function answer(rawText, lang) {
        var text = normalize(rawText);
        var intent = detectIntent(text);
        var found = matchProducts(text);

        if (found.length && (!intent || intent === "price" || intent === "catalog")) {
            return buildReply("found", lang, found.slice(0, 4));
        }

        if (!intent) return buildReply("fallback", lang);
        return buildReply(intent, lang, text);
    }

    // ---------------------------------------------
    // ДЕЙСТВИЯ НА САЙТЕ
    // ---------------------------------------------
    function callSite(name, arg) {
        if (typeof window[name] === "function") window[name](arg);
    }

    var ACTION_RUN = {
        catalog: function () { callSite("showPage", "catalog"); },
        cart: function () { callSite("openCart"); },
        fav: function () { callSite("showPage", "favorites"); },
        reviews: function () { callSite("showPage", "reviews"); }
    };

    // ---------------------------------------------
    // СТИЛИ
    // ---------------------------------------------
    var css = [
        ".tau-ai{position:fixed;right:20px;bottom:20px;z-index:18;font-family:inherit;font-size:14px;color:var(--text,#21191b)}",
        ".tau-ai *{box-sizing:border-box}",
        ".tau-ai-fab{width:60px;height:60px;border-radius:50%;border:0;display:grid;place-items:center;color:#fff;cursor:pointer;",
        "background:linear-gradient(135deg,var(--burgundy,#800020),var(--dark-burgundy,#570018));",
        "box-shadow:0 10px 28px rgba(87,0,24,.35);transition:transform .2s,box-shadow .2s}",
        ".tau-ai-fab:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 14px 32px rgba(87,0,24,.42)}",
        ".tau-ai button:focus-visible,.tau-ai input:focus-visible{outline:3px solid rgba(128,0,32,.45);outline-offset:2px}",

        ".tau-ai-panel{position:absolute;right:0;bottom:76px;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 130px));",
        "display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;",
        "box-shadow:0 24px 60px rgba(33,25,27,.28);border:1px solid var(--border,#eadfe2);",
        "opacity:0;visibility:hidden;pointer-events:none;transform:translateY(12px) scale(.98);transform-origin:bottom right;",
        "transition:opacity .2s,transform .2s,visibility .2s}",
        ".tau-ai-panel.open{opacity:1;visibility:visible;pointer-events:auto;transform:none}",

        ".tau-ai-head{display:flex;align-items:center;gap:12px;padding:14px 16px;color:#fff;",
        "background:linear-gradient(135deg,var(--burgundy,#800020),var(--dark-burgundy,#570018))}",
        ".tau-ai-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;flex:none}",
        ".tau-ai-titles{display:flex;flex-direction:column;min-width:0;flex:1}",
        ".tau-ai-titles strong{font-size:16px;letter-spacing:.5px}",
        ".tau-ai-titles span{font-size:12px;opacity:.85}",
        ".tau-ai-close{background:none;border:0;color:#fff;font-size:20px;line-height:1;padding:6px 8px;cursor:pointer;border-radius:8px}",
        ".tau-ai-close:hover{background:rgba(255,255,255,.16)}",

        ".tau-ai-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#fff}",
        ".tau-ai-msg{max-width:86%;padding:10px 13px;border-radius:14px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere}",
        ".tau-ai-msg.bot{align-self:flex-start;background:var(--light,#f8f3f4);border-bottom-left-radius:4px}",
        ".tau-ai-msg.user{align-self:flex-end;background:var(--burgundy,#800020);color:#fff;border-bottom-right-radius:4px}",

        ".tau-ai-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;background:var(--light,#f8f3f4);border-radius:14px;border-bottom-left-radius:4px}",
        ".tau-ai-typing i{width:6px;height:6px;border-radius:50%;background:var(--muted,#827679);animation:tauBounce 1s infinite ease-in-out}",
        ".tau-ai-typing i:nth-child(2){animation-delay:.15s}",
        ".tau-ai-typing i:nth-child(3){animation-delay:.3s}",
        "@keyframes tauBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}",

        ".tau-ai-products{align-self:stretch;display:flex;flex-direction:column;gap:8px}",
        ".tau-ai-product{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--border,#eadfe2);border-radius:12px;background:#fff}",
        ".tau-ai-product b{display:block;font-weight:600;overflow-wrap:anywhere}",
        ".tau-ai-product small{color:var(--burgundy,#800020);font-weight:600;font-size:13px}",

        ".tau-ai-btn{border:1px solid var(--burgundy,#800020);background:#fff;color:var(--burgundy,#800020);border-radius:999px;padding:7px 13px;font:inherit;font-size:13px;cursor:pointer;transition:background .2s,color .2s;white-space:nowrap}",
        ".tau-ai-btn:hover{background:var(--burgundy,#800020);color:#fff}",
        ".tau-ai-actions{align-self:flex-start;display:flex;flex-wrap:wrap;gap:8px}",
        ".tau-ai-actions .tau-ai-btn{background:var(--burgundy,#800020);color:#fff}",
        ".tau-ai-actions .tau-ai-btn:hover{background:var(--dark-burgundy,#570018)}",

        ".tau-ai-chips{display:flex;gap:8px;padding:10px 16px;overflow-x:auto;border-top:1px solid var(--border,#eadfe2);background:#fff}",
        ".tau-ai-chips .tau-ai-btn{flex:none}",

        ".tau-ai-form{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border,#eadfe2);background:#fff}",
        ".tau-ai-form input{flex:1;min-width:0;padding:11px 14px;border:1px solid var(--border,#eadfe2);border-radius:999px;font:inherit;background:#fff;color:inherit}",
        ".tau-ai-send{width:42px;height:42px;flex:none;border-radius:50%;border:0;display:grid;place-items:center;color:#fff;cursor:pointer;background:var(--burgundy,#800020)}",
        ".tau-ai-send:hover{background:var(--dark-burgundy,#570018)}",

        "@media (max-width:600px){.tau-ai{right:12px;bottom:12px}.tau-ai-panel{height:min(560px,calc(100vh - 100px))}}",
        "@media (prefers-reduced-motion:reduce){.tau-ai *{transition:none!important;animation:none!important}}"
    ].join("");

    // ---------------------------------------------
    // РАЗМЕТКА
    // ---------------------------------------------
    var ROBOT_SVG =
        '<svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M16 8V5"/><circle cx="16" cy="3.5" r="1.5" fill="currentColor"/>' +
        '<rect x="6" y="8" width="20" height="16" rx="5"/>' +
        '<circle cx="12" cy="15" r="1.7" fill="currentColor" stroke="none"/>' +
        '<circle cx="20" cy="15" r="1.7" fill="currentColor" stroke="none"/>' +
        '<path d="M12.5 20h7"/><path d="M3 14v5M29 14v5"/></svg>';

    var SEND_SVG =
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>';

    function h(tag, className, text) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined) el.textContent = text;
        return el;
    }

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var root = h("div", "tau-ai");
    root.id = "tauAI";
    root.setAttribute("data-no-i18n", "");

    var fab = h("button", "tau-ai-fab");
    fab.type = "button";
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "tauAIPanel");
    fab.innerHTML = ROBOT_SVG;

    var panel = h("section", "tau-ai-panel");
    panel.id = "tauAIPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "TAU AI");
    panel.inert = true;

    var head = h("div", "tau-ai-head");
    var avatar = h("div", "tau-ai-avatar");
    avatar.innerHTML = ROBOT_SVG;
    var titles = h("div", "tau-ai-titles");
    var subtitle = h("span");
    titles.appendChild(h("strong", "", "TAU AI"));
    titles.appendChild(subtitle);
    var closeBtn = h("button", "tau-ai-close", "✕");
    closeBtn.type = "button";
    head.appendChild(avatar);
    head.appendChild(titles);
    head.appendChild(closeBtn);

    var log = h("div", "tau-ai-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");

    var chips = h("div", "tau-ai-chips");

    var form = h("form", "tau-ai-form");
    var input = h("input");
    input.type = "text";
    input.maxLength = 300;
    input.autocomplete = "off";
    var sendBtn = h("button", "tau-ai-send");
    sendBtn.type = "submit";
    sendBtn.innerHTML = SEND_SVG;
    form.appendChild(input);
    form.appendChild(sendBtn);

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(chips);
    panel.appendChild(form);
    root.appendChild(panel);
    root.appendChild(fab);
    document.body.appendChild(root);

    // ---------------------------------------------
    // ЧАТ
    // ---------------------------------------------
    var welcomeEl = null;
    var touched = false; // писал ли что-то пользователь

    function scrollDown() {
        log.scrollTop = log.scrollHeight;
    }

    function addBubble(text, who) {
        var el = h("div", "tau-ai-msg " + who, text);
        log.appendChild(el);
        scrollDown();
        return el;
    }

    function addTyping() {
        var el = h("div", "tau-ai-typing");
        el.setAttribute("aria-label", UI[siteLang()].typing);
        el.appendChild(h("i"));
        el.appendChild(h("i"));
        el.appendChild(h("i"));
        log.appendChild(el);
        scrollDown();
        return el;
    }

    function addProducts(list, lang) {
        var box = h("div", "tau-ai-products");

        list.forEach(function (product) {
            var row = h("div", "tau-ai-product");
            var info = h("div");
            info.appendChild(h("b", "", productName(product, lang)));
            info.appendChild(h("small", "", money(product.price)));

            var add = h("button", "tau-ai-btn", UI[lang].add);
            add.type = "button";
            add.addEventListener("click", function () { callSite("addToCart", product.id); });

            row.appendChild(info);
            row.appendChild(add);
            box.appendChild(row);
        });

        log.appendChild(box);
        scrollDown();
    }

    function addActions(keys, lang) {
        var visible = keys.filter(function (key) {
            return key !== "reviews" || document.getElementById("reviews");
        });
        if (!visible.length) return;

        var box = h("div", "tau-ai-actions");

        visible.forEach(function (key) {
            var btn = h("button", "tau-ai-btn", UI[lang].act[key]);
            btn.type = "button";
            btn.addEventListener("click", function () {
                ACTION_RUN[key]();
                if (window.innerWidth <= 600) setOpen(false);
            });
            box.appendChild(btn);
        });

        log.appendChild(box);
        scrollDown();
    }

    function render(reply, lang) {
        addBubble(reply.text, "bot");
        if (reply.products && reply.products.length) addProducts(reply.products, lang);
        if (reply.actions && reply.actions.length) addActions(reply.actions, lang);
    }

    function ask(text, intent) {
        touched = true;
        var lang = intent ? siteLang() : detectLang(text);

        addBubble(text, "user");
        var typing = addTyping();

        setTimeout(function () {
            typing.remove();
            render(intent ? buildReply(intent, lang, text) : answer(text, lang), lang);
        }, 450);
    }

    function renderStatic() {
        var lang = siteLang();
        var t = UI[lang];

        subtitle.textContent = t.sub;
        input.placeholder = t.ph;
        input.setAttribute("aria-label", t.ph);
        sendBtn.setAttribute("aria-label", t.send);
        closeBtn.setAttribute("aria-label", t.close);
        fab.setAttribute("aria-label", t.open);

        if (welcomeEl && !touched) welcomeEl.textContent = t.welcome;

        chips.textContent = "";
        Object.keys(t.chips).forEach(function (key) {
            var chip = h("button", "tau-ai-btn", t.chips[key]);
            chip.type = "button";
            chip.addEventListener("click", function () { ask(t.chips[key], key); });
            chips.appendChild(chip);
        });
    }

    function setOpen(open) {
        panel.classList.toggle("open", open);
        panel.inert = !open;
        fab.setAttribute("aria-expanded", open ? "true" : "false");

        if (open) {
            setTimeout(function () { input.focus(); }, 220);
        }
    }

    fab.addEventListener("click", function () {
        setOpen(!panel.classList.contains("open"));
    });

    closeBtn.addEventListener("click", function () {
        setOpen(false);
        fab.focus();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.classList.contains("open")) {
            setOpen(false);
            fab.focus();
        }
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = input.value.trim();
        if (!text) return;
        input.value = "";
        ask(text);
    });

    window.addEventListener("tau:lang", renderStatic);

    welcomeEl = addBubble(UI[siteLang()].welcome, "bot");
    renderStatic();
})();
// =====================================
// АНИМАЦИИ
// =====================================

// Появление блоков при прокрутке
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll(".section h2, .help-block, .footer-grid > div").forEach(element => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});

// Шапка при прокрутке
window.addEventListener("scroll", () => {
    document.querySelector(".header")
        .classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

// Уведомление вместо окна alert
function showToast(message) {
    const text = window.TAU_I18N ? window.TAU_I18N.t(message) : message;

    let box = document.getElementById("toasts");

    if (!box) {
        box = document.createElement("div");
        box.id = "toasts";
        box.setAttribute("data-no-i18n", "");
        document.body.appendChild(box);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    box.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}
// Пульсация кнопки «Добавить в корзину»
document.addEventListener("click", event => {
    const button = event.target.closest(".product-info .btn");

    if (!button) return;

    button.classList.remove("added");
    void button.offsetWidth;
    button.classList.add("added");
});
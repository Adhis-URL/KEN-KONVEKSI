// =====================================================
// CHECKOUT SYSTEM
// =====================================================

// Ambil cart

let cart = JSON.parse(localStorage.getItem("kenCart")) || [];

// =====================================================
// ELEMENT
// =====================================================

const checkoutItems = document.getElementById("checkoutItems");

const totalItemsElement = document.getElementById("totalItems");

const subtotalElement = document.getElementById("subtotal");

const shippingElement = document.getElementById("shippingPrice");

const grandTotalElement = document.getElementById("grandTotal");

const cartCountElement = document.getElementById("cartCount");

const orderBtn = document.getElementById("orderBtn");

// =====================================================
// RUPIAH
// =====================================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

// =====================================================
// RENDER CHECKOUT
// =====================================================

function renderCheckout() {
  checkoutItems.innerHTML = "";

  if (cart.length === 0) {
    checkoutItems.innerHTML = `

            <p style="
                color:#777;
                font-size:14px;
            ">

                Keranjang kamu kosong.

            </p>

        `;

    orderBtn.disabled = true;

    updateSummary();

    return;
  }

  orderBtn.disabled = false;

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;

    const itemElement = document.createElement("div");

    itemElement.className = "checkout-item";

    itemElement.innerHTML = `

                <div class="checkout-item-image">

                    PRODUCT

                </div>


                <div class="checkout-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        Size: ${item.size}
                    </p>

                    <p>
                        Jumlah: ${item.quantity}
                    </p>

                </div>


                <div class="checkout-item-price">

                    ${formatRupiah(subtotal)}

                </div>

            `;

    checkoutItems.appendChild(itemElement);
  });

  updateSummary();
}

// =====================================================
// GET SHIPPING
// =====================================================

function getShipping() {
  const selected = document.querySelector('input[name="shipping"]:checked');

  return selected ? Number(selected.value) : 15000;
}

// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {
  let totalItems = 0;

  let subtotal = 0;

  cart.forEach((item) => {
    totalItems += item.quantity;

    subtotal += item.price * item.quantity;
  });

  const shipping = subtotal > 0 ? getShipping() : 0;

  const grandTotal = subtotal + shipping;

  totalItemsElement.textContent = totalItems;

  subtotalElement.textContent = formatRupiah(subtotal);

  shippingElement.textContent = formatRupiah(shipping);

  grandTotalElement.textContent = formatRupiah(grandTotal);

  cartCountElement.textContent = totalItems;
}

// =====================================================
// SHIPPING CHANGE
// =====================================================

const shippingInputs = document.querySelectorAll('input[name="shipping"]');

shippingInputs.forEach((input) => {
  input.addEventListener("change", updateSummary);
});

// =====================================================
// CREATE ORDER
// =====================================================

orderBtn.addEventListener("click", function () {
  // ==============================
  // DATA PEMBELI
  // ==============================

  const name = document.getElementById("buyerName").value.trim();

  const phone = document.getElementById("buyerPhone").value.trim();

  const email = document.getElementById("buyerEmail").value.trim();

  const address = document.getElementById("address").value.trim();

  const city = document.getElementById("city").value.trim();

  const postalCode = document.getElementById("postalCode").value.trim();

  // ==============================
  // VALIDATION
  // ==============================

  if (!name || !phone || !address || !city || !postalCode) {
    alert("Mohon lengkapi data pembeli dan alamat.");

    return;
  }

  if (cart.length === 0) {
    alert("Keranjang kamu masih kosong.");

    return;
  }

  // ==============================
  // PAYMENT
  // ==============================

  const payment = document.querySelector('input[name="payment"]:checked').value;

  // ==============================
  // SHIPPING
  // ==============================

  const shipping = getShipping();

  // ==============================
  // TOTAL
  // ==============================

  let subtotal = 0;

  let totalItems = 0;

  cart.forEach((item) => {
    subtotal += item.price * item.quantity;

    totalItems += item.quantity;
  });

  const grandTotal = subtotal + shipping;

  // ==============================
  // CREATE ORDER
  // ==============================

  const order = {
    id: "KK-" + Date.now(),

    date: new Date().toISOString(),

    customer: {
      name: name,

      phone: phone,

      email: email,

      address: address,

      city: city,

      postalCode: postalCode,
    },

    items: cart,

    totalItems: totalItems,

    subtotal: subtotal,

    shipping: shipping,

    total: grandTotal,

    payment: payment,

    status: "Menunggu Pembayaran",
  };

  // ==============================
  // SAVE ORDER
  // ==============================

  let orders = JSON.parse(localStorage.getItem("kenOrders")) || [];

  orders.push(order);

  localStorage.setItem("kenOrders", JSON.stringify(orders));

  // ==============================
  // EMPTY CART
  // ==============================

  localStorage.removeItem("kenCart");

  // ==============================
  // SUCCESS
  // ==============================

  alert("Pesanan berhasil dibuat!");

  // ==============================
  // REDIRECT
  // ==============================

  window.location.href = "orders.html";
});

// =====================================================
// INITIALIZE
// =====================================================

renderCheckout();

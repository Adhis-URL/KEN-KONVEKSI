// =====================================================
// CART SYSTEM
// =====================================================

// Ambil data cart dari localStorage

let cart = JSON.parse(localStorage.getItem("kenCart")) || [];

// =====================================================
// ELEMENT
// =====================================================

const cartItemsElement = document.getElementById("cartItems");

const emptyCartElement = document.getElementById("emptyCart");

const totalItemsElement = document.getElementById("totalItems");

const subtotalElement = document.getElementById("subtotal");

const shippingElement = document.getElementById("shipping");

const grandTotalElement = document.getElementById("grandTotal");

const cartCountElement = document.getElementById("cartCount");

const checkoutBtn = document.getElementById("checkoutBtn");

// =====================================================
// FORMAT RUPIAH
// =====================================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

// =====================================================
// SAVE CART
// =====================================================

function saveCart() {
  localStorage.setItem("kenCart", JSON.stringify(cart));
}

// =====================================================
// RENDER CART
// =====================================================

function renderCart() {
  cartItemsElement.innerHTML = "";

  // Jika kosong

  if (cart.length === 0) {
    emptyCartElement.style.display = "block";

    checkoutBtn.disabled = true;

    checkoutBtn.style.opacity = "0.5";

    updateSummary();

    return;
  }

  emptyCartElement.style.display = "none";

  checkoutBtn.disabled = false;

  checkoutBtn.style.opacity = "1";

  // Buat item

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;

    const cartItem = document.createElement("div");

    cartItem.className = "cart-item";

    cartItem.innerHTML = `

                <div class="cart-product">

                    <div class="cart-product-image">

                        PRODUCT

                    </div>


                    <div class="cart-product-info">

                        <h3>
                            ${item.name}
                        </h3>

                        <p>
                            Size: ${item.size}
                        </p>

                        <button
                            class="remove-cart"
                            onclick="removeItem(${index})">

                            Hapus

                        </button>

                    </div>

                </div>


                <div class="cart-price">

                    ${formatRupiah(item.price)}

                </div>


                <div class="cart-quantity">

                    <button
                        onclick="decreaseQuantity(${index})">

                        −

                    </button>


                    <span>

                        ${item.quantity}

                    </span>


                    <button
                        onclick="increaseQuantity(${index})">

                        +

                    </button>

                </div>


                <div class="cart-subtotal">

                    ${formatRupiah(subtotal)}

                </div>

            `;

    cartItemsElement.appendChild(cartItem);
  });

  updateSummary();
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

  // Ongkir sementara

  const shipping = subtotal > 0 ? 15000 : 0;

  const grandTotal = subtotal + shipping;

  totalItemsElement.textContent = totalItems;

  subtotalElement.textContent = formatRupiah(subtotal);

  shippingElement.textContent = formatRupiah(shipping);

  grandTotalElement.textContent = formatRupiah(grandTotal);

  cartCountElement.textContent = totalItems;
}

// =====================================================
// INCREASE QUANTITY
// =====================================================

function increaseQuantity(index) {
  cart[index].quantity++;

  saveCart();

  renderCart();
}

// =====================================================
// DECREASE QUANTITY
// =====================================================

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }

  saveCart();

  renderCart();
}

// =====================================================
// REMOVE ITEM
// =====================================================

function removeItem(index) {
  const confirmRemove = confirm("Hapus produk dari keranjang?");

  if (!confirmRemove) {
    return;
  }

  cart.splice(index, 1);

  saveCart();

  renderCart();
}

// =====================================================
// CHECKOUT
// =====================================================

checkoutBtn.addEventListener("click", function () {
  if (cart.length === 0) {
    alert("Keranjang masih kosong.");

    return;
  }

  window.location.href = "checkout.html";
});

// =====================================================
// INITIALIZE
// =====================================================

renderCart();

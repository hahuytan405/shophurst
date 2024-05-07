const checkboxCartAll = document.getElementById('checkboxcart-all');
const checkboxCart = document.querySelectorAll('.checkboxcart');
const cartOptionBtns = document.querySelectorAll('.cart-tab-options-btn');

const ReplaceCart = btn => {
  const btnParent2 = btn.parentNode.parentNode.querySelector(
    '[class=cart-plus-minus]'
  );
  const csrf = btn.parentNode.parentNode.parentNode
    .querySelector('[class=product-remove]')
    .querySelector('input[name=_csrf]').value;
  const prodId = btn.parentNode.parentNode.parentNode
    .querySelector('[class=product-remove]')
    .querySelector('input[name=productId]').value;
  const qty = btnParent2.querySelector('input[name=qtybutton]').value;
  const qtyButtons = document.querySelectorAll('.qtybutton');
  for (const qtyButton of qtyButtons) {
    qtyButton.disabled = true;
  }

  fetch('/replace-cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'csrf-token': csrf,
    },
    body: JSON.stringify({
      qty: qty,
      prodId: prodId,
    }),
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      openNotification('Product has been added to your cart !');
      setTimeout(closeNotification, 3000);
      console.log(data);
      for (const qtyButton of qtyButtons) {
        qtyButton.disabled = false;
      }
    })
    .catch(err => {
      console.log(err);
    });
};

function UpdateSubtotal(input) {
  const price = parseFloat(
    input.parentNode.parentNode.previousElementSibling.textContent.replace(
      '$',
      ''
    )
  );

  const quantity = parseInt(
    input.parentNode.querySelector('input[name=qtybutton]').value
  );
  const subtotal = price * quantity;
  const subtotalElement = input.parentNode.parentNode.nextElementSibling;

  subtotalElement.textContent = `$${subtotal}`;
}

checkboxCartAll.addEventListener('change', function () {
  const isCheckedAll = checkboxCartAll.checked;
  for (const checkbox of checkboxCart) {
    checkbox.checked = isCheckedAll;
  }
  renderCartOptionsBtn();
  renderTotalPayment();
});

checkboxCart.forEach(checkbox => {
  checkbox.addEventListener('change', function () {
    const isCheckedAll =
      checkboxCart.length ===
      document.querySelectorAll('input[name="checkboxcart"]:checked').length;
    checkboxCartAll.checked = isCheckedAll;
    renderCartOptionsBtn();
    renderTotalPayment();
  });
});

function renderCartOptionsBtn() {
  var checkCount = document.querySelectorAll(
    'input[name="checkboxcart"]:checked'
  ).length;
  if (checkCount > 0) {
    for (const cartOptionBtn of cartOptionBtns) {
      cartOptionBtn.disabled = false;
    }
  } else {
    for (const cartOptionBtn of cartOptionBtns) {
      cartOptionBtn.disabled = true;
    }
  }
}

document
  .querySelector('.cart-tab-options-btn-delete')
  .addEventListener('click', deleteProductCartCheckBox);

function deleteProductCartCheckBox(e) {
  const csrf = document.querySelector('input[name=_csrf]').value;
  e.preventDefault();
  const checkedBoxs = document.querySelectorAll(
    'input[name="checkboxcart"]:checked'
  );
  let checkboxIdProducts = [];
  for (const checkedBox of checkedBoxs) {
    checkboxIdProducts.push(
      checkedBox.parentNode.parentNode.querySelector('input[name=productId]')
        .value
    );
  }

  fetch('/delete-multi-product-cart', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'csrf-token': csrf,
    },
    body: JSON.stringify({
      prodIds: checkboxIdProducts,
    }),
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      for (const checkedBox of checkedBoxs) {
        const productElement = checkedBox.closest('.product');
        productElement.remove();
      }
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (const checkbox of checkboxes) {
        checkbox.checked = false;
      }
      renderTotalPayment();
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });
}

document
  .querySelector('.cart-tab-options-btn-wishlist')
  .addEventListener('click', wishlistProductCartCheckBox);

function wishlistProductCartCheckBox(e) {
  const csrf = document.querySelector('input[name=_csrf]').value;
  e.preventDefault();
  const checkedBoxs = document.querySelectorAll(
    'input[name="checkboxcart"]:checked'
  );
  let checkboxIdProducts = [];
  for (const checkedBox of checkedBoxs) {
    checkboxIdProducts.push(
      checkedBox.parentNode.parentNode.querySelector('input[name=productId]')
        .value
    );
  }

  fetch('/add-multi-product-wishlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'csrf-token': csrf,
    },
    body: JSON.stringify({
      prodIds: checkboxIdProducts,
    }),
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (const checkbox of checkboxes) {
        checkbox.checked = false;
      }
      if (data.message == 'The product is already on the wishlish') {
        openNotification(
          'The product is already on the wishlish!!! <a href="/wishlist">Go to wishlish</a>'
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
}

document
  .querySelector('#submit-cart-to-order')
  .addEventListener('click', postCartToCheckout);

function postCartToCheckout(e) {
  const csrf = document.querySelector('input[name=_csrf]').value;
  e.preventDefault();
  const checkedBoxs = document.querySelectorAll(
    'input[name="checkboxcart"]:checked'
  );
  let checkboxIdProducts = [];
  for (const checkedBox of checkedBoxs) {
    checkboxIdProducts.push(
      checkedBox.parentNode.parentNode.querySelector('input[name=productId]')
        .value
    );
  }
  fetch('/cart-to-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'csrf-token': csrf,
    },
    body: JSON.stringify({
      prodIds: checkboxIdProducts,
    }),
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      if (data.message == 'Check out already exists') {
        openNotification(
          'Check out already exists!!! <a href="/checkout">Go to checkout</a>'
        );
      } else {
        window.location.href = '/checkout';
      }
    })
    .catch(err => {
      console.log(err);
    });
}

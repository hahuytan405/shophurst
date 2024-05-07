const cartElement = document.querySelector('.all-cart-product');

const AddCart = btn => {
  const btnParent2 = btn.parentNode.parentNode.querySelector(
    '[class=cart-plus-minus]'
  );
  const csrf = btn.parentNode.querySelector('input[name=_csrf]').value;
  const prodId = btn.parentNode.querySelector('input[name=productId]').value;

  let qty = 1;
  if (document.querySelector('input[name=qtybutton]')) {
    qty = btnParent2.querySelector('input[name=qtybutton]').value;
  }
  fetch('/add-cart', {
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
      if (cartElement) {
        if (cartElement.querySelector(`input[value="${prodId}"]`)) {
          productElement = cartElement.querySelector(`input[value="${prodId}"]`)
            .parentNode.parentNode.parentNode;
          productElement.remove();
        }
        updateCartHtml = `<div class="single-cart clearfix product">
                            <div class="cart-photo">
                                <a href="/products/${prodId}"><img src="https://lh3.googleusercontent.com/u/0/d/${data.imageUrlP}" alt="" /></a>
                            </div>
                            <div class="cart-info">
                                <h5><a href="/products/${prodId}">${data.titleP}</a></h5>
                                <p class="mb-0 priceP">Price : $ ${data.priceP}</p>
                                <p class="mb-0 qtyP">Qty : ${data.qtyP} </p>
                                <span class="cart-delete">
                                    <input type="hidden" value="${prodId}" name="productId">
                                    <input type="hidden" name="_csrf" value="${data.csrfToken}">
                                    <a href="#"><i class="zmdi zmdi-close" onclick="deleteProductCart(this)"></i></a>
                                </span>
                            </div>
                        </div>`;
        const noCart = document.querySelector('.no-product');
        if (noCart) {
          noCart.remove();
        }
        cartElement.insertAdjacentHTML('beforeend', updateCartHtml);
        const totalPriceUpdate = data.totalCartPrice + qty * data.priceP;
        const totalProductsUpdate = data.totalCartProducts + parseInt(qty);
        document.querySelector(
          '.price-totals'
        ).innerText = `$  ${totalPriceUpdate}`;
        const productsTotalElements =
          document.querySelectorAll('.products-total');
        for (const productsTotalElement of productsTotalElements) {
          productsTotalElement.innerText = totalProductsUpdate;
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const deleteProductCart = btn => {
  const productId = btn.parentNode.parentNode.querySelector(
    'input[name=productId]'
  ).value;
  const csrf =
    btn.parentNode.parentNode.querySelector('input[name=_csrf]').value;

  const productElement = btn.closest('.product');

  fetch('/delete-product-cart/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      if (cartElement) {
        const price = productElement
          .querySelector('.priceP')
          .textContent.replace('Price : $ ', '');
        const qty = productElement
          .querySelector('.qtyP')
          .textContent.replace('Qty : ', '');
        const totalCartProducts =
          document.querySelector('.products-total').textContent;
        const totalCartPrice = document
          .querySelector('.price-totals')
          .textContent.replace('$  ', '');
        const totalPriceUpdate = totalCartPrice - qty * price;
        const totalProductsUpdate = totalCartProducts - parseInt(qty);
        document.querySelector(
          '.price-totals'
        ).innerText = `$  ${totalPriceUpdate}`;
        const productsTotalElements =
          document.querySelectorAll('.products-total');
        for (const productsTotalElement of productsTotalElements) {
          productsTotalElement.innerText = totalProductsUpdate;
        }
      }
      productElement.remove();
      renderTotalPayment();
    })
    .catch(err => {
      console.log(err);
    });
};

const AddWishList = btn => {
  const csrf = btn.parentNode.querySelector('input[name=_csrf]').value;
  const prodId = btn.parentNode.querySelector('input[name=productId]').value;

  fetch('/add-wishlist/' + prodId, {
    method: 'POST',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      if (data.message == 'The product is already on the wishlish') {
        openNotification(
          'The product is already on the wishlish!!! <a href="/wishlist">Go to wishlish</a>'
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const deleteProductWishlish = btn => {
  const productId = btn.parentNode.parentNode.querySelector(
    'input[name=productId]'
  ).value;
  const csrf =
    btn.parentNode.parentNode.querySelector('input[name=_csrf]').value;

  const productElement = btn.closest('.product');

  fetch('/delete-product-wishlish/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      productElement.remove();
    })
    .catch(err => {
      console.log(err);
    });
};

function renderTotalPayment() {
  const checkedBoxs = document.querySelectorAll(
    'input[name="checkboxcart"]:checked'
  );
  let qtyChekedBox = new Number();
  let subtotalChekedBox = new Number();
  for (const checkedBox of checkedBoxs) {
    qtyChekedBox += parseInt(
      checkedBox.parentNode.parentNode.querySelector('input[name=qtybutton]')
        .value
    );
    subtotalChekedBox += parseFloat(
      checkedBox.parentNode.parentNode
        .querySelector('.product-subtotal')
        .textContent.replace('$', '')
    );
  }
  if (document.querySelector('.totalProducts')) {
    document.querySelector(
      '.totalProducts'
    ).innerText = `TOTAL PAYMENT (${qtyChekedBox} Product): `;
    document.querySelector('.totalPrice').innerText = `$ ${subtotalChekedBox}`;
  }
}

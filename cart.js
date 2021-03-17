document.addEventListener('DOMContentLoaded', () => {
    const productsBtn = document.querySelectorAll('.product__btn');
    const cartProductsList = document.querySelector('.cart-content__list');
    const cart = document.querySelector('.cart');
    const cartQuantity = document.querySelector('.cart__quantity');
    const fullPrice = document.querySelector('.fullprice');
    const orderModalOpenProd = document.querySelector('.order-modal__btn');
    const orderModalList = document.querySelector('.order-modal__list');
    let price = 0;
    let randomId = 0;
    let productArray = [];

    // const randomId = () => {
    //     return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // };

    const priceWithoutSpaces = (str) => {
        return str.replace(/\s/g, '');
    };

    const normalPrice = (str) => {
        return String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    };

    const plusFullPrice = (currentPrice) => {
        return price += currentPrice;
    };

    const minusFullPrice = (currentPrice) => {
        return price -= currentPrice;
    };

    const printFullPrice = () => {
        fullPrice.textContent = `${normalPrice(price)} грн`;
    };

    const printQuantity = () => {
        let length = cartProductsList.querySelector('.simplebar-content').children.length;
        cartQuantity.textContent = length;
        length > 0 ? cart.classList.add('active') : cart.classList.remove('active')
    };

    const generateCartProduct = (img, title, price, id) => {
        return `
        <li class="cart-content__item">
            <article class="cart-content__product cart-product" data-id="${id}">
                <img src="${img}" alt="goods" class="cart-product__img">
                <div class="cart-product__text">
                    <h3 class="cart-product__title">${title}</h3>
                    <span class="cart-product__price">${normalPrice(price)} грн</span>
                </div>
                <button class="cart-product__delete" aria-label="Видалити товар">
                    <ion-icon class="cart-product__delete" name="trash"></ion-icon>
                </button>
            </article>
        </li>
        `;
    }

    const deleteProducts = (productParent) => {

        let id = productParent.querySelector('.cart-product').dataset.id;
        document.querySelector(`.goods-front[data-id="${id}"]`).querySelector('.product__btn').disabled = false;
        document.querySelector(`.goods-front[data-id="${id}"]`).querySelector('.product__btn').textContent = 'В корзину';

        let currentPrice = parseInt(priceWithoutSpaces(productParent.querySelector('.cart-product__price').textContent));
        minusFullPrice(currentPrice);
        printFullPrice();
        productParent.remove();

        printQuantity();

        updateStorage();
    };

    productsBtn.forEach(el => {
        el.closest('.goods-front').setAttribute('data-id', randomId++);
        el.addEventListener('click', (e) => {
            let self = e.currentTarget;
            let parent = self.closest('.goods-front');
            let id = parent.dataset.id;
            let img = parent.querySelector('img').getAttribute('src');
            let title = parent.querySelector('.goods-title').textContent;
            // let priceString = parent.querySelector('.price').textContent;
            let priceNumber = parseInt(priceWithoutSpaces(parent.querySelector('.price').textContent));
            
            plusFullPrice(priceNumber);
            printFullPrice();
            // add to cart
            cartProductsList.querySelector('.simplebar-content').insertAdjacentHTML('afterbegin', generateCartProduct(img, title, priceNumber, id));

            printQuantity();

            updateStorage();

            // disabled btn
            self.disabled = true;
            parent.querySelector('.product__btn').textContent = 'В корзині';
        });
    });

    cartProductsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-product__delete')) {
            deleteProducts(e.target.closest('.cart-content__item'));
        }
    });

    let flag = 0;
    orderModalOpenProd.addEventListener('click', (e) => {
        if (flag == 0) {
            orderModalOpenProd.classList.add('open');
            orderModalList.style.display = 'block';
            flag = 1;
        } else {
            orderModalOpenProd.classList.remove('open');
            orderModalList.style.display = 'none';
            flag = 0;
        }
    });

    const generateModalProduct = (img, title, price, id) => {
        return `
            <li class="order-modal__item">
                <article class="order-modal__product order-product" data-id="${id}">
                    <img src="${img}" alt="" class="order-product__img">
                    <div class="order-product__text">
                        <h3 class="order-product__title">${title}</h3>
                        <span class="order-product__price">${normalPrice(price)} грн</span>
                    </div>
                    <button class="order-product__delete">Видалити</button>
                </article>
            </li>
        `;
    }

    const modal = new GraphModal({
        isOpen: (modal) => {
            console.log('opened');
            let array  = cartProductsList.querySelector('.simplebar-content').children;
            let fullprice = fullPrice.textContent;
            let length = array.length;

            document.querySelector('.order-modal__quantity span').textContent = `${length} шт`;
            document.querySelector('.order-modal__summ span').textContent = `${fullprice}`;
            for (item of array) {
                // console.log(item);
                let img = item.querySelector('.cart-product__img').getAttribute('src');
                let title = item.querySelector('.cart-product__title').textContent;
                let priceNumber = parseInt(priceWithoutSpaces(item.querySelector('.cart-product__price').textContent));
                let id = item.querySelector('.cart-product').dataset.id;

                orderModalList.insertAdjacentHTML('afterbegin', generateModalProduct(img, title, priceNumber, id));

                let obj = {};
                obj.title = title;
                obj.price = priceNumber;
                obj.id = id;
                productArray.push(obj);
            }

            console.log(productArray);
        },
        isClose: () => {
            console.log('closed');
            document.querySelectorAll('.order-modal__item').forEach(e => {
                e.innerHTML = '';
            });
            productArray = [];
        }
    });

    const countSumm = () => {
        document.querySelectorAll('.cart-content__item').forEach(el => {
            price += parseInt(priceWithoutSpaces(el.querySelector('.cart-product__price').textContent));
        });
    };

    const initialState = () => {
        if (localStorage.getItem('products') !== null) {
            cartProductsList.querySelector('.simplebar-content').innerHTML = localStorage.getItem('products');
            printQuantity();
            countSumm();
            printFullPrice();

            document.querySelectorAll('.cart-content__product').forEach(el => {
                let id = el.dataset.id;
                document.querySelector(`.goods-front[data-id="${id}"]`).querySelector('.product__btn').disabled = true;
            });
        }
    };

    initialState();

    const updateStorage = () => {
        let parent = cartProductsList.querySelector('.simplebar-content');
        let html = parent.innerHTML;
        html = html.trim();
        // console.log(html);
        // console.log(html.length);
        if (html.length) {
            localStorage.setItem('products', html);
        } else {
            localStorage.removeItem('products');
        }
    };

    document.querySelector('.modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('order-product__delete')) {
            let i = 0;
            let id = e.target.closest('.order-modal__product').dataset.id;
            let array  = cartProductsList.querySelector('.simplebar-content').children;
            let cartProduct = document.querySelector(`.cart-content__product[data-id="${id}"]`).closest('.cart-content__item');
            deleteProducts(cartProduct);
            e.target.closest('.order-modal__product').remove();

            document.querySelectorAll('.order-product__price').forEach(e => {
                i += parseInt(priceWithoutSpaces(e.textContent));
            });
            document.querySelector('.order-modal__summ span').textContent = `${normalPrice(i)} грн`;
            
            const index = productArray.findIndex(el => el.id === id);
                if (index !== -1) {
                    productArray.splice(index, 1);
                }

            document.querySelector('.order-modal__quantity span').textContent = `${productArray.length} шт`;

            console.log(productArray);

        }
    });

    document.querySelector('.order').addEventListener('submit', (e) => {
        e.preventDefault();
        // let self = e.currentTarget;
        // let formData = new FormData(self);
        // let name = self.querySelector('[name="Імя"]').value;
        // let tel = self.querySelector('[name="Телефон"]').value;
        // let mail = self.querySelector('[name="Email"]').value;
        // formData.append('Товари', JSON.stringify(productArray));
        // formData.append('Імя', name);
        // formData.append('Телефон', tel);
        // formData.append('Email', mail);

        const cartLog = () => {
            let arr = [];
            productArray.forEach(element => {
                // arr.push(`Назва: ${element.title}`);
                // arr.push(` Ціна: ${element.price}`);
                // arr.push(` id: ${element.id}\n`);

                arr.push(`<br><tr>
                            <td style='padding: 10px; border: #e9e9e9 1px solid;'>Назва: ${element.title}</td>
                            <td style='padding: 10px; border: #e9e9e9 1px solid;'>Ціна: ${element.price}</td>
                        </tr>`);

            });
            return arr;
          };
          
          function checkValue() {
            let FormValue =
              "Ім'я: " +
              document.querySelector('#formName').value +
              "<br>Телефон: " +
              document.querySelector('#formTel').value +
              "<br>Місто: " +
              document.querySelector('#formCity').value +
              "<br>Дані: " +
              document.querySelector('#formDelivery').value +
              "<br>Замовлення: ";
            return FormValue;
          }
          
          const readyMail = () => {        

            return checkValue() + cartLog();
          };

          const sendSuccess = () => {
            document.querySelector('.order__btn').style.backgroundColor = '#54da5b';
            document.querySelector('.order__btn').textContent = 'Замовлення надіслано!';
            document.querySelector('.order__btn').disabled = true;
          };

    
        function sendMail() {     
            // console.log(readyMail());           
            if (!localStorage.length == "0") {
              Email.send({
                SecureToken: "d0a2a0ff-f5ee-4abf-9573-bd98689c8945",
                To: "jannashop09@etlgr.com",
                From: "mailbot7000@gmail.com",
                Subject: "Замовлення",
                Body: readyMail()
              }).then(sendSuccess());
            }
          }

          sendMail();

          console.log('submit');

    });
});
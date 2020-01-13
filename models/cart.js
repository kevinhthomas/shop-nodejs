const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
  );

module.exports = class Cart {
    constructor() {
        this.products = [];
        this.totalPrice = 0;
    }

    static addProduct(id, price) {
        //fetch prev cart and add to it
        fs.readFile(p, (err, fileContent) => {
            let cart = new Cart();
            if (!err) {
                cart = JSON.parse(fileContent);
            }

            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];

            
            if (existingProduct) {
                existingProduct.qty++;
            } else {
                let updatedProduct;
                updatedProduct = {id: id, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }

            cart.totalPrice = cart.totalPrice + +price;

            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            })
        })
    }

    static removeProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }

            let cart = { ...JSON.parse(fileContent) };

            console.log(cart);

            const product = cart.products.find((prod) => prod.id === id);

            if (!product) {
                return;
            }

            cart.products = cart.products.filter((prod) => prod.id !== id);
            cart.totalPrice = cart.totalPrice - (productPrice * product.qty);

            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                cb(null);
            } else {
                cb(cart);
            }
        });
    }

}
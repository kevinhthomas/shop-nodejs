const Product = require('../models/product');
const Cart = require('../models/cart');
exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render(
            'shop/index', 
            {
                pageTitle: 'Shop Home',
                path: '/',
                products: products
            }
        );
    });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render(
            'shop/products', 
            {
                pageTitle: 'Products',
                path: '/',
                products: products
            }
        );
    });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        res.render(
            'shop/product-detail', 
            {
                pageTitle: "Detail View",
                path: '/products',
                product: product
            }
        )
    });
};

exports.getCart = (req, res, next) => {
    Cart.getCart((cart) => {
        Product.fetchAll((products) => {
            const cartProducts = [];

            for (product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if (cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty});
                }
            }

            res.render(
                'shop/cart', 
                {
                    pageTitle: 'Your Cart',
                    path: '/cart',
                    products: cartProducts
                }
            )
        })

       
    });

    
};


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    
    Product.findById(prodId, (product) => {
        Cart.addProduct(product.id, product.price);
    })

    res.redirect('/cart');
};

exports.postRemoveCartItem = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.removeProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render(
        'shop/cart', 
        {
            pageTitle: 'Your Cart',
            path: '/cart'
        }
    )
};

exports.getCheckout = (req, res, next) => {
    res.render(
        'shop/checkout', 
        {
            pageTitle: 'Checkout',
            path: '/checkout'
        }
    ) 
};
const Product = require ('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product'
    });
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getAllProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render('shop', {
            pageTitle: 'Shop Home',
            path: '/',
            products: products
        });
    });
};
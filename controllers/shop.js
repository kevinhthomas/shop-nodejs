const fs = require('fs');
const path = require('path');

const config = require('../config/config');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(config.STIPE_API_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const error = require('../utils/error');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  const page = req.query.page ? +req.query.page : 1; // +req.query.page || 1

  Product.find()
    .countDocuments()
    .then((count) => {
      itemCount = count;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/index', {
        pageTitle: 'Shop Home',
        path: '/',
        products: products,
        itemCount: itemCount,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < itemCount,
        previousPage: page - 1,
        nextPage: page + 1,
        lastPage: Math.ceil(itemCount / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getProducts = (req, res, next) => {
  const page = req.query.page ? +req.query.page : 1; // +req.query.page || 1

  Product.find()
    .countDocuments()
    .then((count) => {
      itemCount = count;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/products', {
        pageTitle: 'Products',
        path: '/',
        products: products,
        itemCount: itemCount,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < itemCount,
        previousPage: page - 1,
        nextPage: page + 1,
        lastPage: Math.ceil(itemCount / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: 'Detail View',
        path: '/products',
        product: product
      });
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: user.cart.items
      });
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.postRemoveCartItem = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders: orders
      });
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', //http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then((stripeSession) => {
      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products: products,
        totalSum: total,
        stripeSessionId: stripeSession.id
      });
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id
        },
        products: products
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch((err) => {
      return error.throwError(err, next);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found.'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Not authorized to view this document'));
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath)); //stores pdf on server
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });

      pdfDoc.fontSize(14);

      let total = 0;
      order.products.forEach((prod) => {
        pdfDoc.text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price);
        total += prod.product.price * prod.quantity;
      });

      pdfDoc.text('-----');
      pdfDoc.fontSize(16).text('Total Price: $' + total);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const errorController = require('./controllers/error');
const sequelize = require('./utils/db');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const db = require('./utils/db');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

//parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log(err)
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use('/', errorController.get404);



Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });


sequelize.sync()
    .then((result) => {
        return User.findByPk(1);
    })
    .then((user) => {
        if (!user) {
            return User.create({ name: 'Tester', email: 'test@test.te' })
                .then((user) => {
                    return user.createCart();
                })
                .catch((err) => {
                    console.log(err);
                })
        }

        return Promise.resolve(user);
    })
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });


const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resetToken: {
    type: String
  },
  resetTokenExpiration: {
    type: Date
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + newQuantity;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }

  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.getCart = function() {
  const productIds = this.cart.items.map(i => {
    return i.productId;
  });

  return this.cart;
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addOrder = function() {
  const db = getDb();
  return this.getCart()
    .then(products => {
      const order = {
        items: products,
        user: {
          _id: this._id,
          name: this.name
        }
      };

      return db.collection("orders").insertOne(order);
    })
    .then(result => {
      this.cart = { items: [] };
      return db
        .collection("users")
        .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
    });
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

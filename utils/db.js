const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('udemy-shop', 'root', 'lvya', {dialect: 'mysql', host:'localhost'});

module.exports = sequelize;
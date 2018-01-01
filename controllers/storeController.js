const mongoose = require('mongoose');
// You can reference 'Store' model here directly because it was already imported
// in start.js.
const Store = mongoose.model('Store')

exports.homePage = (req, res) => {
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
};

exports.createStore = async (req, res) => {
    const store = new Store(req.body);
    await store.save();
    res.redirect('/');
};
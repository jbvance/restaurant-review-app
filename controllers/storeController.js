const mongoose = require('mongoose');
// You can reference 'Store' model here directly because it was already imported
// in start.js.
const Store = mongoose.model('Store')
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/')
        if (isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed!'}, false);
        }
    }
}

exports.homePage = (req, res) => {   
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async(req, res, next) => {
    //check if there is a new file to resize
    if (!req.file) {
        next(); //skip to the next middleware
        return;
    }
    const extension = req.file.mimetype.split("/")[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    //now resize the photo
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    //Once photo is saved to file system, keep going
    next();
}

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully created ${store.name}. Care to leave a review?`)
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
    const stores = await Store.find();   
    res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
    //1. Find the store given the id
   const store = await Store.findOne({ _id: req.params.id });   
    //2. Confirm the user is the owner of the store
    //3. Render out the edit form so edit can update their store
    res.render('editStore', {title: `Edit ${store.name}`, store})
};

exports.updateStore = async (req, res) => {
    // set the location data to be a point
    req.body.location.type = 'Point';
    // find and update store
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
        new: true, //return the new store instead of the old one
        runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
    res.redirect(`/stores/${store._id}/edit`);
    //redirect them to the store and tell them it worked
};

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug})
    if(!store)  return next();
    res.render('store', { store, title: store.name })
 
}
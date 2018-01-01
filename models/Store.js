const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name.'
    },
    slug: String,
    description: {
        type: String,
        trim:true
    },
    tags: [String],
});

//Use the pre-save hook to generate the slug
storeSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        next(); //skip it, no need to run this b/c name hasn't changed
        return;
    }
    this.slug = slug(this.name);
    next();
    //TODO make sure slug is unique    
})

module.exports = mongoose.model('Store', storeSchema);
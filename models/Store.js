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
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String
});

//Use the pre-save hook to generate the slug
storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next(); //skip it, no need to run this b/c name hasn't changed
        return;
    }
    this.slug = slug(this.name);
    //see if any other stores have the same slug already
    const slugRegExp = new RegExp(`^(${this.slug}((-[0-9]*$)?)$)`, 'i')
    const storesWithSlug = await this.constructor.find({slug: slugRegExp})
    if(storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
    //TODO make sure slug is unique    
})

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } }},
        { $sort: { count: -1  }}
    ]);
};

module.exports = mongoose.model('Store', storeSchema);
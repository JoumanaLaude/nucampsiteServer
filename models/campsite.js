// schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // defining Schema to use the Schema object

// defines Schema type
require('mongoose-currency').loadType(mongoose);
// middleware "Currency"
const Currency = mongoose.Types.Currency;

// creating new instance of the Schema object
const commentSchema = new Schema({
    // JS Object Notation (JSON) is a data structure that contains a "key: value pair"
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // we now store a ref to a user doc thru the user docs objectid
        ref: 'User' // holds the name of the model of the doc
    }
}, {
    timestamps: true
});

const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true, // name required
        unique: true // no 2 docs should have same name field
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    // Sub-document | Campsites can have multiple comments
    comments: [commentSchema]
},
    {
        timestamps: true // causes mongoose to add 'createdAt' and 'updatedAt'
    });

// model - first arg always capitalized & singular 
const Campsite = mongoose.model('Campsite', campsiteSchema);
// mongoose.model returns constructor function

module.exports = Campsite;
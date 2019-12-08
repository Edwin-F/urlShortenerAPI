'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UrlEntries = new Schema ({
  url: {type: String, required: true},
  index: {type: Number, required: true}
});

module.exports = mongoose.model('UrlEntries', UrlEntries);
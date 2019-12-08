'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Counters = new Schema ({
  count: {type: Number, default: 1}
});

module.exports = mongoose.model('Counters', Counters);
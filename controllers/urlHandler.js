'use strict';

let Counters = require('../models/counters.js');
let UrlEntries = require('../models/urlEntries.js'); //urlRecords or urlListing
let dns = require('dns');

function getCountAndIncrease(req, res, callback) {
  Counters.findOneAndUpdate({}, {$inc:{'count': 1}}, function(err, data) {
    if (err) return;
    //if Counter exists, get the count
    if (data) {
      callback(data.count);
    } else {
      //create a new counter object if none exist in db and save
      let Counter = new Counters();

      Counter.save(function(err) {
        if (err) return;

        Counters.findOneAndUpdate({}, {$inc:{'count': 1}}, 
          function(err, data) {
          if (err) return;
          callback(data.count);
        });
      });
    }
  });
};

function checkURLisValid(req, res, callback) {
  // Sarch for '://', store protocol and hostname+path
  let protocolRegExp = /^https?:\/\/(.*)/i; //captures hostname+path

  // Search for patterns like xxx.xxx.xxx etc.
  let hostnameRegExp = /^([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i; 
  //captures xxx. 1 or more times

  let url = req.body.url;
  // find similar and slice extra / at the end
  // www.ex.com/ and www.ex.com are the same URL
  if (url.match(/\/$/i) ) {
    url = url.slice(0, -1);
  }

  // check that url has valid protocol
  let protocolMatch = url.match(protocolRegExp);
  if (!protocolMatch) {
    return res.json({"error": "invalid URL"});
  }

  // remove temporarily the protocol for dns lookup
  let hostAndPath = protocolMatch[1];

  let hostnameMatch = hostAndPath.match(hostnameRegExp);

  if (!hostnameMatch){
    // the URL has no www.ex.com format
    res.json({"error": "invalid URL"});

  } else {
    // the URL has a valid www.ex.com[/optional] format
    dns.lookup(hostnameMatch[0], function(err) {
      if (err) {
        // no DNS match, invalid Hostname
        res.json({"error": "invalid Hostname"});

      } else {
        // URL is ok, check if it's already stored
        callback(url);
      }
    });
  }
}

// function to add URL to db
exports.addUrl = function (req, res) {
  checkURLisValid(req, res, function(validURL){
    // URL is ok, check if it's already stored
    UrlEntries.findOne({"url": validURL}, function(err, storedUrl) {
      if (err) return;
      if (storedUrl) {
        //URL is already in the DB, return the matched one
        res.json({"original url": validURL, "short_url": storedUrl.index});
      } else {
        // Increase Counter and store the new URL,
        getCountAndIncrease(req, res, function(cnt) {
          let newUrlEntry = new UrlEntries({
            'url': validURL,
            'index': cnt
          });

          //then save and return the stored data
          newUrlEntry.save(function(err) {
            if (err) return;
            res.json({"original_url": validURL, "short_url": cnt});
          });
        });
      }
    });
  });
}

exports.processShortUrl = function (req,res) {
  var shortUrl = req.params.shurl;
  if (!parseInt(shortUrl, 10) ) {
    // The short URL indentifier is not a number
    res.json({"error": "Wrong Format"});
    return;
  }

  UrlEntries.findOne({"index": shortUrl}, function(err, data) {
    if (err) return;
    if (data) {
      // redirect to the stored page
      res.redirect(data.url);
    } else {
      res.json({"error": "No short url found for given input"});
    }
  });
}
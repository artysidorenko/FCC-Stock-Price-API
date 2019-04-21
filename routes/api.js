/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var request = require('request');
const API_KEY = process.env.API_KEY;

module.exports = function (app, collection) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      const stock = req.query.stock
      const like = req.query.like
      const ip = req.connection.remoteAddress
      
      // OPTION 1 - REQUEST IS A SINGLE STOCK
      if (!Array.isArray(stock)) {
        // STEP 1 - check for likes in the database and add like if required
        processLikes(stock, like, ip, (likes) => {
          // STEP 2 - get external data from API
          getExternalData(stock, (data) => {
            // STEP 3 - form a bespoke response Obj with combined external and db data
            res.json({
              stockData: {
                stock: data['01. symbol'],
                price: data['05. price'],
                likes: likes
              }
            })
          })
        })
      }

      // OPTION 2 - REQUEST IS AN ARRAY OF 2 STOCKS
      else if (Array.isArray(stock)) {
        console.log('option 2 triggered')
        // STOCK 1 - LIKES
        processLikes(stock[0], like, ip, (likes0) => {
          // STOCK 1 - DATA
          getExternalData(stock[0], (data0) => {
            // STOCK 2 - LIKES
            processLikes(stock[1], like, ip, (likes1) => {
              //STOCK 2 - DATA
              getExternalData(stock[1], (data1) => {
                res.json({
                  stockData: [
                    {
                      stock: data0['01. symbol'],
                      price: data0['05. price'],
                      rel_likes: likes0 - likes1
                    },
                    {
                      stock: data1['01. symbol'],
                      price: data1['05. price'],
                      rel_likes: likes1 - likes0
                    }
                  ]
                })
              })
            }) 
          })
        })
      }

    });

  function processLikes(stock, like, ip, callback) {
    if (!like) {
      collection.findOne({stock: stock}, (dbErr, doc) => {
        if (dbErr) console.log(`Error fetching from mongodb: ${dbErr}`)
        if (doc === null) callback(0)
        else callback(doc.likes.length)
      })
    }
    if (like) {
      collection.findOneAndUpdate({stock: stock}, {$addToSet: {likes: ip}}, {returnOriginal: false, upsert: true}, (dbErr, doc) => {
        if (dbErr) console.log(`Error fetching and updating mongodb: ${dbErr}`)
        callback(doc.value.likes.length)
      })
    }
  }

  function getExternalData(stock, callback) {
    const URL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${API_KEY}`
    request.get(URL, (requestErr, response, body) => {
      if (requestErr) console.log(`Error fetching from external API: ${requestErr}`)
      let json = JSON.parse(body)['Global Quote']
      console.log(json)
      callback(json)
    })
  }
    
};

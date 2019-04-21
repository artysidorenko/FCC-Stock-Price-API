/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

// IMPORTANT!!!!
// API ONLY EXCEPTS UP TO 5 REQUESTS PER MINUTE
// CONSEQUENTLY IF ALL TESTS ARE RUN TOGETHER THE LAST ONE WILL FAIL
// RUN INDIVIDUALLY/SPLIT INTO TWO GROUPS THEY WILL PASS

suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          assert.equal(res.status, 200, 'Response should be successful - 200')
          assert.property(res.body.stockData, 'stock', 'response obj should have stock name')
          assert.property(res.body.stockData, 'price', 'response obj should have stock price')
          assert.property(res.body.stockData, 'likes', 'response obj should have stock likes count')
          assert.equal(res.body.stockData.stock.toLowerCase(), 'goog', 'stock name should match data sent (case insensitive)')
          done();
        });
      });
      
      let likes;

      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'goog', like: true })
          .end(function (err, res) {

            assert.equal(res.status, 200, 'Response should be successful - 200')
            assert.property(res.body.stockData, 'stock', 'response obj should have stock name')
            assert.property(res.body.stockData, 'price', 'response obj should have stock price')
            assert.property(res.body.stockData, 'likes', 'response obj should have stock likes count')
            assert.equal(res.body.stockData.stock.toLowerCase(), 'goog', 'stock name should match data sent (case insensitive)')
            assert.isAbove(res.body.stockData.likes, 0, 'stock has at least 1 like')
            likes = res.body.stockData.likes
            done();
          });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'goog', like: true })
          .end(function (err, res) {

            assert.equal(res.status, 200, 'Response should be successful - 200')
            assert.property(res.body.stockData, 'stock', 'response obj should have stock name')
            assert.property(res.body.stockData, 'price', 'response obj should have stock price')
            assert.property(res.body.stockData, 'likes', 'response obj should have stock likes count')
            assert.equal(res.body.stockData.stock.toLowerCase(), 'goog', 'stock name should match data sent (case insensitive)')
            assert.equal(res.body.stockData.likes, likes, 'stock has same likes as in previous request')
            done();
          });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'axp'] })
          .end(function (err, res) {

            assert.equal(res.status, 200, 'Response should be successful - 200')
            assert.isArray(res.body.stockData, 'response should be an array')
            assert.equal(res.body.stockData.length, 2, 'response array should have 2 entries')
            assert.property(res.body.stockData[0], 'stock', 'response obj should have stock name')
            assert.property(res.body.stockData[0], 'price', 'response obj should have stock price')
            assert.property(res.body.stockData[0], 'rel_likes', 'response obj should have relatives likes count')
            assert.equal(res.body.stockData[0].stock.toLowerCase(), 'goog', 'stock name should match data sent (case insensitive)')
            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0, 'relative likes should cancel out')
            done();
          });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'axp'], like: true })
          .end(function (err, res) {

            assert.equal(res.status, 200, 'Response should be successful - 200')
            assert.isArray(res.body.stockData, 'response should be an array')
            assert.equal(res.body.stockData.length, 2, 'response array should have 2 entries')
            assert.property(res.body.stockData[0], 'stock', 'response obj should have stock name')
            assert.property(res.body.stockData[0], 'price', 'response obj should have stock price')
            assert.property(res.body.stockData[0], 'rel_likes', 'response obj should have relatives likes count')
            assert.oneOf(res.body.stockData[0].stock, ['GOOG', 'AXP']);
            assert.oneOf(res.body.stockData[1].stock, ['GOOG', 'AXP']);
            assert.equal(res.body.stockData[0].stock.toLowerCase(), 'goog', 'stock name should match data sent (case insensitive)')
            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0, 'relative likes should cancel out')
            done();
          });
      });
      
    });

});

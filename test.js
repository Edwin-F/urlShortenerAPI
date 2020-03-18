var chai = require('chai');
var assert = chai.assert;

var server = require('./server');    /** import the Express app **/

var chaiHttp = require('chai-http');  /** require the chai-http plugin **/
chai.use(chaiHttp);                   /** use the chai-http plugin **/
var expect = chai.expect;  /** chai expect assertation library **/

//var assert = require('assert');
describe('Array Dummy Test', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('/Get/api/hello', function() {
  it('should GET greeting "hello API"',  function(done){ 
      chai.request(server)             
      .get('/api/hello')        
      .end(function(err, res){ 
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"greeting":"hello API"}');
        done();   // Always call the 'done()' callback when finished.
      });
  });
  
  it('should GET get json',  function(done){ 
      chai.request(server)             
      .get('/api/hello')        
      .end(function(err, res){ 
        assert.equal(res.status, 200);
        assert.equal(res.body.greeting, 'hello API', 'res.body.greeting should be hello API');
        done();   // Always call the 'done()' callback when finished.
      });
  });
});

describe('/GET/api/shorturl/:count url', function() {
  it('should return error when GET /api/shorturl/3',  function(done){ 
      chai.request(server)             
      .get('/api/shorturl/3')        
      .end(function(err, res){ 
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'No short url found for given input');
        done();
      });
  });
  
  it('should redirect to https://www.w3schools.com at GET /api/shorturl/2',  function(done){ 
      chai.request(server)             
      .get('/api/shorturl/2')
      .end(function(err, res){ 
        expect(res).to.redirect;
        expect(res).to.redirectTo('https://www.w3schools.com/');
        done();
      });
  });  
})

describe('/POST/api/shorturl/new', function() {
  it('should return json data when PUT https://www.w3schools.com',  function(done){ 
      chai.request(server)             
      .post('/api/shorturl/new')
      .type('form')
      .send({
        '_method': 'put',
        'url': 'https://www.w3schools.com'
      })
      .end(function(err, res){ 
        /*// see response in logs; see setting up requests https://www.chaijs.com/plugins/chai-http/
        console.log("VVVVV is server response");
        console.log(res.body);
        console.log("^^^^^ is server response"); */
        assert.equal(res.type, 'application/json',"resonse should should be json");
        assert.equal(res.body["original url"], 'https://www.w3schools.com');
        assert.equal(res.body.short_url, '2');
        done();
      });
  });
  
  it('should return error when PUT www.w3schools.com since wrong format',  function(done){ 
      chai.request(server)             
      .post('/api/shorturl/new')
      .type('form')
      .send({
        '_method': 'put',
        'url': 'www.w3schools.com'
      })
      .end(function(err, res){ 
        assert.equal(res.type, 'application/json',"resonse should should be json");
        assert.equal(res.body.error, 'invalid URL');
        done();
      });
  });  
});
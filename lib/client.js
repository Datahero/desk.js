/*!
 * Module dependencies
 */
var request = require('request'),
    async = require('async');

/*!
 * Expose Desk().
 */
exports.Desk = Desk;

/**
 * Create a desk client.
 *
 * Options:
 *
 *   - `subdomain` the desk.com subdomain to use
 *   - `endpoint` the desk.com custom domain to use - set only if you use your own custom domain
 *   - `username` username for basic authentication
 *   - `password` password for basic authentication
 *   - `consumerKey` consumer key for the oauth application
 *   - `consumerSecret` secret for the oauth application
 *   - `token` the token for the oauth authentication
 *   - `tokenSecret` secret for the oauth authentication
 *   - `retry` retry request on 429 and 503
 *   - `logger` logging function to use for request logging
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
function Desk(options) {
  return new Client(options);
}

/**
 * Initialize a new `Client` with the given `options`.
 *
 * Options:
 *
 *   - `subdomain` the desk.com subdomain to use
 *   - `endpoint` the desk.com custom domain to use - if you use your own domain
 *   - `username` username for basic authentication
 *   - `password` password for basic authentication
 *   - `consumerKey` consumer key for the oauth application
 *   - `consumerSecret` secret for the oauth application
 *   - `token` the token for the oauth authentication
 *   - `tokenSecret` secret for the oauth authentication
 *   - `retry` retry request on 429 and 503
 *   - `logger` logging function to use for request logging
 *
 * @param {Object} options
 * @api private
 */
function Client(options) {
  options = options || {};

  this.isClient = true;
  this.subdomain = options.subdomain;
  this.endpoint = options.endpoint;
  if (!this.subdomain && !this.endpoint) throw new Error('No subdomain was specified.');

  // Determine if we construct a URL from the subdomain or use a custom one
  if(this.endpoint && typeof this.endpoint !== 'undefined') {
    this.baseUrl = this.endpoint;
  } else {
    this.baseUrl = 'https://' + this.subdomain + '.desk.com';
  }
  
  if (options.username && options.password) {
    this.auth = { username: options.username, password: options.password, sendImmediately: true };
  } else if (options.consumerKey && options.consumerSecret && options.token && options.tokenSecret) {
    this.auth = {
      consumer_key: options.consumerKey,
      consumer_secret: options.consumerSecret,
      token: options.token,
      token_secret: options.tokenSecret
    };
  } else {
    throw new Error('No authentication specified, use either Basic Authentication or OAuth.');
  }

/*
  this.retry = options.retry || false;
  this.maxRetry = options.maxRetry || 3;
  this.logger = options.logger || null;
  this.queue = async.queue(this.request.bind(this), 60);
  */
  
  //linkMixin.call(this, JSON.parse(fs.readFileSync(__dirname + '/resources.json', 'utf-8')));
}

/**
 * Sends a given request as a JSON object to the Desk.com API and finally
 * calls the given callback function with the resulting JSON object. This 
 * method should not be called directly but will be used internally by all API
 * methods defined.
 * 
 * @param resource Desk.com API resource to call
 * @param method Desk.com API method to call
 * @param availableParams Parameters available for the specified API method
 * @param givenParams Parameters to call the Desk.com API with
 * @param callback Callback function to call on success 
 */
Client.prototype.execute = function (resource, method, availableParams, givenParams, callback) {

  var finalParams = {};
  var currentParam;

  for (var i = 0; i < availableParams.length; i++) {
    currentParam = availableParams[i];
    if (typeof givenParams[currentParam] !== 'undefined')
      finalParams[currentParam] = givenParams[currentParam];
  }

  request({
    //uri : this.httpUri + '/' + this.version + '/' + resource + '/' + method + "?api_key=" + this.apiKey,
    url: options.url.indexOf('https') === 0 ? options.url : this.baseUrl + options.url,
    method: 'POST',
    /*
    headers : { 'Authorization' : 'bearer ' + this.accessToken,
                'Content-Type' : 'application/json' },
                */
    auth: this.auth.username ? this.auth : null,
    oauth: this.auth.token ? this.auth : null,
    json: true,
    body : JSON.stringify(finalParams)
  }, function (error, response, body) {
    var parsedResponse;
    if (error) {
      callback(new Error('Unable to connect to the Desk.com API endpoint.'));
    } else {

      try {
        parsedResponse = JSON.parse(body);
      } catch (try_error) {
        callback(new Error('Error parsing JSON answer from Desk.com API.'));
        return;
      }

      if (parsedResponse.errmsg) {
        callback(helpers.createSurveyMonkeyError(parsedResponse.errmsg, parsedResponse.status));
        return;
      }

      callback(null, parsedResponse);

    }
  });

};

/*****************************************************************************/
/************************* Survey Related Methods **************************/
/*****************************************************************************/

/**
 * Retrieves a paged list of respondents for a given survey and optionally collector
 * 
 * @see https://developer.surveymonkey.com/mashery/get_respondent_list
 */
Client.prototype.cases = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('cases', [
      //No params
    ], params, callback);
};

/*
request({
    url: options.url.indexOf('https') === 0 ? options.url : this.baseUrl + options.url,
    method: options.method,
    auth: this.auth.username ? this.auth : null,
    oauth: this.auth.token ? this.auth : null,
    json: true,
    body: options.payload || null
  }, async.apply(this.onResponse.bind(this), callback, options));
}
*/
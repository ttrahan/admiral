'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('masterIntegrations|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "masterIntegrations";';

  global.config.client.query(query,
    function (err, masterIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );
      if (_.isEmpty(masterIntegrations.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'No Master Integrations found')
        );
      bag.resBody = masterIntegrations.rows;
      return next();
    }
  );
}

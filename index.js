require('module-alias/register');
require('dotenv').config();

const http = require('http');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const log4js = require('log4js');
const compression = require('compression');

const logger = require('@logger');
const config = require('@config');

const EntityFactory = require('@entityFactory');
const formatRequest = require('@utils/request');
const formatResponse = require('@utils/response');
const { API_ERROR } = require('@constants');
const accommodationCrudController = require('./modules/accommodation/controller/crud.controller');

const expressApp = express();

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no files larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});
expressApp.use(multerMid.array('files'));

expressApp.use(cors({ origin: config.corsSettings.origin }));
expressApp.use(helmet());
expressApp.use(compression());
expressApp.use(
  log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' })
);

// UPLOAD IMAGE ROUTE
expressApp.post('/uploads/:AccommodationID', accommodationCrudController.uploadImage);

expressApp.use('/', formatRequest, require('./routes'), formatResponse);

expressApp.use((_req, res) => {
  if (!res.OutgoingResult) {
    return res.status(404).end();
  }
  res.status(200).send(res.OutgoingResult);
});

expressApp.use(async (error, _req, res, _next) => {
  logger.error(error);
  if (process.env.NODE_ENV === 'prod') {
    return res.status(500).send({
      key: API_ERROR.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
  res.status(500).send(error);
});

const server = http.createServer(expressApp);

const startServer = async () => {
  // Database initialization
  await EntityFactory.init();

  // Server initialization
  await server.listen(config.server.port || 3000);
  logger.info(`Server started on port ${config.server.port || 3000}`);
};

startServer();
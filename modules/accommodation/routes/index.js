const express = require('express');
const router = express.Router();

const AuthorizationSession = require('@AuthorizationSession');
const PermissionMiddleware = require('@PermissionMiddleware');

const crudController = require('../controller/crud.controller');

/**
 * CRUD API
 */
router.post('/', crudController.create);
router.get('/:AccommodationID', crudController.load);
router.put('/:AccommodationID', crudController.update);
router.delete('/', crudController.delete);
router.get('/', crudController.listAndCount);

module.exports = router;
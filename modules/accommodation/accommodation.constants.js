const { API_CRUD, API_ERROR } = require('@constants');

module.exports = Object.freeze({
    ...API_CRUD,
    ...API_ERROR,
    ACCOMMODATION_NOT_FOUND: 'accommodation_not_found'
});
const sequelize = require('sequelize');
const SequelizeOperators = sequelize.Op;
const services = require('@services');
const { validateObject } = require('@utils/validation');


const crudValidation = (
    requiredParams = [],
    params,
    additionalProperties = false
) => {
    const properties = {
        AccommodationID: { anyOf: [{ type: 'number' }, { type: 'string' }]},
        AccommodationIDs: { type: 'array' },
        Name: { type: 'string'},
        Benefits: { anyOf: [{ type: 'string' }, { type: 'object' }]},
        MinNumberOfGuests: { type: 'number' },
        MaxNumberOfGuests: { type: 'number' },
        Address: { anyOf: [{ type: 'string' }, { type: 'object' }]},
        Lat: { type: 'number' },
        Lng: { type: 'number' },
        OwnerID: { anyOf: [{ type: 'number' }, { type: 'string' }]},
        // Every request params
        Token: { type: 'string' },
        limit: { type: 'number' },
        offset: { type: 'number' },
        query: { type: 'object' },
        UserAgentInformation: { type: 'object' },
    };
    return validateObject(
        properties,
        requiredParams,
        params,
        additionalProperties
    );
}
module.exports.crudValidation = crudValidation;

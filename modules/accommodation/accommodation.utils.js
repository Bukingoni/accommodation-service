const sequelize = require('sequelize');
const SequelizeOperators = sequelize.Op;
const services = require('@services');
const { validateObject } = require('@utils/validation');
const config = require('@config');


const crudValidation = ( // ADD CHECK THAT THE NAME IS UNIQUE
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


const bucket = config.storage.bucket('bukingoni-bucket');
const uploadImage = (file, attachmentId) => new Promise((resolve, reject) => {
    const { buffer } = file;

    const blobName = `accommodations/${attachmentId}`;
    const blob = bucket.file(blobName);
    
    const blobStream = blob.createWriteStream({
        resumable: false
    })
    
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl)
    })
    .on('error', (err) => {
      console.log(err);
      reject(`Unable to upload image, something went wrong`)
    })
    .end(buffer)
});

module.exports.crudValidation = crudValidation;
module.exports.uploadImage = uploadImage;

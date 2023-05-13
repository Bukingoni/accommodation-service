const sequelize = require('sequelize');

const services = require('@services');
const sendResponse = require('@response');
const logger = require('@logger');
const commonUtils = require('@utils/common');
const accommodationUtils = require('../accommodation.utils');
const {
    INVALID_REQUEST,
    CREATE_SUCCESSFUL,
    UPDATE_SUCCESSFUL,
    DELETE_SUCCESSFUL,
    LIST_SUCCESSFUL,
    LOAD_SUCCESSFUL,
    ACCOMMODATION_NOT_FOUND,
} = require('../accommodation.constants');

module.exports.create = async (req, res, next) => {
    try {
        const params = req?.IncomingParams;

        const invalid = accommodationUtils.crudValidation(
            [
                'Name',
                'Benefits',
                'MinNumberOfGuests',
                'MaxNumberOfGuests',
                'Address'
            ],
            params
        );
        if (invalid) {
            res.OutgoingParams = {
                status: 400,
                key: INVALID_REQUEST,
                message: invalid,
            };
            return sendResponse(req, res);
        }
        logger.info('RECEIVED APPOINTMENT CREATION REQUEST');
        logger.info(params);

        await services.create(params, 'Accommodation');

        res.OutgoingParams = {
            status: 200,
            key: CREATE_SUCCESSFUL,
            message: "Create was successful.",
            result: params
        }

        return sendResponse(req, res);
    } catch(error) {
        next(error);
    }
}

module.exports.load = async (req, res, next) => {
    try {
        const params = { AccommodationID: req?.params?.AccommodationID ?? 0 };
        
        const accommodationsWhereParams = {
            AccommodationID: params.AccommodationID,
            Deleted: false,
        };

        const accommodation = await services.findOne(
            {
                where: accommodationsWhereParams,
                raw: false,
            },
            'Accommodation'
        );

        if (!accommodation) {
            res.OutgoingParams = {
                status: 404,
                key: ACCOMMODATION_NOT_FOUND,
                message: `Accommodation with ID : ${params.AccommodationID} not found.`
            };
            return sendResponse(req, res, next);
        }

        res.OutgoingParams = { 
            status: 200,
            key: LOAD_SUCCESSFUL,
            message: 'Load successful',
            result: accommodation,
        };
        return sendResponse(req, res, next);

    } catch(error) {
        next(error);
    }
}

module.exports.update = async (req, res, next) => {
    try {
        const params = {
            ...req?.IncomingParams,
            AccommodationID: req?.params?.AccommodationID ?? 0,
        };

        // if (
        //     req?.AuthorizationSession.UserSession?
        //     ... ONLY ALLOW OWNER OF THE ACCOMMODATION TO UPDATE IT
        // )
        const invalid = accommodationUtils.crudValidation(
            [
                'Name',
                'Benefits',
                'MinNumberOfGuests',
                'MaxNumberOfGuests'
            ],
            params
        );
        if (invalid) {
            res.OutgoingParams = {
                status: 400,
                key: INVALID_REQUEST,
                message: invalid,
            };
            return sendResponse(req, res);
        }

        const accommodationWhereParams = {
            AccommodationID: params.AccommodationID,
            Deleted: false,
        };

        const accommodation = await services.findOne(
            { where: accommodationWhereParams, raw: false },
            'Accommodation'
        );

        if (!accommodation) {
            res.OutgoingParams = {
                status: 404,
                key: ACCOMMODATION_NOT_FOUND,
                message: `Accommodation not found.`,
            };
            return sendResponse(req, res, next);
        }

        const updateParams = {
            ...params,
            LastModifiedAt: new Date(),
            // LastModifiedBy: req?.AuthorizationSession?.User?.UserID ?? nu;;
        };

        await services.update(
            updateParams,
            { where: accommodationWhereParams }, 
            'Accommodation',
            {
                customOptions: {
                    EntityName: 'Accommodation',
                    EntityID: params.AccommodationID,
                    Action: 'UPDATE',
                    // UserID: req?.AuthorizationSession?.UserSession?.UserID
                },
            }
        );

        const accommodationGetParams = {
            where: { AccommodationID: params.AccommodationID }
        };

        const retAccommodation = await services.findOne(
            accommodationGetParams,
            'Accommodation'
        );

        res.OutgoingParams = {
            status: 200,
            key: UPDATE_SUCCESSFUL,
            message: 'Update successful',
            result: retAccommodation
        }
        return sendResponse(req, res, next);
    } catch(error) {
        next(error);
    }
}

module.exports.delete = async (req, res, next) => {
    try {
        const params = req?.IncomingParams;

        // if (
        //     req?.AuthorizationSession?.UserSession?.UserID
        //     ... ONLY ALLOW OWNER OF THIS ACCOMMODATION TO DELETE IT
        // )

        const invalid = accommodationUtils.crudValidation(['AccommodationIDs'], params);

        if (invalid) {
            res.OutgoingParams = {
                status: 400,
                key: INVALID_REQUEST,
                message: invalid
            };
            return sendResponse(req, res, next);
        }

        for (const AccommodationID of params.AccommodationIDs) {

            const accommodationWhereParams = {
                AccommodationID: AccommodationID,
                Deleted: false,
            };
            
            const accommodation = await services.findOne(
                { where: accommodationWhereParams, raw: false },
                'Accommodation'
            );
    
            if (!accommodation) {
                res.OutgoingParams = {
                    status: 404,
                    key: ACCOMMODATION_NOT_FOUND,
                    message: `Appointment not found.`,
                };
                return sendResponse(req, res, next);
            }

            const updateParams = {
                AccommodationID: AccommodationID,
                Deleted: true,
                // LastModifiedBy: req?.AuthorizationSession?.User?.UserID ?? nu;;
            };
    
            await services.update(
                updateParams,
                { where: accommodationWhereParams }, 
                'Accommodation',
            );
        }
        res.OutgoingParams = {
            status: 200,
            key: DELETE_SUCCESSFUL,
            message: 'Delete successful',
            result: { }
        }

        return sendResponse(req, res, next);
    } catch(error) {
        next(error);
    }
}

module.exports.listAndCount = async (req, res, next) => {
    try {
        // search can be implemented as a part of this route
        const params = req?.IncomingParams;
        
        let accommodationWhereParams = {
            // Deleted: false,
        }
        // if (params.query) { 
        //     for (const field in params.query) {
        //         switch (field) {
        //             case 'AvailableInterval':
        //             case 'Name':
        //             case 'NumberOfGuests':
        //             case 'Location':
        //         }
        //     }
        // }
        const queryParams = {
            where: accommodationWhereParams,
            raw: false,
            distinct: true,
        }

        const count = await services.count(queryParams, 'Accommodation');

        if (!commonUtils.shouldListAll(params)) {
            queryParams.offset = parseInt(params?.page?.offset * params?.page?.limit);
            queryParams.limit = parseInt(params?.page?.limit);
        }

        const accommodations = count > 0 ? await services.findAll(queryParams, 'Accommodation') : [];

        res.OutgoingParams = {
            status: 200,
            key: LIST_SUCCESSFUL,
            message: 'List successful',
            result: {
                list: accommodations,
                count: count,
            }
        };
        return sendResponse(req, res, next);
    } catch(error) {
        next(error);
    }
}

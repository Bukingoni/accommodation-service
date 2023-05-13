module.exports = {
    serviceName: 'accommodation-service',
    logger: {
        logPath: process.env.LOGGER_LOG_PATH,
        printToConsole: process.env.LOGGER_PRINT_TO_CONSOLE === 'true',
        printToFile: process.env.LOGGER_PRINT_TO_FILE === 'true',
        consoleJson: process.env.LOGGER_CONSOLE_FORMAT_JSON === 'true'
    },
    server: {
        host: process.env.SERVER_HOST ?? 'localhost',
        port: process.env.SERVER_PORT ?? '3000',
        tokenSecret: process.env.SERVER_TOKEN_SECRET ?? 'secret',
    },
    corsSettings: {
        origin: process.env.SERVER_ORIGIN,
        exposedHeaders: process.env.SERVER_EXPOSE_HEADERS?.split(',')
    },
    database: {
        name: process.env.DATABASE_NAME ?? 'medical_test',
        host: process.env.DATABASE_HOST ?? 'localhost',
        username: process.env.DATABASE_USERNAME ?? 'root',
        password: process.env.DATABASE_PASSWORD ?? '1234',
        port: process.env.DATABASE_PORT ?? 3306,
        dialect: process.env.DATABASE_DIALECT ?? 'mariadb',
        forceSync: process.env.DATABASE_FORCE_SYNC === 'true'
    },
}
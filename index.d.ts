/**
 * A static class that handles logging to Application Insights.
 */
declare class Log {
    /**
     * Sets up logging to use Application Insights.  If not called, this library will log to the console instead.
     * @param {string} instrumentationKeyOrConnectionString The Application Insights instrumentation key or connection string.
     * @param {{[x: string]: any}} [properties] The base properties to include with every trace and exception.
     * @param {boolean} [autoCollectRequests] Whether to automatically collect requests. Defaults to true.
     * @returns {void}
     */
    static setupApplicationInsights(
        instrumentationKeyOrConnectionString: string,
        properties?: {[x: string]: any},
        autoCollectRequests?: boolean
    ): void

    /**
     * Logs a verbose message.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {{[x: string]: any}} [options.properties] The properties to include.
     * @returns {void}
     */
    static verbose(message: string, options?: {
        req?: Express.Request
        properties?: {[x: string]: any}
    }): void

    /**
     * Logs an informational message.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {{[x: string]: any}} [options.properties] The properties to include.
     * @returns {void}
     */
    static info(message: string, options?: {
        req?: Express.Request
        properties?: {[x: string]: any}
    }): void

    /**
     * Logs a warning.
     * @param {string} message The string to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {{[x: string]: any}} [options.properties] The properties to include.
     * @returns {void}
     */
    static warn(message: string, options?: {
        req?: Express.Request
        properties?: {[x: string]: any}
    }): void

    /**
     * Logs an error.
     * @param {string} message The message describing the error.
     * @param {object} options The options to pass into the properties.
     * @param {Error} options.err The error object to log as the exception.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {{[x: string]: any}} [options.properties] The properties to include.
     * @returns {void}
     */
    static error(message: string, options: {
        err: Error
        req?: Express.Request
        properties?: {[x: string]: any}
    }): void

    /**
     * Logs a critical error.
     * @param {string} message The message describing the error.
     * @param {object} options The options to pass into the properties.
     * @param {Error} options.err The error object to log as the exception.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {{[x: string]: any}} [options.properties] The properties to include.
     * @returns {void}
     */
    static critical(message: string, options: {
        err: Error
        req?: Express.Request
        properties?: {[x: string]: any}
    }): void
}

export = Log

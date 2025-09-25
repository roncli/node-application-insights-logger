/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {{[x: string]: any}} Dictionary.Any
 */

const appInsights = require("applicationinsights"),
    util = require("util");

// MARK: class Log
/**
 * A static class that handles logging to Application Insights.
 */
class Log {
    /** @type {Dictionary.Any} */
    static #baseProperties = {};

    /** @type {string} */
    static #instrumentationKeyOrConnectionString = void 0;

    // MARK: static #getData
    /**
     * Gets the tag overrides and properties from the options.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {{properties: object}} The properties object.
     */
    static #getData(options = {}) {
        const data = {
            properties: options.properties ? {...Log.#baseProperties, ...options.properties} : {...Log.#baseProperties}
        };

        if (options.req) {
            if (options.req.path) {
                data.properties.path = options.req.path;
            }

            if (options.req.ip) {
                data.properties.ip = options.req.ip;
            }
        }

        return data;
    }

    // MARK: static #log
    /**
     * Logs a message or exception to Application Insights or the console.
     * @param {"Verbose" | "Information" | "Warning" | "Error" | "Critical"} level The severity level.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @param {Error} [options.err] The error object to log as the exception (for "Error" and "Critical" levels).
     * @returns {void}
     */
    static #log(level, message, options) {
        if (Log.#instrumentationKeyOrConnectionString && typeof Log.#instrumentationKeyOrConnectionString === "string" && Log.#instrumentationKeyOrConnectionString !== "") {
            const data = Log.#getData(options);
            if (level === appInsights.KnownSeverityLevel.Error || level === appInsights.KnownSeverityLevel.Critical) {
                data.properties.message = message;
                appInsights.defaultClient.trackException({
                    time: new Date(),
                    severity: level,
                    properties: data.properties,
                    exception: options?.err
                });
            } else {
                appInsights.defaultClient.trackTrace({
                    message,
                    time: new Date(),
                    severity: appInsights.KnownSeverityLevel[level],
                    properties: data.properties
                });
            }
        } else {
            const errorDetails = options?.err ? ` ${util.inspect(options.err, false, Infinity)}` : "";
            console.log(`${level}: ${message}${errorDetails}`);
        }
    }

    // MARK: static setupApplicationInsights
    /**
     * Sets up logging to use Application Insights.  If not called, this library will log to the console instead.
     * @param {string} instrumentationKeyOrConnectionString The Application Insights instrumentation key or connection string.
     * @param {Dictionary.Any} [properties] The base properties to include with every trace and exception.
     * @returns {void}
     */
    static setupApplicationInsights(instrumentationKeyOrConnectionString, properties) {
        if (Log.#instrumentationKeyOrConnectionString) {
            throw new Error("You have already setup Application Insights.");
        }

        if (!instrumentationKeyOrConnectionString || typeof instrumentationKeyOrConnectionString !== "string") {
            throw new Error("The Application Insights instrumentation key or connection string is required.");
        }

        if (properties !== void 0 && (typeof properties !== "object" || properties === null || Array.isArray(properties))) {
            throw new Error("Expected an object.");
        }

        Log.#instrumentationKeyOrConnectionString = instrumentationKeyOrConnectionString;

        appInsights.setup(Log.#instrumentationKeyOrConnectionString).setAutoCollectRequests(false);
        appInsights.start();

        if (properties) {
            Log.#baseProperties = {...properties};
        }
    }

    // MARK: static verbose
    /**
     * Logs a verbose message.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static verbose(message, options) {
        Log.#log(appInsights.KnownSeverityLevel.Verbose, message, options);
    }

    // MARK: static info
    /**
     * Logs an informational message.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static info(message, options) {
        Log.#log(appInsights.KnownSeverityLevel.Information, message, options);
    }

    // MARK: static warn
    /**
     * Logs a warning.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static warn(message, options) {
        Log.#log(appInsights.KnownSeverityLevel.Warning, message, options);
    }

    // MARK: static error
    /**
     * Logs an error.
     * @param {string} message The message describing the error.
     * @param {object} options The options to pass into the properties.
     * @param {Error} options.err The error object to log as the exception.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static error(message, options) {
        Log.#log(appInsights.KnownSeverityLevel.Error, message, options);
    }

    // MARK: static critical
    /**
     * Logs a critical error.
     * @param {string} message The message describing the error.
     * @param {object} options The options to pass into the properties.
     * @param {Error} options.err The error object to log as the exception.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static critical(message, options) {
        Log.#log(appInsights.KnownSeverityLevel.Critical, message, options);
    }
}

module.exports = Log;

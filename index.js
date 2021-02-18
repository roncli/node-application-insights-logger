/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {{[x: string]: any}} Dictionary.Any
 */

const util = require("util"),

    appInsights = require("applicationinsights"),
    {SeverityLevel} = appInsights.Contracts;

/** @type {string} */
let instrumentationKey = void 0;

/** @type {Dictionary.Any} */
let baseProperties = {};

//  #
//  #
//  #       ###    ## #
//  #      #   #  #  #
//  #      #   #   ##
//  #      #   #  #
//  #####   ###    ###
//                #   #
//                 ###
/**
 * A static class that handles logging to Application Insights.
 */
class Log {
    //               #                 ##               ##     #                 #     #                ###                 #          #      #
    //               #                #  #               #                       #                       #                             #      #
    //  ###    ##   ###   #  #  ###   #  #  ###   ###    #    ##     ##    ###  ###   ##     ##   ###    #    ###    ###   ##     ###  ###   ###    ###
    // ##     # ##   #    #  #  #  #  ####  #  #  #  #   #     #    #     #  #   #     #    #  #  #  #   #    #  #  ##      #    #  #  #  #   #    ##
    //   ##   ##     #    #  #  #  #  #  #  #  #  #  #   #     #    #     # ##   #     #    #  #  #  #   #    #  #    ##    #     ##   #  #   #      ##
    // ###     ##     ##   ###  ###   #  #  ###   ###   ###   ###    ##    # #    ##  ###    ##   #  #  ###   #  #  ###    ###   #     #  #    ##  ###
    //                          #           #     #                                                                               ###
    /**
     * Setups up logging to use Application Insights.  If not called, this library will log to the console instead.
     * @param {string} key The Application Insights instrumentation key.
     * @param {Dictionary.Any} [properties] The base properties to include with every trace and exception.
     * @returns {void}
     */
    static setupApplicationInsights(key, properties) {
        if (instrumentationKey) {
            throw new Error("You have already setup Application Insights.");
        }

        if (!key || typeof key !== "string") {
            throw new Error("The Application Insights instrumentation key is required.");
        }

        if (properties !== void 0 && typeof properties !== "object") {
            throw new Error("Expected an object.");
        }

        instrumentationKey = key;

        appInsights.setup(instrumentationKey).setAutoCollectRequests(false);
        appInsights.start();

        if (properties) {
            baseProperties = {...properties};
        }
    }

    //              #    ###          #
    //              #    #  #         #
    //  ###   ##   ###   #  #   ###  ###    ###
    // #  #  # ##   #    #  #  #  #   #    #  #
    //  ##   ##     #    #  #  # ##   #    # ##
    // #      ##     ##  ###    # #    ##   # #
    //  ###
    /**
     * Gets the tag overrides and properties from the options.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {{tagOverrides: object, properties: object}} The tag overrides and properties objects.
     */
    static getData(options) {
        const data = {
            properties: options && (options.properties ? {...options.properties, ...baseProperties} : {...baseProperties}) || {},
            tagOverrides: {}
        };

        if (options && options.req) {
            if (options.req.path) {
                data.properties.path = options.req.path;
            }

            if (options.req.ip) {
                data.tagOverrides["ai.location.ip"] = options.req.ip;
                data.properties.ip = options.req.ip;
            }
        }

        return data;
    }

    //                   #
    //                   #
    // # #    ##   ###   ###    ##    ###    ##
    // # #   # ##  #  #  #  #  #  #  ##     # ##
    // # #   ##    #     #  #  #  #    ##   ##
    //  #     ##   #     ###    ##   ###     ##
    /**
     * Logs a verbose message.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static verbose(message, options) {
        if (instrumentationKey && typeof instrumentationKey === "string" && instrumentationKey !== "") {
            const data = Log.getData(options);
            appInsights.defaultClient.trackTrace({message, time: new Date(), severity: SeverityLevel.Verbose, tagOverrides: data.tagOverrides, properties: data.properties});
        } else {
            console.log(`Verbose: ${message}`);
        }
    }

    //  #            #
    //              # #
    // ##    ###    #     ##
    //  #    #  #  ###   #  #
    //  #    #  #   #    #  #
    // ###   #  #   #     ##
    /**
     * Logs an informational message.
     * @param {string} message The message to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static info(message, options) {
        if (instrumentationKey && typeof instrumentationKey === "string" && instrumentationKey !== "") {
            const data = Log.getData(options);
            appInsights.defaultClient.trackTrace({message, time: new Date(), severity: SeverityLevel.Information, tagOverrides: data.tagOverrides, properties: data.properties});
        } else {
            console.log(`Info: ${message}`);
        }
    }

    // #  #   ###  ###   ###
    // #  #  #  #  #  #  #  #
    // ####  # ##  #     #  #
    // ####   # #  #     #  #
    /**
     * Logs a warning.
     * @param {string} message The string to log.
     * @param {object} [options] The options to pass into the properties.
     * @param {Express.Request} [options.req] The Express request object.
     * @param {Dictionary.Any} [options.properties] The properties to include.
     * @returns {void}
     */
    static warn(message, options) {
        if (instrumentationKey && typeof instrumentationKey === "string" && instrumentationKey !== "") {
            const data = Log.getData(options);
            appInsights.defaultClient.trackTrace({message, time: new Date(), severity: SeverityLevel.Warning, tagOverrides: data.tagOverrides, properties: data.properties});
        } else {
            console.log(`Warn: ${message}`);
        }
    }

    //  ##   ###   ###    ##   ###
    // # ##  #  #  #  #  #  #  #  #
    // ##    #     #     #  #  #
    //  ##   #     #      ##   #
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
        if (instrumentationKey && typeof instrumentationKey === "string" && instrumentationKey !== "") {
            const data = Log.getData(options);
            appInsights.defaultClient.trackException({time: new Date(), severity: SeverityLevel.Error, tagOverrides: data.tagOverrides, properties: data.properties, exception: options.err});
        } else {
            console.log(`Error: ${message} ${util.inspect(options.err)}`);
        }
    }

    //              #     #     #                ##
    //                    #                       #
    //  ##   ###   ##    ###   ##     ##    ###   #
    // #     #  #   #     #     #    #     #  #   #
    // #     #      #     #     #    #     # ##   #
    //  ##   #     ###     ##  ###    ##    # #  ###
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
        if (instrumentationKey && typeof instrumentationKey === "string" && instrumentationKey !== "") {
            const data = Log.getData(options);
            appInsights.defaultClient.trackException({time: new Date(), severity: SeverityLevel.Critical, tagOverrides: data.tagOverrides, properties: data.properties, exception: options.err});
        } else {
            console.log(`Critical: ${message} ${util.inspect(options.err)}`);
        }
    }
}

module.exports = Log;

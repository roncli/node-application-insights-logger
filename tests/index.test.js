const util = require("util");

const setAutoCollectRequests = jest.fn();
const setupReturn = {setAutoCollectRequests, start: jest.fn()};
const setupMock = jest.fn(() => setupReturn);

jest.doMock("applicationinsights", () => ({
    setup: setupMock,
    start: jest.fn(),
    defaultClient: {},
    KnownSeverityLevel: {
        Verbose: "Verbose",
        Information: "Information",
        Warning: "Warning",
        Error: "Error",
        Critical: "Critical"
    }
}));

const err = new Error("test error");

/** @type {typeof import("../index.js")} */
let Log;

beforeEach(() => {
    jest.resetModules();
    Log = require("../index.js");
});

// MARK: Application Insights Logger
describe("Application Insights Logger", () => {
    test("should be defined", () => {
        expect(Log).toBeDefined();
    });

    test("should throw if already setup", () => {
        Log.setupApplicationInsights("InstrumentationKey=abc123");
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123")).toThrow("You have already setup Application Insights.");
    });

    test("should throw if connection string is missing", () => {
        expect(() => Log.setupApplicationInsights(void 0)).toThrow("The Application Insights instrumentation key or connection string is required.");
    });

    test("should throw if properties is not an object, is null, or is an array", () => {
        // @ts-expect-error Testing an invalid argument.
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123", "not an object")).toThrow("Base properties must be a non-null object.");
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123", null)).toThrow("Base properties must be a non-null object.");
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123", [])).toThrow("Base properties must be a non-null object.");
    });

    // MARK: Setup
    describe("Setup", () => {
        test("should set up Application Insights with a connection string", () => {
            const appInsights = require("applicationinsights");

            Log.setupApplicationInsights("InstrumentationKey=abc123");
            expect(appInsights.setup).toHaveBeenCalledWith("InstrumentationKey=abc123");
        });

        test("should set base properties if provided", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123", {foo: "bar"});
            Log.info("Test message", {properties: {baz: "qux"}});

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                properties: expect.objectContaining({foo: "bar", baz: "qux"})
            }));
        });

        test("should default autoCollectRequests to true", () => {
            const appInsights = require("applicationinsights");

            Log.setupApplicationInsights("InstrumentationKey=abc123");

            expect(appInsights.setup).toHaveReturnedWith(expect.objectContaining({
                setAutoCollectRequests: expect.any(Function)
            }));
            expect(setAutoCollectRequests).toHaveBeenCalledWith(true);
        });

        test("should allow disabling autoCollectRequests", () => {
            const appInsights = require("applicationinsights");

            Log.setupApplicationInsights("InstrumentationKey=abc123", void 0, false);

            expect(appInsights.setup).toHaveReturnedWith(expect.objectContaining({
                setAutoCollectRequests: expect.any(Function)
            }));
            expect(setAutoCollectRequests).toHaveBeenCalledWith(false);
        });
    });

    // MARK: Logging
    describe("Logging", () => {
        test("should log verbose messages with correct severity", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.verbose("Verbose message");

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                severity: appInsights.KnownSeverityLevel.Verbose,
                message: "Verbose message"
            }));
        });

        test("should log info messages with correct severity", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message");

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                severity: appInsights.KnownSeverityLevel.Information,
                message: "Info message"
            }));
        });

        test("should log warn messages with correct severity", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.warn("Warn message");

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                severity: appInsights.KnownSeverityLevel.Warning,
                message: "Warn message"
            }));
        });

        test("should log error messages with correct severity", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.error("Error message", {err: new Error("test error")});

            expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith(expect.objectContaining({
                severity: appInsights.KnownSeverityLevel.Error,
                properties: {message: "Error message"}
            }));
        });

        test("should log critical messages with correct severity", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.critical("Critical message", {err: new Error("test error")});

            expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith(expect.objectContaining({
                severity: appInsights.KnownSeverityLevel.Critical,
                properties: {message: "Critical message"}
            }));
        });
    });

    // MARK: Logging Properties
    describe("Logging Properties", () => {
        test("should include properties from options", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message", {properties: {foo: "bar"}});

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                properties: expect.objectContaining({foo: "bar"})
            }));
        });

        test("should properly override base properties with options properties", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123", {foo: "bar", baz: "qux"});
            Log.info("Info message", {properties: {foo: "override"}});

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                properties: expect.objectContaining({foo: "override", baz: "qux"})
            }));
        });

        test("should include request properties if req is provided", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message", {
                req: {
                    path: "/test",
                    ip: "127.0.0.1"
                }
            });

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({
                properties: expect.objectContaining({
                    path: "/test",
                    ip: "127.0.0.1"
                })
            }));
        });

        test("should still log if request is empty", () => {
            const appInsights = require("applicationinsights");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message", {req: {}});

            expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith(expect.objectContaining({properties: {}}));
        });
    });

    // MARK: Logging Without Setup
    describe("Logging Without Setup", () => {
        test("should log verbose messages to console", () => {
            console.log = jest.fn();
            Log.verbose("Verbose message");
            expect(console.log).toHaveBeenCalledWith("Verbose: Verbose message");
        });

        test("should log info messages to console", () => {
            console.log = jest.fn();
            Log.info("Info message");
            expect(console.log).toHaveBeenCalledWith("Information: Info message");
        });

        test("should log warn messages to console", () => {
            console.log = jest.fn();
            Log.warn("Warn message");
            expect(console.log).toHaveBeenCalledWith("Warning: Warn message");
        });

        test("should log error messages to console", () => {
            console.error = jest.fn();
            Log.error("Error message", {err});
            expect(console.error).toHaveBeenCalledWith("Error: Error message", util.inspect(err, false, Infinity));
        });

        test("should log critical messages to console", () => {
            console.error = jest.fn();
            Log.critical("Critical message", {err});
            expect(console.error).toHaveBeenCalledWith("Critical: Critical message", util.inspect(err, false, Infinity));
        });
    });
});

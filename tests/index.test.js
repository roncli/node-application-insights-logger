const util = require("util");

jest.mock("applicationinsights", () => {
    const setupMock = jest.fn();
    const setupReturn = {
        setAutoCollectRequests: jest.fn(function () {return this;}),
        start: jest.fn()
    };
    setupMock.mockReturnValue(setupReturn);
    return {
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
    };
});

// MARK: Application Insights Logger
describe("Application Insights Logger", () => {
    test("should be defined", () => {
        jest.resetModules();
        const Log = require("../index.js");
        expect(Log).toBeDefined();
    });

    test("should throw if already setup", () => {
        jest.resetModules();
        const Log = require("../index.js");

        Log.setupApplicationInsights("InstrumentationKey=abc123");
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123")).toThrow("You have already setup Application Insights.");
    });

    test("should throw if connection string is missing", () => {
        jest.resetModules();
        const Log = require("../index.js");

        expect(() => Log.setupApplicationInsights(void 0)).toThrow("The Application Insights instrumentation key or connection string is required.");
    });

    test("should throw if properties is not an object, is null, or is an array", () => {
        jest.resetModules();
        const Log = require("../index.js");

        // @ts-expect-error Testing an invalid argument.
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123", "not an object")).toThrow("Base properties must be a non-null object.");
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123", null)).toThrow("Base properties must be a non-null object.");
        expect(() => Log.setupApplicationInsights("InstrumentationKey=abc123", [])).toThrow("Base properties must be a non-null object.");
    });

    // MARK: Setup
    describe("Setup", () => {
        test("should set up Application Insights with a connection string", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Log.setupApplicationInsights("InstrumentationKey=abc123");
            expect(appInsights.setup).toHaveBeenCalledWith("InstrumentationKey=abc123");
        });

        test("should set base properties if provided", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123", {foo: "bar"});
            Log.info("Test message", {properties: {baz: "qux"}});

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];

            expect(callArgs.properties).toMatchObject({foo: "bar", baz: "qux"});
        });

        test("should default autoCollectRequests to true", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Log.setupApplicationInsights("InstrumentationKey=abc123");

            const setupReturn = appInsights.setup["mock"].results[0].value;

            expect(setupReturn.setAutoCollectRequests).toHaveBeenCalledWith(true);
        });

        test("should allow disabling autoCollectRequests", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Log.setupApplicationInsights("InstrumentationKey=abc123", undefined, false);

            const setupReturn = appInsights.setup["mock"].results[0].value;

            expect(setupReturn.setAutoCollectRequests).toHaveBeenCalledWith(false);
        });
    });

    // MARK: Logging
    describe("Logging", () => {
        test("should log verbose messages with correct severity", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.verbose("Verbose message");

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.severity).toBe(appInsights.KnownSeverityLevel.Verbose);
            expect(callArgs.message).toBe("Verbose message");
        });

        test("should log info messages with correct severity", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message");

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.severity).toBe(appInsights.KnownSeverityLevel.Information);
            expect(callArgs.message).toBe("Info message");
        });

        test("should log warn messages with correct severity", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.warn("Warn message");

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.severity).toBe(appInsights.KnownSeverityLevel.Warning);
            expect(callArgs.message).toBe("Warn message");
        });

        test("should log error messages with correct severity", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.error("Error message", {err: new Error("test error")});

            const callArgs = appInsights.defaultClient.trackException["mock"].calls[0][0];
            expect(callArgs.severity).toBe(appInsights.KnownSeverityLevel.Error);
            expect(callArgs.properties.message).toBe("Error message");
        });

        test("should log critical messages with correct severity", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.critical("Critical message", {err: new Error("test error")});

            const callArgs = appInsights.defaultClient.trackException["mock"].calls[0][0];
            expect(callArgs.severity).toBe(appInsights.KnownSeverityLevel.Critical);
            expect(callArgs.properties.message).toBe("Critical message");
        });
    });

    // MARK: Logging Properties
    describe("Logging Properties", () => {
        test("should include properties from options", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message", {properties: {foo: "bar"}});

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.properties).toMatchObject({foo: "bar"});
        });

        test("should properly override base properties with options properties", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123", {foo: "bar", baz: "qux"});
            Log.info("Info message", {properties: {foo: "override"}});

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.properties).toMatchObject({foo: "override", baz: "qux"});
        });

        test("should include request properties if req is provided", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message", {
                req: {
                    path: "/test",
                    ip: "127.0.0.1"
                }
            });

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.properties.path).toBe("/test");
            expect(callArgs.properties.ip).toBe("127.0.0.1");
        });

        test("should still log if request is empty", () => {
            jest.resetModules();
            const appInsights = require("applicationinsights"),
                Log = require("../index.js");

            Object.assign(appInsights.defaultClient, {trackTrace: jest.fn(), trackException: jest.fn()});
            Log.setupApplicationInsights("InstrumentationKey=abc123");
            Log.info("Info message", {req: {}});

            const callArgs = appInsights.defaultClient.trackTrace["mock"].calls[0][0];
            expect(callArgs.properties.path).toBeUndefined();
            expect(callArgs.properties.ip).toBeUndefined();
        });
    });

    // MARK: Logging Without Setup
    describe("Logging Without Setup", () => {
        test("should log verbose messages to console", () => {
            jest.resetModules();
            const Log = require("../index.js");

            console.log = jest.fn();
            Log.verbose("Verbose message");
            expect(console.log).toHaveBeenCalledWith("Verbose: Verbose message");
        });

        test("should log info messages to console", () => {
            jest.resetModules();
            const Log = require("../index.js");

            console.log = jest.fn();
            Log.info("Info message");
            expect(console.log).toHaveBeenCalledWith("Information: Info message");
        });

        test("should log warn messages to console", () => {
            jest.resetModules();
            const Log = require("../index.js");

            console.log = jest.fn();
            Log.warn("Warn message");
            expect(console.log).toHaveBeenCalledWith("Warning: Warn message");
        });

        test("should log error messages to console", () => {
            jest.resetModules();
            const Log = require("../index.js");

            console.error = jest.fn();
            var err = new Error("test error");
            Log.error("Error message", {err});
            expect(console.error).toHaveBeenCalledWith("Error: Error message", util.inspect(err, false, Infinity));
        });

        test("should log critical messages to console", () => {
            jest.resetModules();
            const Log = require("../index.js");

            console.error = jest.fn();
            var err = new Error("test error");
            Log.critical("Critical message", {err});
            expect(console.error).toHaveBeenCalledWith("Critical: Critical message", util.inspect(err, false, Infinity));
        });
    });
});

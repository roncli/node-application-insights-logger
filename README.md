# node-application-insights-logger
A simple reusable class that can log to Azure Application Insights.  This uses the [applicationinsights](https://github.com/microsoft/ApplicationInsights-node.js) package to log to Application Insights.  This can also be used to configured to log to the console as well.

## Installing
Since this is largely used for personal projects, this is not an npm package.  Nevertheless, you may still install this by adding the following to your package.json:

```json
{
    "dependencies": {
        "@roncli/node-application-insights-logger": "roncli/node-application-insights-logger#v1.0.4"
    }
}
```

## Usage
```javascript
const Log = require("@roncli/node-application-insights-logger");

// Setup is optional.  If you don't call setup, it will still log to the console.
Log.setupApplicationInsights("my-instrumentation-key");

Log.verbose("Let's try this!");

try {
    const complete = DoTask();

    if (!complete) {
        Log.warning("The task didn't complete successfully.");
    }
} catch (err) {
    Log.error("Whoops, there was an error...", {err});
}
```

## API
All functions are static functions, and do not return a value.

### Log.setupApplicationInsights(key, [properties])
Sets up the library to use Application Insights.  If you do not call this function, all logging will happen to the console.
| **Parameter** | **Data Type** | **Description** |
|---|---|---|
| **key** | *string* | Your Application Insights instrumentation key. |
| **properties** | *{[x: string]: any}* | *Optional.*  An object of properties to include by default with every request. |

### Log.verbose(message, options), Log&#46;info(message, options), Log.warn(message, options)
Logs a verbose, informational, or warning message.
| **Parameter** | **Data Type** | **Description** |
|---|---|---|
| **message** | *string* | The message to be logged. |
| **options** | *object* | *Optional.*  An object of options. |
| **options.req** | *Express.Request* | *Optional.*  If you are using [Express](https://expressjs.com/) and want to log the IP address and request path of the request, pass in the request object through this parameter. |
| **options.properties** | *{[x: string]: any}* | *Optional.*  An object of properties to include with this request.

### Log.error(message, options), Log.critical(message, options)
Logs an error or critical message.
Logs a verbose, informational, or warning message.
| **Parameter** | **Data Type** | **Description** |
|---|---|---|
| **message** | *string* | The message to be logged. |
| **options** | *object* | An object of options. |
| **options.err** | *Error* | The Error object to be logged. |
| **options.req** | *Express.Request* | *Optional.*  If you are using [Express](https://expressjs.com/) and want to log the IP address and request path of the request, pass in the request object through this parameter. |
| **options.properties** | *{[x: string]: any}* | *Optional.*  An object of properties to include with this request.

## Version history

### v1.0.5 - 10/1/2021
* Package updates.

### v1.0.4 - 8/26/2021
* Inspect objects past the default depth.
* Package updates.

### v1.0.3 - 2/21/2021
* Removed unnecessary Express.Request definition in typings.
* Package updates.

### v1.0.2 - 2/17/2021
* Fixed typings.

### v1.0.1 - 2/17/2021
* Include the message on errors and criticals.

### v1.0.0 - 2/17/2021
* Initial release.

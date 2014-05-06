Utils = {}

Utils.isHandlebarsSpecific = (value) ->
    (value and value.fn?) or (value and value.hash?)

Utils.isUndefined = (value) ->
    (value is undefined or value is null) or
    Utils.isHandlebarsSpecific value

Utils.safeString = (str) ->
    new Swag.Handlebars.SafeString str

Utils.trim = (str) ->
    trim = if /\S/.test("\xA0") then /^[\s\xA0]+|[\s\xA0]+$/g else /^\s+|\s+$/g
    str.toString().replace trim, ''

Utils.isFunc = (value) ->
    typeof value is 'function'

Utils.isString = (value) ->
    typeof value is 'string'

Utils.result = (value) ->
    if Utils.isFunc value then value() else value

Utils.err = (msg) ->
    throw new Error msg

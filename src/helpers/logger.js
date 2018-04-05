import Debug from 'console-debug'

export default new Debug({
  uncaughtExceptionCatch: true,                   // Do we want to catch uncaughtExceptions?
  consoleFilter:          ['LOG', 'WARN'],         // Filter these console output types
  logToFile:              false,                    // if true, will put console output in a log file folder called 'logs'
  logFilter:              ['LOG','DEBUG','INFO'],  // Examples: Filter these types to not log to file
  colors:                 true                     // do we want pretty pony colors in our console output?
})

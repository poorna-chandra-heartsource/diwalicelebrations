import { registerAs } from '@nestjs/config';
import { format, transports } from 'winston';

export default registerAs('loggerConfig', () => ({
  level: process.env.LOGGER_LEVEL,
  format: format.json(),
  transports: [
    // - Write all logs to console with all levels
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.simple(),
      ),
    }),
    // - Write all logs to a file with all levels
    // new transports.File({
    //         filename: appConfig.loggerFileName, // Specify the path and filename
    //         level: 'info', // Set the log level (info, error, warn, debug, verbose)
    //         format: format.combine(
    //             format.timestamp(),
    //             format.json()
    //         )
    //     })
  ],
}));

// export const middlewareLoggerConfig  = {
//     level: process.env.LOGGER_LEVEL,
//     format: format.combine(
//       format.timestamp(),
//       format.json(),
//     ),
//     transports: [
//       new transports.Console(),
//     ],
//   }

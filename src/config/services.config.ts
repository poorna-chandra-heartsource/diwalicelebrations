import { registerAs } from '@nestjs/config';

export default registerAs('serviceConfig', () => ({
  notificationServiceURL: process.env.NOTIFICATION_SERVICE_URL
}));

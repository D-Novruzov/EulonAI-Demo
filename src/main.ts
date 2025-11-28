import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure session middleware for multi-user support
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
      resave: false,
      saveUninitialized: true, // Changed to true so session is created even if nothing is stored in it
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS only)
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax', // Helps with cookie handling in Postman
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

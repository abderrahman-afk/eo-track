import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('EO-Datacenter GLPI Middleware API')
    .setDescription(`
      Comprehensive GLPI integration middleware providing:
      - Complete user management and relationships
      - Full ticket CRUD operations with validation
      - Group and profile management
      - Asset management (computers, monitors, software)
      - Hierarchical category system (main categories + sub-categories)
      - Advanced search functionality with criteria filtering
      - System utilities and synchronization
      
      This API serves as a secure, feature-rich wrapper around GLPI's REST API
      with enhanced user isolation, access validation, and simplified endpoints.
    `)
    .setVersion('1.0.0')
    .addTag('Users', 'User management and relationships')
    .addTag('Tickets', 'Ticket CRUD operations and metadata')
    .addTag('Groups', 'Group management and relationships')
    .addTag('Profiles', 'Profile management and permissions')
    .addTag('Entities', 'Entity management')
    .addTag('Assets', 'Asset management (computers, monitors, software)')
    .addTag('Categories', 'Hierarchical ticket categories and locations')
    .addTag('Search', 'Advanced search functionality with criteria')
    .addTag('System', 'System utilities and configuration')
    .addTag('Application', 'Application user management')
    .addServer('http://localhost:3001', 'Development server')
    .addServer('http://localhost:3000', 'Alternative development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'EO-Datacenter GLPI API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { background-color: #2c3e50; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #2c3e50; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    }
  });

  // Enable CORS if needed
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  
  console.log('🚀 Application started successfully!');
  console.log(`📖 API Documentation: http://localhost:${process.env.PORT ?? 3001}/api-docs`);
  console.log(`🌐 Application URL: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();

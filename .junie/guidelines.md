# Tickly Frontend Development Guidelines

This document provides essential information for developers working on the Tickly Frontend project.

## Build/Configuration Instructions

### Prerequisites
- Node.js (version compatible with Angular 19.2.x)
- npm (comes with Node.js)

### Setup and Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run the development server:
```bash
npm start
```
This will start the Angular development server at `http://localhost:4200/`.

### Building for Production
Build the application for production:
```bash
npm run build
```
The build artifacts will be stored in the `dist/tickly-frontend` directory.

### Environment Configuration
The application uses environment-specific configuration files:
- `src/environments/environment.ts` - Default environment
- `src/environments/environment.development.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment

When building for different environments, the appropriate environment file is used via file replacements configured in `angular.json`.

### Docker Deployment
The project includes Docker configuration for containerized deployment:
1. Build the Docker image:
   ```bash
   docker build -t tickly-frontend .
   ```
2. Run the container:
   ```bash
   docker run -p 80:80 tickly-frontend
   ```

## Testing Information

### Running Tests
Run the tests with:
```bash
npm test
```

To run specific tests:
```bash
npm test -- --include=path/to/test/file.spec.ts
```

### Test Structure
Tests are written using Jasmine and run with Karma. Each testable file should have a corresponding `.spec.ts` file in the same directory.

### Writing Tests
1. **Component Tests**: Test component creation, input/output bindings, and template rendering.
2. **Service Tests**: Test service methods, API calls (using HttpTestingController), and error handling.
3. **Directive/Pipe Tests**: Test the transformation logic.

### Example Test
Here's a simple example of a service test:

```typescript
import { TestBed } from '@angular/core/testing';
import { StringUtilsService } from './string-utils.service';

describe('StringUtilsService', () => {
  let service: StringUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StringUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(service.capitalizeFirstLetter('hello')).toBe('Hello');
    });
  });
});
```

### Testing API Services
For API services, use HttpTestingController to mock HTTP requests:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', () => {
    const mockData = { id: 1, name: 'Test' };
    
    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });
    
    const req = httpMock.expectOne('api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

## Additional Development Information

### Project Structure
- `src/app/core`: Core functionality (services, models, guards, interceptors)
- `src/app/shared`: Shared components, directives, and pipes
- `src/app/pages`: Page components organized by feature
- `src/styles`: Global styles and theme configuration

### State Management
The application uses a combination of:
- NgRx Signals for reactive state management
- RxJS for handling asynchronous operations

### API Communication
- API services are located in `src/app/core/services/api`
- Mock services are available for development and testing
- Error handling is centralized in each API service

### Code Style
- Use 2-space indentation (configured in .editorconfig)
- Use single quotes for strings in TypeScript
- Follow Angular style guide for naming conventions:
  - Components: kebab-case for selectors, PascalCase for class names
  - Services: PascalCase for class names
  - Files: kebab-case.type.ts (e.g., user-profile.component.ts)

### Documentation
- Use JSDoc comments for public methods and classes
- Document complex business logic with inline comments
- Keep the API documentation up-to-date

### Performance Considerations
- Use OnPush change detection where appropriate
- Implement proper subscription cleanup in components
- Optimize asset loading with lazy loading techniques

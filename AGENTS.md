# ERP-Lite Web - Frontend Engineering Rules

## General Objective

Always generate clean, scalable, secure and maintainable code.
The code must follow professional frontend engineering practices and be suitable for real-world production systems.

---

## Code Quality

- Write clean, readable and maintainable code.
- Follow SOLID principles adapted to frontend.
- Apply Single Responsibility Principle: each component, service or pipe has one clear purpose.
- Avoid large components with mixed concerns.
- Prefer composition over inheritance.
- Use dependency injection via Angular's DI system.
- Keep business logic out of components — delegate to services.
- Use meaningful names for variables, methods, components, services and files.
- Avoid hardcoded values — use environment files or constants.
- Use async/await or RxJS operators for async operations.

---

## Architecture

- Follow a feature-based modular structure:

```
src/app/
├── core/           → singleton services, interceptors, guards, auth
├── shared/         → reusable components, pipes, directives
├── features/       → one folder per module (auth, customers, products, invoices, payments)
│   ├── customers/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── models/
└── layout/         → shell, sidebar, navbar, footer
```

- Do not put business logic inside components.
- Keep HTTP calls inside services, never in components directly.
- Keep routing configuration clean and lazy-loaded per feature.
- Do not introduce unnecessary complexity.

---

## Security

- Never store JWT tokens in localStorage — use memory or httpOnly cookies.
- Never expose sensitive data in the UI or console logs.
- Never trust data coming from the API without defensive handling.
- Do not hardcode API URLs — use environment variables.
- Always handle 401 and 403 responses via interceptors.
- Never expose internal error details to the user.

---

## Authentication & Authorization

- Store access token securely after login.
- Attach JWT token to every protected request via an HTTP interceptor.
- Handle token refresh automatically via interceptor when access token expires.
- Use Angular Guards to protect routes that require authentication.
- Use permission-based guards to restrict access by role/permission.
- On 401 response: attempt token refresh, then redirect to login if refresh fails.
- On 403 response: show access denied message, do not redirect to login.
- Never send TenantId from the frontend — it comes from the JWT on the backend.

---

## API Consumption

- Use a centralized ApiService or feature-specific services for all HTTP calls.
- Never call HttpClient directly from a component.
- Use Angular HTTP interceptors for:
  - Attaching Authorization header
  - Handling token refresh
  - Global error handling
- Handle these HTTP responses properly in every service:
  - 200/201 → success
  - 400 → show validation errors to the user
  - 401 → trigger token refresh flow
  - 403 → show access denied
  - 404 → show not found message
  - 500 → show generic error message
- Use environment.ts for API base URL configuration.

---

## State Management

- Use Angular signals or RxJS BehaviorSubject for local and shared state.
- Keep state as close to where it is used as possible.
- Avoid global state unless strictly necessary.
- Do not mutate state directly — always return new references.

---

## Forms

- Use Reactive Forms for all forms.
- Validate all form inputs on the frontend before submitting.
- Never rely only on frontend validation — the backend always validates too.
- Show clear, user-friendly validation messages.
- Disable submit button while the form is invalid or a request is in progress.

---

## UI & Design

- Use Tailwind CSS for all styling.
- For UI/UX design and component layout, always consult the Google Stitch MCP server before manually creating interfaces.
- Prefer Stitch-generated designs over manually invented layouts.
- Build responsive interfaces that work on desktop and tablet.
- Keep UI consistent across all pages: spacing, colors, typography, buttons, tables, forms.
- Use reusable components for repeated UI patterns (tables, modals, forms, buttons).
- Show loading indicators during API calls.
- Show empty states when lists have no data.
- Show error messages when API calls fail.

---

## Routing

- Use lazy loading for all feature modules.
- Protect routes with AuthGuard for authenticated routes.
- Protect routes with PermissionGuard for role/permission-based access.
- Use route resolvers when data must be loaded before the page renders.
- Define all routes in a centralized and predictable structure.

---

## Error Handling

- Use a global HTTP interceptor to catch and handle errors centrally.
- Do not show raw error messages or stack traces to the user.
- Show user-friendly messages for all error scenarios.
- Log errors to the console only in development mode.

---

## Performance

- Use lazy loading for feature modules.
- Use OnPush change detection strategy where applicable.
- Avoid unnecessary API calls — cache responses when appropriate.
- Unsubscribe from observables to avoid memory leaks (use takeUntilDestroyed or AsyncPipe).

---

## Testing

- Write unit tests for services, guards and interceptors.
- Write component tests for critical UI interactions.
- Test:
  - Login flow
  - Token refresh flow
  - Route protection (AuthGuard, PermissionGuard)
  - Form validation
  - API error handling

---

## Documentation

- Keep README updated with setup instructions.
- Document environment variables required.
- Document the authentication flow.
- Keep component and service responsibilities clear through naming.

---

## Forbidden Practices

- Do not call HttpClient directly from components.
- Do not store tokens in localStorage.
- Do not hardcode API URLs.
- Do not put business logic in components.
- Do not skip form validation.
- Do not ignore HTTP error responses.
- Do not send TenantId from the frontend.
- Do not duplicate logic across features.
- Do not introduce libraries without a clear reason.
- Do not generate code that breaks the existing architecture.

---

## Goal

The frontend must be production-ready, secure, and demonstrate professional Angular architecture suitable for SaaS applications.

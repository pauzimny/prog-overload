# Logic Guidelines

- Extract hooks for reusable stateful logic (e.g., `useFetchData`, `useFormHandler`).
- Place pure functions in `/utils` or `/lib`.
- Keep API calls in `/services` or `/api`.
- Avoid putting complex logic directly inside JSX.
- Keep side effects (useEffect) minimal in components.

When generating logic, focus on creating reusable hooks and utility functions. Ensure that API interactions are abstracted away from components, and maintain a clear separation between presentation and logic. Aim for clean, testable code that adheres to these guidelines for better maintainability and scalability.
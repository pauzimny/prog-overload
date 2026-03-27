# Logic Guidelines

- Extract hooks for reusable stateful logic (e.g., `useFetchData`, `useFormHandler`).
- Place pure functions in `/utils` or `/lib`.
- Keep API calls in `/services` or `/api`.
- Avoid putting complex logic directly inside JSX.
- Keep side effects (useEffect) minimal in components.
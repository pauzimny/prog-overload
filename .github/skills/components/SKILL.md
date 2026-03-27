# Component Guidelines

- Keep components under 100 lines if possible.
- Each component should have a single responsibility.
- Prefer passing props rather than importing global state unless necessary.
- Use TypeScript types or interfaces for props.
- Separate presentational and container components if logic grows.
- Name components clearly (e.g., `UserCard`, `ProfileForm`, `NavigationMenu`).

When generating components, follow these guidelines closely. Encourage breaking down complex logic into hooks or helper functions. Aim for readability, maintainability, and clear separation of concerns.
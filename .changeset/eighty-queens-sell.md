---
"@raulfdm/homelab-cli": minor
---

Restructure CLI to use subcommands instead of flags

- **BREAKING CHANGE**: Changed from flag-based CLI (`homelab --trigger-deploy`) to subcommand-based CLI (`homelab deploy trigger`)
- Restructured codebase with modular approach:
  - Moved `src/modules/trigger-deploy.ts` to `src/modules/deploy/` directory
  - Split functionality into `index.ts` (deploy module) and `trigger.ts` (trigger deployment)
- Updated all help text to reflect new command structure and usage patterns
- Enhanced help documentation with better examples and clearer command hierarchies
- Updated README.md with new command syntax and project structure documentation
- Improved CLI user experience with more intuitive subcommand organization

Migration guide:

- Replace `homelab --trigger-deploy` with `homelab deploy trigger`
- All flags remain the same (`--app-id`, `--server-domain`, `--api-key`)
- Environment variables remain unchanged

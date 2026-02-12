# @raulfdm/homelab-cli

## 0.2.0

### Minor Changes

- 7d81cab: Restructure CLI to use subcommands instead of flags
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

## 0.1.1

### Patch Changes

- e93aa32: Fix CLI branding and documentation consistency
  - Updated README.md to use correct package name `@raulfdm/homelab-cli` instead of `@raulfdm/sh-cli`
  - Fixed binary name references from `sh-cli` to `homelab` throughout documentation
  - Corrected CLI flag name from `--server-url` to `--server-domain` in examples and help text
  - Updated main CLI help text title from "Self-Hosting CLI" to "Homelab CLI"
  - Synchronized all command examples in README to match actual CLI implementation
  - Fixed configuration table to show correct flag names that match the code

Demo 1

I chose NPM because it came preinstalled with nodejs


- [ ] What problem does a package manager actually solve that "download the library and put it in a folder yourself" doesn't? Be specific.
-Dependency installation
-Dependency management, downloading packages needed for packageges automatically
-Version management
-Reproducible installations
-Updating and removing packages
-scripts and tooling

- [ ] What's the difference between `dependencies` and `devDependencies` in `package.json`? Which
      category will Vite, your linter/formatter, and TypeScript belong to, and why?

Dependencies required for app at runtime
devDepenencies required for development and testing
- [ ] What is a lockfile for, and what could go wrong for your teammates (or CI) if it weren't
      committed to the repo?

It describes the dependency tree, without it other people would have a harder time reproducing my setup

- [ ] If you chose pnpm: what does it do differently from npm regarding how `node_modules` is laid out and how disk space/install time is shared across projects? If you chose npm: what would you gain or lose by switching to pnpm on a larger project?

The disk space filled by my projects would be smaller if they would share packages, because pnpm keeps a global storage for the packages
The trade of is that if i had multiple teammembers, it could get complicated switching the whole package manager.
# The Hands-Off Maintainer: Seamless npm Releases with OIDC & Release Please

Manual package publishing is often a brittle mix of forgotten changelogs and risky, long-lived access tokens. This session demonstrates how to automate your entire release lifecycle using Release Please to handle semantic versioning directly from your commit history. We will explore npm Trusted Publishing, a passwordless OIDC-based authentication method that eliminates the need to store sensitive secrets in GitHub. You’ll walk away with a blueprint for a secure, "push-to-merge" workflow that lets you focus on writing code instead of managing deployments.

## Getting Versioning Right with Release Please

1. Conventional Commits

    - No more "fixes some bugs in some files" commit messages.
    - chore: update github actions
    - feat: add feature to handle user authentication
    - fix: resolve bug in authentication flow
    - footer for "BREAKING CHANGE: " if the commit introduces a breaking change.

2. Squash and Merge

    - Squash all commits into a single commit with a message that follows the Conventional Commits format.

3. Release Please Action

    - GitHub action or CLI tool!
    - No whacky npm dependencies introduced to your project.
    - Creates a release pull request based on the conventional commit messages.
    - The release pull request includes the updated version number and changelog entries.
    - Once the release pull request is merged, Release Please automatically creates a new release on GitHub and publishes the package to npm.
    - Not node.js specific! Works with any language or package manager.
    - Workflow permissions: "Allow GitHub Actions to create and approve pull requests"

4. Retrofitting Existing Projects

    - Manifest: `.release-please-manifest.json`
    - This allows you to adopt Release Please without needing to rewrite your commit history.
    - Close the first PR manually
    - Commit fixes/features with the correct commit message format
    - Let Release Please handle the rest!

5. The publish workflow

    ```yaml
    name: Publish

    on:
      push:
        branches: [main]

    permissions:
      contents: write
      pull-requests: write

    jobs:
      release-please:
        runs-on: ubuntu-latest
        outputs:
          release_created: ${{ steps.release.outputs.release_created }}
        steps:
          - uses: googleapis/release-please-action@v4
            id: release
            with:
              token: ${{ secrets.GITHUB_TOKEN }}
              release-type: node
    ```

## Secure Publishing with npm Trusted Publishing

1. What is npm Trusted Publishing?

    - A new authentication method for npm that uses OpenID Connect (OIDC) tokens instead of long-lived access tokens.
    - Eliminates the need to store sensitive secrets in GitHub.
    - Provides a more secure and seamless authentication experience for CI/CD workflows.
    - No 2FA required for CI/CD workflows.
    - Provenance: npm can verify that the package was published by an authorized GitHub repository.
    - Works with: GitHub Actions, GitLab CI/CD, CircleCI
    - NPM Settings: Require two-factor authentication and disallow tokens (recommended)
    - **Yeah**: no stored secrets, no rotation, no expiry to manage, no maintainer risk in npm, no risk of token leaks in GitHub.

2. Setting Up npm Trusted Publishing

    - Go to <https://www.npmjs.com/package/passport-local-mongoose> → Settings → Trusted Publishers
    - Click Add a Trusted Publisher → select GitHub Actions
    - Fill in:
      - Repository owner: saintedlama
      - Repository name: passport-local-mongoose
      - Workflow filename: publish.yml
    - Save
    - This creates a new OIDC credential in GitHub that is scoped to the specified repository and workflow.

3. Publishing workflow

    ```yaml
      publish:
        needs: release-please
        runs-on: ubuntu-latest
        if: ${{ needs.release-please.outputs.release_created }}
        permissions:
          id-token: write
          contents: read
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: 24
              registry-url: https://registry.npmjs.org
          - run: npm ci
          - run: npm publish --provenance --access public
    ```

4. Benefits of npm Trusted Publishing

    - Improved security: No long-lived tokens that can be leaked or misused.
    - Simplified workflow: No need to manage secrets in GitHub.
    - Better provenance: npm can verify the source of the package.
    - Seamless integration with CI/CD workflows.
    - Merge PRs from your phone to publish a new version without worrying about secrets or tokens.

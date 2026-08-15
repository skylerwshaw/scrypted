# Fork releases

This fork publishes Scrypted server images built from its own Git source. The
upstream Docker workflow installs `@scrypted/server` from npm, which can lag
behind `main` and therefore does not guarantee that a source fix is present.

## Test locally

Use Node.js 22, then run the same server checks used by the release workflow:

```sh
npm --prefix server ci
npm --prefix server test
```

The regression test covers cleanup of a remotely returned async iterator, the
leak fixed by upstream issue 2121.

## Release

Release tags combine the upstream server package version with a monotonically
increasing fork revision. For example, source with `server/package.json`
version `0.144.2` is released as `v0.144.2-fork.1`, then `-fork.2`, and so on.

Only commits already on this fork's `main` branch can be released. Create and
push the tag after CI passes on `main`:

```sh
git switch main
git pull --ff-only
git tag v0.144.2-fork.1
git push origin v0.144.2-fork.1
```

The workflow reruns the server tests, packages that exact checkout, and
publishes multi-architecture images to:

```text
ghcr.io/skylerwshaw/scrypted:v0.144.2-fork.1
ghcr.io/skylerwshaw/scrypted:main
```

Homelab deployments should pin the immutable version tag (or its digest), not
the moving `main` tag. If the first package is private, make it public in the
GitHub package settings before deploying to hosts that do not log in to GHCR.

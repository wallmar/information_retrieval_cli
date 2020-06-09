# Setup

1. `npm install`
2. Create a new Solr core inside the VM, reachable at http://localhost:8983/solr/simplewiki
```shell script
cd solr-8.5.1/
./bin/solr create -c simplewiki
```

# Implementation

1. Add your implementation in `solr.js` by addressing the `TODO` entries.
2. Check that tests run successfully.
3. Run Prettier before committing your implementation.
4. Check that the build runs successfully on GitLab.

# Format code with Prettier

```bash
npm run lint-fix
```

# Start CLI

```bash
npm run cli
```

# Run tests

```bash
npm run test
```

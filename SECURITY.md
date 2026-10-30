# Credential handling and release status

The server previously contained an OpenAI key as a fallback value, including in earlier commits. The current source has no embedded key and reads server environment configuration. Old commits still contain the original key string.

Before changing this repository’s visibility, revoke/rotate that key and prepare a clean public history or a separate clean public release that preserves attribution. Updating the latest source alone does not clean history. No key rotation, history rewrite, visibility change or deployment is performed by this patch.

This is a synthetic-data, local teaching demo. Selectable personas, a raw chunk endpoint and an optional authorization-off comparison are intentionally restricted to a non-production loopback server with `DEMO_MODE=true`. They must not be exposed as a real-user document service. Such a service needs authenticated identities and authorized routes for every document/chunk endpoint.

Contact ashish@ashishjha.ai privately for security reports. Do not include credentials in public issues.

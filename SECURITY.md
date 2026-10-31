# Security and credential handling

OpenAI and hosted FGA credentials belong only in server environment variables. Use your own values from `env.example`; never commit them or send service credentials to the browser.

## History cleanup

On 31 October 2026, the previously embedded OpenAI key was removed from the published branch history. Author attribution, dates and project files were preserved. The historical key was checked against the provider and rejected as invalid. Git history cleanup does not delete copies held in old clones, deployments or GitHub caches.

If you cloned an earlier revision, use a fresh clone so an old branch cannot reintroduce the removed value.

## Demo boundaries

This is a synthetic-data, local teaching demo. Selectable personas, the raw chunk endpoint and the optional authorization-off comparison are restricted to a non-production loopback server with `DEMO_MODE=true`. A real-user document service needs authenticated identities and authorized routes for every document and chunk endpoint.

Report vulnerabilities privately to ashish@ashishjha.ai. Do not post credentials in public issues.

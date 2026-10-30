require('dotenv').config();
const { OpenFgaClient, CredentialsMethod } = require('@openfga/sdk');

function fgaConfig(env = process.env) {
  const config = { apiUrl: env.OPENFGA_API_URL || 'http://127.0.0.1:8081', storeId: env.OPENFGA_STORE_ID || undefined, authorizationModelId: env.OPENFGA_AUTHORIZATION_MODEL_ID || undefined };
  if (Boolean(env.OPENFGA_CLIENT_ID) !== Boolean(env.OPENFGA_CLIENT_SECRET)) throw new Error('Set both OpenFGA client ID and secret.');
  if (env.OPENFGA_CLIENT_ID) config.credentials = { method: CredentialsMethod.ClientCredentials, config: {
    clientId: env.OPENFGA_CLIENT_ID, clientSecret: env.OPENFGA_CLIENT_SECRET,
    apiTokenIssuer: env.OPENFGA_TOKEN_ISSUER || 'auth.fga.dev',
    apiAudience: env.OPENFGA_AUDIENCE || `${new URL(config.apiUrl).origin}/`,
  } };
  return config;
}
module.exports = { fgaConfig, createFgaClient: (env = process.env) => new OpenFgaClient(fgaConfig(env)) };

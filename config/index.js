'use strict'

const fs = require('fs')

const privateCertPath = process.env.SAML_PRIV_CERT_PATH || './cert/key.pem'
const decryptionPvkPath = process.env.SAML_PRIV_DEC_PATH || './cert/key.pem'
const certPath = process.env.SAML_CERT_PATH || './cert/cert.pem'
const defaultUrl = process.env.SAML_DEFAULT_URL || 'https://yourdomain.no' // The url of SP

module.exports = {
  SESSION_STORAGE_URL: process.env.SESSION_STORAGE_URL || 'https://tmp.storage.service.t-fk.no',
  jwtTokenOptions: {
    expiresIn: '1h',
    issuer: 'https://auth.t-fk.no'
  },
  defaultUrl: defaultUrl,
  SERVER_PORT: process.env.SERVER_PORT || 3000, // Local server port
  SAML_YAR_SECRET: process.env.SAML_YAR_SECRET || 'Louie Louie, oh no, I got to go. Louie Louie, oh no, I got to go',
  SAML_ENCRYPTOR_SECRET: process.env.SAML_ENCRYPTOR_SECRET || 'Louie Louie, oh no, I got to go Louie Louie, oh no, I got to go',
  SAML_JWT_SECRET: process.env.SAML_JWT_SECRET || 'Louie Louie, oh no, I got to go. Louie Louie, oh no, I got to go',
  PAPERTRAIL_HOSTNAME: process.env.PAPERTRAIL_HOSTNAME || 'hapi-auth-saml',
  PAPERTRAIL_HOST: process.env.PAPERTRAIL_HOST || 'logs.papertrailapp.com',
  PAPERTRAIL_PORT: process.env.PAPERTRAIL_PORT || 12345,
  route: {
    login: process.env.SAML_ROUTE_LOGIN || '/login', // local url path to login
    loginResponse: process.env.SAML_ROUTE_LOGIN_RESPONSE || '/loginResponse', // Where IdP sends you on login
    logout: process.env.SAML_ROUTE_LOGOUT || '/logout', // local url path to logout
    logoutResponse: process.env.SAML_ROUTE_LOGOUT_RESPONSE || '/logoutResponse', // Where IdP sends you after logout
    logoutRedir: process.env.SAML_ROUTE_LOGOUT_REDIR || 'https://www.telemark.no' // Where to be redirected after sucessfull logout
  },
  passport: {
    strategy: 'saml',
    privateCert: process.env.SAML_PRIV_CERT_FILE || fs.readFileSync(privateCertPath, 'utf-8'), // SP private key
    decryptionPvk: process.env.SAML_PRIV_DEV_FILE || fs.readFileSync(decryptionPvkPath, 'utf-8'), // SP private decryption key (probably the same as above)
    cert: process.env.SAML_CERT_FILE || fs.readFileSync(certPath, 'utf-8'), // IdP certificate
    protocol: process.env.SAML_PROTOCOL || 'https://',
    path: process.env.SAML_LOGIN_PATH || '/assertionconsumer',
    pathLogout: process.env.SAML_LOGOUT_PATH || '/logout',
    loginUrl: process.env.SAML_LOGIN_URL || `${defaultUrl}/loggedIn`, // Metadata XML: Location from AssertionConsumerService
    logoutUrl: process.env.SAML_LOGOUT_URL || 'https://idporten.difi.no/opensso/IDPSloRedirect/metaAlias/norge.no/idp3', // Metadata XML: location from SingleLogoutService-tag (http-redirect)
    logoutCallbackUrl: process.env.SAML_LOGOUT_CALLBACK || `${defaultUrl}/logoutResponse`, // Metadata XML: ResponseLocation from SingleLogoutService-tag
    entryPoint: process.env.SAML_ENTRY_POINT || 'https://idporten.difi.no/opensso/SSORedirect/metaAlias/norge.no/idp3', // Metadata XML: location from SingleSignOnService-tag (http-redirect)
    issuer: process.env.SAML_ISSUER || 'entityId', // Metadata XML: entityID from EntityDescriptor-tag
    identifierFormat: process.env.SAML_IDENT_FORMAT || 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient' // Metadata XML: Data inside NameIDFormat
  },
  SAME_SITE: process.env.SAME_SITE || 'Lax'
}

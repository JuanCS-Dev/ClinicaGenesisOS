/**
 * Authentication Services
 *
 * @module services/auth
 */

export {
  signInWithSAML,
  getClinicSSOConfig,
  getSSOConfigByDomain,
  isUserFromSSO,
  getSSOProviderName,
  type SSOConfig,
} from './saml-auth'

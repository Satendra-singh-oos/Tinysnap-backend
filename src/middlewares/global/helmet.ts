import helmet from "helmet";

const helmetOptions = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"], // Only allow resources to be loaded from your own domain ('self')
        "base-uri": ["'self'"], // Restricts URLs that can be used in a document's <base> element
        "font-src": [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ], // Controls where fonts can be loaded from
        "form-action": ["'self'"], // Controls which URLs can be targeted by form submissions
        "frame-ancestors": ["'self'"], // Controls which sites can embed your site in an iframe
        "object-src": ["'none'"], // Prevents loading any plugins (Flash, Java, etc)
        "script-src": ["'self'", "https://www.google-analytics.com"], // Controls which scripts can be executed
      },
    },
    crossOriginEmbedderPolicy: true, // Prevents documents from loading when they will be embedded in cross-origin contexts
    crossOriginOpenerPolicy: true, // Controls how the document interacts with cross-origin windows
    crossOriginResourcePolicy: true, // Controls how resources can be shared with cross-origin destinations
    dnsPrefetchControl: true, // Controls DNS prefetching (browser pre-resolving domain names)
    frameguard: {
      action: "sameorigin", // Prevents clickjacking by controlling how the site can be embedded in iframes
    },
    hidePoweredBy: true, // Removes the X-Powered-By header to hide tech stack info
    hsts: true, // Forces browsers to use HTTPS
    ieNoOpen: true, // Prevents IE from executing downloads in trusted site context
    noSniff: true, // Prevents browsers from trying to guess ("sniff") the MIME type
    originAgentCluster: true, // Provides a hint that the current document is part of an origin-keyed agent cluster
    permittedCrossDomainPolicies: true, // Controls how much information the browser includes with cross-origin requests
    referrerPolicy: true, // Controls how much referrer information should be included with requests
    xssFilter: true, // Enables XSS filter in browsers
  });
};

export default helmetOptions;

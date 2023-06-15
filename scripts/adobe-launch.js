import TagManager from './tag-manager.js';

class AdobeLaunch extends TagManager {
  setEndpoint() {
    if (
      !window.placeholders.default.launchProductionUrl
      || !window.placeholders.default.launchNonProductionUrl
    ) {
      throw Error('missing placeholders for analytics endpoint');
    }
    if (
      window.location.pathname.startsWith('/drafts/')
      || window.location.hostname.endsWith('.page')
      || window.location.hostname === 'localhost'
    ) {
      this.endpoint = window.placeholders.default.launchNonProductionUrl;
    }

    this.endpoint = window.placeholders.default.launchProductionUrl;
  }

  initialize() {
    if (!this.endpoint) return;
    const launchScript = document.createElement('script');
    launchScript.async = true;
    launchScript.src = this.endpoint;
    document.body.appendChild(launchScript);
  }
}

export default AdobeLaunch;

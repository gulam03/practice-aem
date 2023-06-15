// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import AdobeLaunch from './adobe-launch.js';
import Analytics from './analytics.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

const manager = new AdobeLaunch();
manager.setEndpoint();

const analytics = new Analytics(manager);
await analytics.initialize({
  platform: 'franklin',
  contentType: 'Website',
});

manager.initialize();

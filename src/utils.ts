export const DOMAINS: string[] = [
  'localhost',
  'inindca.com',
  'inintca.com',
  'aps1.pure.cloud',
  'apne3.pure.cloud',
  'apne2.pure.cloud',
  'mypurecloud.com.au',
  'mypurecloud.jp',
  'cac1.pure.cloud',
  'mypurecloud.de',
  'mypurecloud.ie',
  'euw2.pure.cloud',
  'euc2.pure.cloudmec1.pure.cloud',
  'sae1.pure.cloud',
  'mypurecloud.com',
  'use2.us-gov-pure.cloud',
  'usw2.pure.cloud'
];

export const getDomainFromHost = (appHost: string): string => {
  let knownDomain = DOMAINS.find(d => (
    appHost.endsWith(d) ||
    (d === 'localhost' && origin.includes('localhost'))
  ));

  if (knownDomain === 'localhost') {
    knownDomain = 'mypurecloud.com';
  }

  if (!knownDomain) {
    const guessedDomain = appHost.replace(/^apps./, '');

    // eslint-disable-next-line no-console
    console.warn(
      'Failed to find provided domain for host, app may fail to load. Guessing at the domain',
      { host: appHost, guessedDomain }
    );

    return guessedDomain;
  }

  return knownDomain;
};
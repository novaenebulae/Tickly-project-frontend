const PROXY_CONFIG = [
  {
    context: ['/api/**'],
    target: 'http://localhost:80',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  {
    context: ['/static/**'],
    target: 'http://localhost:80',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;

const defaultPublishEndpoint = (() => {
  if (typeof window === 'undefined') return '/aether-vercel-api/publish-project';
  return `${window.location.origin}/aether-vercel-api/publish-project`;
})();

export const APP_CONFIG = {
  aiEndpoint: 'https://chatbot-beta-weld.vercel.app/api/chatbot',
  publishEndpoint: window.AETHER_CONFIG?.publishEndpoint || defaultPublishEndpoint,
  maxHistoryMessages: 12,
};

export async function init() {
  const castSenderUrl = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  if (!document.querySelector(`script[src="${castSenderUrl}"]`)) {
    await new Promise((resolve, reject) => {
      window.__onGCastApiAvailable = resolve;
      const script = document.createElement('script');
      script.src = castSenderUrl;
      script.addEventListener('error', reject);
      document.querySelector('head').appendChild(script);
    });
  }

  const context = cast.framework.CastContext.getInstance();
  context.setOptions({
    receiverApplicationId: 'C0507A6F',
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });

  // context.addEventListener(
  //   cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
  //   this.updateCastContext
  // )
}

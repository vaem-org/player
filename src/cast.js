let initialised = false;

export async function init({ receiverApplicationId = null }={}) {
  if (initialised) {
    return;
  }

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

  if (window.cast) {
    const context = cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: receiverApplicationId ?? chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
  }

  initialised = true;
}

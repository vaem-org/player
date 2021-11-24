/*
 * VAEM - Asset manager
 * Copyright (C) 2021  Wouter van de Molengraft
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

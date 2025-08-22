import type { RequestEvent } from '@builder.io/qwik-city';
import { saveAnonymousSession } from '~/services/auth/session';

export const onRequest = async (event: RequestEvent) => {
  const { sharedMap, cookie } = event;

  const session = cookie.get('session');
  const anonymous = cookie.get('anonymous');

  if (session) {
    try {
      sharedMap.set('session', session.json());
    } catch (error) {
      console.warn('Failed to parse session cookie as JSON, regenerating session:', error);
      cookie.delete('session');
      await saveAnonymousSession(event);
    }
    return;
  }

  if (anonymous) {
    try {
      sharedMap.set('anonymous', anonymous.json());
    } catch (error) {
      console.warn('Failed to parse anonymous cookie as JSON, regenerating session:', error);
      cookie.delete('anonymous');
      await saveAnonymousSession(event);
    }
    return;
  }

  await saveAnonymousSession(event);
};

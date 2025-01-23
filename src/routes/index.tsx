import { component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEvent } from '@builder.io/qwik-city';
import { AddColumn, Commands } from '~/features';

import { Table } from '~/components';
import { useHome } from '~/routes/useHome';

import * as hub from '@huggingface/hub';

export { useColumnsLoader } from '~/state';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

export const onGet = async ({
  cookie,
  redirect,
  next,
  sharedMap,
  url,
}: RequestEvent) => {
  const session = cookie.get('session');
  if (session) {
    sharedMap.set('session', session);

    return next();
  }

  const sessionCode = crypto.randomUUID();

  const isAuthorized = false;

  const authData = {
    state: sessionCode,
    clientId: CLIENT_ID,
    redirectUrl: `${url.origin}/auth/callback/`,
    localStorage: {
      codeVerifier: undefined,
      nonce: undefined,
    },
  };

  if (!isAuthorized) {
    const url = await hub.oauthLoginUrl(authData);

    cookie.set(
      sessionCode,
      {
        codeVerifier: authData.localStorage.codeVerifier!,
        nonce: authData.localStorage.nonce!,
      },
      {
        secure: true,
        httpOnly: true,
        path: '/auth/callback',
      },
    );

    throw redirect(303, url);
  }
};

export default component$(() => {
  const { columns, onCreateColumn } = useHome();

  return (
    <div class="mx-auto px-4 pt-2">
      <Commands />

      <Table columns={columns} />

      <AddColumn onCreateColumn={onCreateColumn} />
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Argilla - V3',
  meta: [
    {
      name: 'description',
      content: 'Argilla - V3',
    },
  ],
};

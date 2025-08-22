import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="p-8 text-center">
      <h1 class="text-2xl font-bold mb-4">Databricks Import</h1>
      <p class="text-neutral-600">
        This route has been moved. Please use{' '}
        <a href="/home/dataset/create/from-databricks" class="text-primary-600 underline">
          /home/dataset/create/from-databricks
        </a>{' '}
        instead.
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Import from Databricks - AI Sheets',
  meta: [
    {
      name: 'description',
      content: 'Import data from your Databricks workspace into AI Sheets for AI-powered data processing.',
    },
  ],
};
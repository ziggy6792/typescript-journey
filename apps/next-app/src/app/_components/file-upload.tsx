/* eslint-disable arrow-body-style */

'use client';

import { type FC } from 'react';
import { api } from '~/trpc/react';

export const FileUpload: FC = () => {
  const { mutateAsync: getUrl } = api.post.getUploadUrl.useMutation();

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const url = await getUrl();

          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          const file = (e.target as HTMLFormElement).file.files?.[0]!;

          const image = await fetch(url!, {
            body: file,
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
              'Content-Disposition': `attachment; filename="${file.name}"`,
            },
          });

          window.location.href = image.url.split('?')[0] as string;
        }}
      >
        <input name='file' type='file' accept='image/png, image/jpeg' />
        <button type='submit' style={{ color: 'white' }}>
          Upload
        </button>
      </form>
    </>
  );
};

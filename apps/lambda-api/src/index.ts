/* eslint-disable max-len */

import { Midjourney } from 'midjourney';

const client = new Midjourney({
  ServerId: '1099775183880986716',
  ChannelId: '1099775183880986719',
  SalaiToken: '',
  Debug: true,
  // Ws: true, // enable ws is required for remix mode (and custom zoom)
});
// await client.init();

const characterDescription = `A friendly green frog with big eyes and a cheerful smile, named Ziggy.`;

const generateImage = async () => {
  await client.init();

  const prompt = `A storyboard for a children's book. 12 versions (e.g: scared, happy etc...) of the same character, "${characterDescription}". The character versions must be evenly spaced on a plane white background`;
  // imagine
  const Imagine = await client.Imagine(
    prompt,
    (uri: string, progress: string) => {
      console.log('loading', uri, 'progress', progress);
    },
  );
  console.log(Imagine);
  if (!Imagine) {
    console.log('no message');
    return;
  }
  // U1 U2 U3 U4 V1 V2 V3 V4  "Vary (Strong)" ...
  // ⬅️,⬆️,⬇️,➡️
  const U1CustomID = Imagine.options?.find((o) => o.label === 'U1')?.custom;
  if (!U1CustomID) {
    console.log('no U1');
    return;
  }

  // Upscale U1
  const Upscale = await client.Upscale({
    hash: '',
    index: 1,
    msgId: <string>Imagine.id,
    flags: Imagine.flags,
    loading: (uri: string, progress: string) => {
      console.log('loading', uri, 'progress', progress);
    },
  });
  if (!Upscale) {
    console.log('no Upscale');
    return;
  }
  console.log('Upscale!', Upscale);
  client.Close();
};

export const handler = async (event, context) => {
  console.log('hello workd');
  await generateImage();
  return {
    ok: true,
  };
};

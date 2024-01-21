import { z } from 'zod';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Bucket } from 'sst/node/bucket';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';

let post = {
  id: 1,
  name: 'Hello World',
};

export const postRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
    greeting: `Hello ${input.text}`,
  })),

  create: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ input }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    post = { id: post.id + 1, name: input.name };
    return post;
  }),

  getLatest: protectedProcedure.query(() => post),

  getSecretMessage: protectedProcedure.query(() => 'you can now see this secret message!'),

  getUploadUrl: protectedProcedure.mutation(async () => {
    const command = new PutObjectCommand({
      ACL: 'public-read',
      Key: crypto.randomUUID(),
      Bucket: Bucket['file-uploads'].bucketName,
    });
    const url = (await getSignedUrl(new S3Client({}), command)) as string;
    return url;
  }),
});

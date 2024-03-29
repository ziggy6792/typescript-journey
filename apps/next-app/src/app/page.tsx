import Link from 'next/link';

import { CreatePost } from '~/app/_components/create-post';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';
import styles from './index.module.css';
import { FileUpload } from './_components/file-upload';

export default async function Home() {
  const hello = await api.post.hello.query({ text: 'from tRPC' });
  const session = await getServerAuthSession();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Create <span className={styles.pinkSpan}>T3</span> App
        </h1>
        <div className={styles.cardRow}>
          <Link className={styles.card} href='https://create.t3.gg/en/usage/first-steps' target='_blank'>
            <h3 className={styles.cardTitle}>First Steps →</h3>
            <div className={styles.cardText}>Just the basics - Everything you need to know to set up your database and authentication.</div>
          </Link>
          <Link className={styles.card} href='https://create.t3.gg/en/introduction' target='_blank'>
            <h3 className={styles.cardTitle}>Documentation →</h3>
            <div className={styles.cardText}>Learn more about Create T3 App, the libraries it uses, and how to deploy it.</div>
          </Link>
        </div>
        <div className={styles.showcaseContainer}>
          <p className={styles.showcaseText}>{hello ? hello.greeting : 'Loading tRPC query...'}</p>

          <div className={styles.authContainer}>
            <p className={styles.showcaseText}>{session && <span>Logged in as {session.user?.email}</span>}</p>
            <Link href={session ? '/api/auth/signout' : '/api/auth/signin'} className={styles.loginButton}>
              {session ? 'Sign out' : 'Sign in'}
            </Link>
          </div>
        </div>
        <UploadDemo />
        <CrudShowcase />
      </div>
    </main>
  );
}

async function UploadDemo() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  return (
    <div style={{ backgroundColor: 'gray', padding: '100px' }}>
      <FileUpload />
    </div>
  );
}

async function CrudShowcase() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const latestPost = await api.post.getLatest.query();

  return (
    <div className={styles.showcaseContainer}>
      {latestPost ? (
        <p className={styles.showcaseText}>Your most recent post: {latestPost.name}</p>
      ) : (
        <p className={styles.showcaseText}>You have no posts yet.</p>
      )}

      <CreatePost />
    </div>
  );
}

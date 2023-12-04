import Modal from '@/app/components/Modal';

type Props = {
  params: {
    album: string;
    song: string;
  };
};
export default async function SongPage({ params }: Props) {
  return (
    <Modal>
      <h1>Modal</h1>
      Album: {decodeURIComponent(params.album)}
      <div className='absolute top-1/2 mt-10'>{/* <video width={1000} height={1000} autoPlay src={`https://youtube.com/watch?v=${params.song}`} /> */}</div>
    </Modal>
  );
}

type Props = {
  params: {
    album: string;
    song: string;
  };
};
export default async function Song({ params }: Props) {
  return (
    <div>
      <h1>Not Modal</h1>
      {decodeURIComponent(params.album)}
      <iframe width='560' height='315' allowFullScreen></iframe>
    </div>
  );
}

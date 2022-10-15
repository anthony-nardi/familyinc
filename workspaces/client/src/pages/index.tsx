import type { NextPage } from 'next';
import GameManager from '@components/game/GameManager';


const Page: NextPage = () => {
  return (
    <div className="container max-w-2xl mt-8">
      <GameManager/>
    </div>
  );
};

export default Page;

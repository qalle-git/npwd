import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { usePhone } from '@os/phone/hooks/usePhone';
import { ChevronLeft, Circle, LayoutGrid } from 'lucide-react';

export const Navigation: React.FC = () => {
  const history = useHistory();
  const { isExact } = useRouteMatch('/');
  const { closePhone } = usePhone();

  const handleGoBackInHistory = () => {
    history.goBack();
  };

  const handleGoToMenu = () => {
    if (isExact) return;
    history.push('/');
  };

  return (
    <div className="h-14 w-full bg-neutral-100 px-12 dark:bg-neutral-900">
      <div className="flex h-full items-center justify-between">
        <button className="bg-transparent" onClick={handleGoToMenu}>
          <LayoutGrid className="h-6 w-6 text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-100" />
        </button>
        <button className="bg-transparent" onClick={closePhone}>
          <Circle className="h-6 w-6 text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-100" />
        </button>
        <button className="bg-transparent" onClick={handleGoBackInHistory}>
          <ChevronLeft className="h-6 w-6 text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-100" />
        </button>
      </div>
    </div>
  );
};

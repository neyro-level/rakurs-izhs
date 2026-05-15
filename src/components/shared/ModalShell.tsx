import { useState, useEffect } from 'react';
import RequestModal from './RequestModal';

export default function ModalShell() {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-open-modal]');
      if (target) {
        e.preventDefault();
        const scenario = target.getAttribute('data-scenario') || undefined;
        setPrefill(scenario);
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <RequestModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      prefillScenario={prefill}
    />
  );
}

import { useState, useEffect } from 'react';
import { track } from '@/lib/analytics';
import RequestModal from './RequestModal';

type PendingModalDetail = {
  scenario?: string;
};

declare global {
  interface Window {
    __rakursPendingModalOpen?: PendingModalDetail;
  }
}

export default function ModalShell() {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<string | undefined>(undefined);

  useEffect(() => {
    const openModal = (detail?: PendingModalDetail) => {
      setPrefill(detail?.scenario);
      setIsOpen(true);
      track('modal_open', {
        form: 'request_modal',
        scenario: detail?.scenario || 'dont_know',
      });
    };

    const handleModalOpen = (event: Event) => {
      const customEvent = event as CustomEvent<PendingModalDetail>;
      openModal(customEvent.detail);
    };

    window.addEventListener('rakurs:open-modal', handleModalOpen);

    if (window.__rakursPendingModalOpen) {
      openModal(window.__rakursPendingModalOpen);
      window.__rakursPendingModalOpen = undefined;
    }

    return () => window.removeEventListener('rakurs:open-modal', handleModalOpen);
  }, []);

  return (
    <RequestModal
      isOpen={isOpen}
      onClose={() => {
        track('modal_close', {
          form: 'request_modal',
          scenario: prefill || 'dont_know',
        });
        setIsOpen(false);
      }}
      prefillScenario={prefill}
    />
  );
}

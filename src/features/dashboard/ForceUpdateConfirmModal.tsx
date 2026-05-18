import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ForceUpdateConfirmModalProps {
  readonly isOpen: boolean;
  readonly isForcing: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function ForceUpdateConfirmModal({
  isOpen,
  isForcing,
  onCancel,
  onConfirm,
}: ForceUpdateConfirmModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isForcing) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isForcing, isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onClick={isForcing ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="modal-panel"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h2 id={titleId} className="modal-title">
          {t('dashboard.forceUpdateConfirm.title')}
        </h2>
        <p id={descriptionId} className="modal-description">
          {t('dashboard.forceUpdateConfirm.description')}
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="ghost-button"
            disabled={isForcing}
            onClick={onCancel}
          >
            {t('dashboard.forceUpdateConfirm.cancel')}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="primary-button modal-confirm-button"
            disabled={isForcing}
            onClick={onConfirm}
          >
            {isForcing
              ? t('dashboard.actions.forcing')
              : t('dashboard.forceUpdateConfirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ForceUpdateConfirmModal } from '@/features/dashboard/ForceUpdateConfirmModal';
import '@/shared/i18n/i18n';

describe('ForceUpdateConfirmModal', () => {
  it('calls onConfirm when the user confirms', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ForceUpdateConfirmModal
        isOpen
        isForcing={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Generate new digest' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when the user dismisses the modal', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ForceUpdateConfirmModal
        isOpen
        isForcing={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Keep current digest' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

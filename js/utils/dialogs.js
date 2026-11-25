export function confirmAction(options) {
  const modal = document.createElement('app-modal');
  document.body.append(modal);
  return modal.ask(options).finally(() => modal.remove());
}
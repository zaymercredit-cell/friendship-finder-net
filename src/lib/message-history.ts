export interface HistoryMessage { id: string; created_at: string }
export interface MessagePages<T> { pages: T[][]; pageParams: unknown[] }

export function chronological<T extends HistoryMessage>(messages: T[]): T[] {
  return [...new Map(messages.map(message => [message.id, message])).values()]
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

export function reconcileMessage<T extends HistoryMessage>(old: MessagePages<T> | undefined, message: T, optimisticId?: string): MessagePages<T> {
  if (!old) return { pages: [[message]], pageParams: [null] };
  const pages = old.pages.map(page => page.filter(m => m.id !== message.id && m.id !== optimisticId));
  pages[0] = chronological([...(pages[0] || []), message]);
  return { ...old, pages };
}

export function prependedCount(previousFirstId: string | undefined, messages: HistoryMessage[]): number {
  if (!previousFirstId) return 0;
  return Math.max(0, messages.findIndex(m => m.id === previousFirstId));
}
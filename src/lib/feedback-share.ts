type FeedbackShareAPI = {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};

export type FeedbackShareResult = 'shared' | 'cancelled' | 'failed';

/** Attempt the selected file share without opening any external application itself. */
export async function shareFeedbackFiles(data: ShareData, api: FeedbackShareAPI): Promise<FeedbackShareResult> {
  try {
    if (data.files?.length && api.canShare?.({ files: data.files }) && api.share) {
      await api.share(data);
      return 'shared';
    }
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') return 'cancelled';
  }
  return 'failed';
}

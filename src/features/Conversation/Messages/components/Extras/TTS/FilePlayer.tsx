import { useAudioPlayer } from '@lobehub/tts/react';
import { memo, useCallback, useMemo } from 'react';

import { useFileStore } from '@/store/file';

import { useConversationStore } from '../../../../store';
import { type TTSProps } from './InitPlayer';
import Player from './Player';
import { unlockIOSAudio } from './unlockIOSAudio';

const FilePlayer = memo<TTSProps>(({ file, id }) => {
  const useFetchTTSFile = useFileStore((s) => s.useFetchTTSFile);
  const clearTTS = useConversationStore((s) => s.clearTTS);
  const { data, isLoading: isFileLoading } = useFetchTTSFile(file || null);
  const { isLoading, ...audio } = useAudioPlayer({ src: data ? data.url : '' });

  const handleDelete = useCallback(() => {
    clearTTS(id);
  }, [id, clearTTS]);

  // lobehub's AudioPlayer only fires onInitPlay when duration is 0; for an
  // already-fetched file the play button calls audio.play() directly. To run
  // the iOS audio-session unlock inside the user-gesture call stack, we wrap
  // the play method on the audio object passed to Player.
  const wrappedAudio = useMemo(
    () => ({
      ...audio,
      play: () => {
        void unlockIOSAudio();
        audio.play();
      },
    }),
    [audio],
  );

  if (!audio || isFileLoading) return;

  return <Player audio={wrappedAudio} isLoading={isLoading} onDelete={handleDelete} />;
});

export default FilePlayer;

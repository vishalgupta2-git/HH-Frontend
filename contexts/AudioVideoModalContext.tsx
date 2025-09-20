import React, { createContext, ReactNode, useContext } from 'react';

interface AudioVideoModalContextType {
  showAudioVideoModal: () => void;
  hideAudioVideoModal: () => void;
  pauseMusic: () => Promise<void>;
  resumeMusic: () => Promise<void>;
  isMusicPlaying: () => boolean;
}

const AudioVideoModalContext = createContext<AudioVideoModalContextType | undefined>(undefined);

interface AudioVideoModalProviderProps {
  children: ReactNode;
  showModal: () => void;
  hideModal: () => void;
  pauseMusic: () => Promise<void>;
  resumeMusic: () => Promise<void>;
  isMusicPlaying: () => boolean;
}

export const AudioVideoModalProvider: React.FC<AudioVideoModalProviderProps> = ({
  children,
  showModal,
  hideModal,
  pauseMusic,
  resumeMusic,
  isMusicPlaying,
}) => {
  return (
    <AudioVideoModalContext.Provider
      value={{
        showAudioVideoModal: showModal,
        hideAudioVideoModal: hideModal,
        pauseMusic,
        resumeMusic,
        isMusicPlaying,
      }}
    >
      {children}
    </AudioVideoModalContext.Provider>
  );
};

export const useAudioVideoModal = () => {
  const context = useContext(AudioVideoModalContext);
  if (context === undefined) {
    throw new Error('useAudioVideoModal must be used within an AudioVideoModalProvider');
  }
  return context;
};

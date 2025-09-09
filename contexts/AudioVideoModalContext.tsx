import React, { createContext, useContext, ReactNode } from 'react';

interface AudioVideoModalContextType {
  showAudioVideoModal: () => void;
  hideAudioVideoModal: () => void;
}

const AudioVideoModalContext = createContext<AudioVideoModalContextType | undefined>(undefined);

interface AudioVideoModalProviderProps {
  children: ReactNode;
  showModal: () => void;
  hideModal: () => void;
}

export const AudioVideoModalProvider: React.FC<AudioVideoModalProviderProps> = ({
  children,
  showModal,
  hideModal,
}) => {
  return (
    <AudioVideoModalContext.Provider
      value={{
        showAudioVideoModal: showModal,
        hideAudioVideoModal: hideModal,
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

import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import repeatIcon from "@/../public/repeat.svg"
import playNextIcon from "@/../public/play-next.svg"
import playIcon from "@/../public/play.svg"
import pauseIcon from "@/../public/pause.svg"
import playPreviousIcon from "@/../public/play-previous.svg"
import shuffleIcon from "@/../public/shuffle.svg"
import playingIcon from "@/../public/playing.svg"

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    clearPlayerState
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      audioRef.current.addEventListener('timeupdate', () => {
        setProgress(Math.floor(audioRef.current?.currentTime || 0));
      });
    }
  }

  function handleSeek(amount: any) {
    if (audioRef.current) {
      audioRef.current.currentTime = amount;
      setProgress(amount);
    }
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    } else {
      clearPlayerState()
    }
  }

  const episode = episodeList[currentEpisodeIndex]

  return (
    <div className={styles.playerContainer}>
      <header>
        <Image src={playingIcon} alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image
            style={{ objectFit: 'cover' }}
            width={592}
            height={592}
            src={episode.thumbnail}
            alt={episode.title}
          /> 
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      ) }

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            { episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            ) }
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        { episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            loop={isLooping}
            autoPlay
            onEnded={handleEpisodeEnded}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <Image src={shuffleIcon} alt="Embaralhar" />
          </button>
          <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
            <Image src={playPreviousIcon} alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            { isPlaying
              ? <Image src={pauseIcon} alt="Tocar" />
              : <Image src={playIcon} alt="Tocar" /> }
          </button>
          <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
            <Image src={playNextIcon} alt="Tocar próxima" />
          </button>
         <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <Image src={repeatIcon} alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
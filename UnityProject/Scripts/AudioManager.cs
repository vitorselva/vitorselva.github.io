using System.Collections.Generic;
using UnityEngine;

namespace SkyTap
{
    public class AudioManager : MonoBehaviour
    {
        [SerializeField] private AudioSource baseMusicSource;
        [SerializeField] private List<AudioSource> layeredSources = new();
        [SerializeField] private BackgroundManager backgroundManager;

        private void OnEnable()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged += HandleStateChanged;
            }
        }

        private void OnDisable()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged -= HandleStateChanged;
            }
        }

        private void HandleStateChanged(GameState state)
        {
            switch (state)
            {
                case GameState.Menu:
                    FadeOutLayers();
                    if (baseMusicSource != null && !baseMusicSource.isPlaying)
                    {
                        baseMusicSource.Play();
                    }
                    break;
                case GameState.Running:
                    if (baseMusicSource != null && !baseMusicSource.isPlaying)
                    {
                        baseMusicSource.Play();
                    }
                    UpdateLayer();
                    break;
                case GameState.GameOver:
                    FadeOutLayers();
                    break;
            }
        }

        private void Update()
        {
            if (GameManager.Instance != null && GameManager.Instance.IsGameRunning)
            {
                UpdateLayer();
            }
        }

        private void UpdateLayer()
        {
            if (backgroundManager == null)
            {
                return;
            }

            AudioClip targetClip = backgroundManager.GetMusicLayer();
            if (targetClip == null)
            {
                return;
            }

            AudioSource availableSource = layeredSources.Find(source => source.clip == targetClip);
            if (availableSource == null)
            {
                availableSource = layeredSources.Find(source => !source.isPlaying);
                if (availableSource != null)
                {
                    availableSource.clip = targetClip;
                }
            }

            if (availableSource != null && !availableSource.isPlaying)
            {
                availableSource.volume = 0f;
                availableSource.Play();
                StartCoroutine(FadeVolume(availableSource, 1f, 1.5f));
            }
        }

        private void FadeOutLayers()
        {
            foreach (AudioSource source in layeredSources)
            {
                if (source.isPlaying)
                {
                    StartCoroutine(FadeOutAndStop(source, 0.75f));
                }
            }
        }

        private System.Collections.IEnumerator FadeVolume(AudioSource source, float targetVolume, float duration)
        {
            float startVolume = source.volume;
            float elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                source.volume = Mathf.Lerp(startVolume, targetVolume, elapsed / duration);
                yield return null;
            }
            source.volume = targetVolume;
        }

        private System.Collections.IEnumerator FadeOutAndStop(AudioSource source, float duration)
        {
            float startVolume = source.volume;
            float elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                source.volume = Mathf.Lerp(startVolume, 0f, elapsed / duration);
                yield return null;
            }
            source.volume = 0f;
            source.Stop();
        }
    }
}


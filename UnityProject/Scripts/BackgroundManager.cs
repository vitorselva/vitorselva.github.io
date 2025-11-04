using System.Collections.Generic;
using UnityEngine;

namespace SkyTap
{
    [System.Serializable]
    public class BackgroundStage
    {
        public string label;
        public float startAltitude;
        public Color gradientTop;
        public Color gradientBottom;
        public Sprite parallaxLayer;
        public List<Sprite> obstacleSprites;
        public AudioClip musicLayer;
    }

    public class BackgroundManager : MonoBehaviour
    {
        [SerializeField] private Transform rocketTransform;
        [SerializeField] private SpriteRenderer gradientRenderer;
        [SerializeField] private SpriteRenderer parallaxRenderer;
        [SerializeField] private float lerpSpeed = 1f;
        [SerializeField] private List<BackgroundStage> stages = new();

        private BackgroundStage _currentStage;
        private BackgroundStage _nextStage;
        private float _stageBlend;

        private void Start()
        {
            stages.Sort((a, b) => a.startAltitude.CompareTo(b.startAltitude));
            UpdateStage(force: true);
        }

        private void Update()
        {
            UpdateStage();
            UpdateGradient();
            UpdateParallax();
        }

        private void UpdateStage(bool force = false)
        {
            if (rocketTransform == null || stages.Count == 0)
            {
                return;
            }

            float altitude = rocketTransform.position.y;

            for (int i = stages.Count - 1; i >= 0; i--)
            {
                if (altitude >= stages[i].startAltitude)
                {
                    if (_currentStage != stages[i] || force)
                    {
                        _currentStage = stages[i];
                        int nextIndex = Mathf.Min(i + 1, stages.Count - 1);
                        _nextStage = stages[nextIndex];
                    }
                    break;
                }
            }

            if (_currentStage == null)
            {
                _currentStage = stages[0];
                _nextStage = stages[Mathf.Min(1, stages.Count - 1)];
            }

            float range = Mathf.Max(1f, _nextStage.startAltitude - _currentStage.startAltitude);
            _stageBlend = Mathf.InverseLerp(_currentStage.startAltitude, _nextStage.startAltitude, altitude);
        }

        private void UpdateGradient()
        {
            if (gradientRenderer == null || _currentStage == null || _nextStage == null)
            {
                return;
            }

            Color top = Color.Lerp(_currentStage.gradientTop, _nextStage.gradientTop, _stageBlend);
            Color bottom = Color.Lerp(_currentStage.gradientBottom, _nextStage.gradientBottom, _stageBlend);

            Material mat = gradientRenderer.material;
            mat.SetColor("_TopColor", Color.Lerp(mat.GetColor("_TopColor"), top, Time.deltaTime * lerpSpeed));
            mat.SetColor("_BottomColor", Color.Lerp(mat.GetColor("_BottomColor"), bottom, Time.deltaTime * lerpSpeed));
        }

        private void UpdateParallax()
        {
            if (parallaxRenderer == null || _currentStage == null)
            {
                return;
            }

            Sprite targetSprite = _currentStage.parallaxLayer;
            if (_nextStage != null && _nextStage != _currentStage && _stageBlend > 0.5f)
            {
                targetSprite = _nextStage.parallaxLayer;
            }

            if (targetSprite != null && parallaxRenderer.sprite != targetSprite)
            {
                parallaxRenderer.sprite = targetSprite;
            }
        }

        public IReadOnlyList<Sprite> GetObstacleSet()
        {
            return _currentStage?.obstacleSprites ?? new List<Sprite>();
        }

        public AudioClip GetMusicLayer()
        {
            return _currentStage?.musicLayer;
        }
    }
}


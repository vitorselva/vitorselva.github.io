using System.Collections;
using UnityEngine;

namespace SkyTap
{
    public class ObstacleManager : MonoBehaviour
    {
        [SerializeField] private ObjectPool obstaclePool;
        [SerializeField] private Transform rocket;
        [SerializeField] private float spawnDistanceAhead = 20f;
        [SerializeField] private float horizontalRange = 3f;
        [SerializeField] private float baseSpawnInterval = 2f;
        [SerializeField] private AnimationCurve spawnCurveByAltitude;
        [SerializeField] private BackgroundManager backgroundManager;

        private Coroutine _spawnRoutine;

        private void OnEnable()
        {
            GameManager.Instance.OnStateChanged += HandleStateChanged;
        }

        private void OnDisable()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnStateChanged -= HandleStateChanged;
            }
        }

        private void HandleStateChanged(GameState newState)
        {
            if (_spawnRoutine != null)
            {
                StopCoroutine(_spawnRoutine);
                _spawnRoutine = null;
            }

            if (newState == GameState.Running)
            {
                _spawnRoutine = StartCoroutine(SpawnLoop());
            }
        }

        private IEnumerator SpawnLoop()
        {
            yield return new WaitForSeconds(1f);

            while (GameManager.Instance.IsGameRunning)
            {
                SpawnObstacle();
                float altitude = rocket != null ? rocket.position.y : 0f;
                float spawnFactor = spawnCurveByAltitude != null ? spawnCurveByAltitude.Evaluate(Mathf.Clamp01(altitude / 100f)) : 1f;
                float interval = Mathf.Max(0.5f, baseSpawnInterval / (spawnFactor + 0.1f));
                yield return new WaitForSeconds(interval);
            }
        }

        private void SpawnObstacle()
        {
            if (rocket == null || obstaclePool == null)
            {
                return;
            }

            GameObject obstacleGO = obstaclePool.Get();
            Vector3 spawnPos = rocket.position + Vector3.up * spawnDistanceAhead;
            spawnPos.x = Random.Range(-horizontalRange, horizontalRange);
            obstacleGO.transform.position = spawnPos;

            var obstacle = obstacleGO.GetComponent<Obstacle>();
            if (obstacle != null)
            {
                float altitude = rocket.position.y;
                float difficultyMultiplier = 1f + Mathf.Clamp01(altitude / 5000f);
                obstacle.Configure(obstaclePool, difficultyMultiplier, difficultyMultiplier);
            }

            var spriteRenderer = obstacleGO.GetComponentInChildren<SpriteRenderer>();
            if (spriteRenderer != null && backgroundManager != null)
            {
                var sprites = backgroundManager.GetObstacleSet();
                if (sprites.Count > 0)
                {
                    spriteRenderer.sprite = sprites[Random.Range(0, sprites.Count)];
                }
            }
        }
    }
}


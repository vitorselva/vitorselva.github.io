using UnityEngine;

namespace SkyTap
{
    [RequireComponent(typeof(Collider2D))]
    public class Obstacle : MonoBehaviour
    {
        [SerializeField] private float horizontalAmplitude = 1f;
        [SerializeField] private float horizontalFrequency = 1f;
        [SerializeField] private float verticalScrollSpeed = -2f;

        private Vector3 _initialPosition;
        private float _spawnTime;
        private bool _isActive;
        private ObjectPool _pool;

        private void OnEnable()
        {
            _initialPosition = transform.position;
            _spawnTime = Time.time;
            _isActive = true;
        }

        private void Update()
        {
            if (!_isActive)
            {
                return;
            }

            float elapsed = Time.time - _spawnTime;
            float horizontalOffset = Mathf.Sin(elapsed * horizontalFrequency) * horizontalAmplitude;

            transform.position = new Vector3(
                _initialPosition.x + horizontalOffset,
                transform.position.y + verticalScrollSpeed * Time.deltaTime,
                transform.position.z);

            if (transform.position.y < Camera.main.transform.position.y - 20f)
            {
                Despawn();
            }
        }

        public void Configure(ObjectPool pool, float amplitudeMultiplier, float speedMultiplier)
        {
            _pool = pool;
            horizontalAmplitude *= amplitudeMultiplier;
            verticalScrollSpeed *= speedMultiplier;
        }

        private void OnCollisionEnter2D(Collision2D collision)
        {
            var rocket = collision.collider.GetComponent<RocketController>();
            if (rocket != null)
            {
                GameManager.Instance.TriggerGameOver(GameOverReason.Collision);
            }
        }

        public void Despawn()
        {
            _isActive = false;
            if (_pool != null)
            {
                _pool.Release(gameObject);
            }
            else
            {
                gameObject.SetActive(false);
            }
        }
    }
}


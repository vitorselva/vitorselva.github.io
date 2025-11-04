using System;
using UnityEngine;

namespace SkyTap
{
    [RequireComponent(typeof(Rigidbody2D))]
    public class RocketController : MonoBehaviour
    {
        [Header("Referências")]
        [SerializeField] private HeatSystem heatSystem;
        [SerializeField] private ParticleSystem engineParticles;
        [SerializeField] private AudioSource engineAudio;

        [Header("Parâmetros de Física")]
        [SerializeField] private float thrustForce = 15f;
        [SerializeField] private float maxVerticalSpeed = 12f;
        [SerializeField] private float lateralSwayForce = 1.5f;

        [Header("Calor")]
        [SerializeField] private float heatPerSecond = 18f;
        [SerializeField] private float heatCooldownDelay = 0.25f;

        private Rigidbody2D _rigidbody;
        private bool _hasInput;
        private float _lastThrustTime;

        public event Action OnOverheated;
        public event Action OnExploded;

        private void Awake()
        {
            _rigidbody = GetComponent<Rigidbody2D>();
            if (heatSystem == null)
            {
                heatSystem = GetComponent<HeatSystem>();
            }
        }

        private void Update()
        {
            if (GameManager.Instance != null && !GameManager.Instance.CanAcceptGameplayInput)
            {
                SetThrusting(false);
                return;
            }

            HandleInput();
            UpdateHeat();
            UpdateFeedback();
        }

        private void FixedUpdate()
        {
            ApplyThrust();
            LimitVelocity();
        }

        private void HandleInput()
        {
            bool isPressing = false;

#if UNITY_IOS || UNITY_ANDROID
            isPressing = Input.touchCount > 0 && Input.GetTouch(0).phase != TouchPhase.Ended && Input.GetTouch(0).phase != TouchPhase.Canceled;
#else
            isPressing = Input.GetMouseButton(0);
#endif

            SetThrusting(isPressing);
        }

        private void SetThrusting(bool value)
        {
            _hasInput = value;
            if (_hasInput)
            {
                _lastThrustTime = Time.time;
            }
        }

        private void ApplyThrust()
        {
            if (!_hasInput || heatSystem == null || heatSystem.IsOverheated)
            {
                return;
            }

            var force = Vector2.up * thrustForce;
            _rigidbody.AddForce(force, ForceMode2D.Force);

            // Suave correção lateral para manter foguete centralizado
            if (Mathf.Abs(_rigidbody.position.x) > 0.01f)
            {
                float correction = -_rigidbody.position.x * lateralSwayForce;
                _rigidbody.AddForce(Vector2.right * correction, ForceMode2D.Force);
            }

            heatSystem.AddHeat(heatPerSecond * Time.fixedDeltaTime);
        }

        private void UpdateHeat()
        {
            if (heatSystem == null)
            {
                return;
            }

            bool canCool = !_hasInput && Time.time - _lastThrustTime > heatCooldownDelay;
            heatSystem.Tick(canCool);

            if (heatSystem.IsOverheated)
            {
                OnOverheated?.Invoke();
                Explode();
            }
        }

        private void UpdateFeedback()
        {
            if (engineParticles != null)
            {
                if (_hasInput && !engineParticles.isPlaying)
                {
                    engineParticles.Play();
                }
                else if (!_hasInput && engineParticles.isPlaying)
                {
                    engineParticles.Stop();
                }
            }

            if (engineAudio != null)
            {
                engineAudio.mute = !_hasInput;
            }
        }

        private void LimitVelocity()
        {
            if (_rigidbody.velocity.y > maxVerticalSpeed)
            {
                _rigidbody.velocity = new Vector2(_rigidbody.velocity.x, maxVerticalSpeed);
            }
        }

        private void OnCollisionEnter2D(Collision2D collision)
        {
            if (GameManager.Instance != null && !GameManager.Instance.IsGameRunning)
            {
                return;
            }

            Explode();
        }

        private void Explode()
        {
            if (GameManager.Instance != null && !GameManager.Instance.IsGameRunning)
            {
                return;
            }

            GameManager.Instance?.TriggerGameOver(GameOverReason.Collision);
            OnExploded?.Invoke();
            SetThrusting(false);
            if (engineParticles != null)
            {
                engineParticles.Stop();
            }
        }
    }
}


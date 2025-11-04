using System.Collections.Generic;
using UnityEngine;

namespace SkyTap
{
    public class ObjectPool : MonoBehaviour
    {
        [SerializeField] private GameObject prefab;
        [SerializeField] private int initialSize = 10;
        [SerializeField] private Transform poolParent;

        private readonly Queue<GameObject> _pool = new();

        private void Awake()
        {
            if (prefab == null)
            {
                Debug.LogError("ObjectPool sem prefab configurado", this);
                enabled = false;
                return;
            }

            for (int i = 0; i < initialSize; i++)
            {
                ExpandPool();
            }
        }

        public GameObject Get()
        {
            if (_pool.Count == 0)
            {
                ExpandPool();
            }

            GameObject instance = _pool.Dequeue();
            instance.SetActive(true);
            return instance;
        }

        public void Release(GameObject instance)
        {
            instance.SetActive(false);
            instance.transform.SetParent(poolParent != null ? poolParent : transform);
            _pool.Enqueue(instance);
        }

        private void ExpandPool()
        {
            GameObject instance = Instantiate(prefab, poolParent != null ? poolParent : transform);
            instance.SetActive(false);
            _pool.Enqueue(instance);
        }
    }
}


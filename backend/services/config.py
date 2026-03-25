import os
import json
from typing import Any, Dict
from .log import logger

APP_VERSION = "1.0.0"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
CONFIG_DIR = os.path.join(DATA_DIR, "configs")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
DB_DIR = os.path.join(DATA_DIR, "database")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CONFIG_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)


class AppConfig:
    _BOOTSTRAP_KEYS = {"initialized", "host", "port"}
    _RUNTIME_KEYS = {"models_dir", "civitai_api_key", "http_proxy", "max_concurrent_downloads"}

    _BOOTSTRAP_DEFAULT = {
        "initialized": False,
        "host": "0.0.0.0",
        "port": 8000,
    }

    _RUNTIME_DEFAULT = {
        "models_dir": "C:/ComfyUI/models",
        "civitai_api_key": "",
        "http_proxy": "",
        "max_concurrent_downloads": 2,
    }

    def __init__(self):
        self._bootstrap_cache = {}
        self._runtime_cache = {}
        self.load_bootstrap()

    def load_bootstrap(self):
        if not os.path.exists(CONFIG_FILE):
            self._bootstrap_cache = self._BOOTSTRAP_DEFAULT.copy()
            self._save_bootstrap()
        else:
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._bootstrap_cache = {**self._BOOTSTRAP_DEFAULT, **data}
            except Exception as e:
                logger.error(f"加载引导配置失败，使用默认值: {e}")
                self._bootstrap_cache = self._BOOTSTRAP_DEFAULT.copy()

    def _save_bootstrap(self):
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(
                {
                    k: v
                    for k, v in self._bootstrap_cache.items()
                    if k in self._BOOTSTRAP_KEYS
                },
                f,
                indent=4,
            )

    def load_runtime_from_db(self):
        import backend.services.database as db

        try:
            rows = db.fetchall("SELECT key, value FROM settings")
            for row in rows:
                if row["key"] in self._RUNTIME_KEYS:
                    try:
                        self._runtime_cache[row["key"]] = json.loads(row["value"])
                    except json.JSONDecodeError:
                        self._runtime_cache[row["key"]] = row["value"]
        except Exception as e:
            logger.error(f"从数据库加载运行时配置失败: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        if key in self._BOOTSTRAP_KEYS:
            return self._bootstrap_cache.get(
                key, self._BOOTSTRAP_DEFAULT.get(key, default)
            )
        if key in self._RUNTIME_KEYS:
            return self._runtime_cache.get(key, self._RUNTIME_DEFAULT.get(key, default))
        return default

    def set(self, key: str, value: Any):
        if key in self._BOOTSTRAP_KEYS:
            self._bootstrap_cache[key] = value
            self._save_bootstrap()
        elif key in self._RUNTIME_KEYS:
            self._runtime_cache[key] = value
            import backend.services.database as db

            db.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=?",
                (
                    key,
                    json.dumps(value) if not isinstance(value, str) else value,
                    json.dumps(value) if not isinstance(value, str) else value,
                ),
            )
        else:
            logger.warning(f"尝试设置未定义的配置项: {key}")

    def update(self, updates: Dict[str, Any]):
        for key, value in updates.items():
            self.set(key, value)


app_config = AppConfig()

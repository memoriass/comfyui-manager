import uuid
import bcrypt
from typing import Optional, Dict
from .log import logger
import backend.services.database as db


class ROLE:
    ADMIN = 10
    USER = 1


class UserManager:
    @staticmethod
    def _hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def _check_password(password: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
        except ValueError:
            return False

    def create_user(
        self, username: str, password: str, permission: int = ROLE.USER
    ) -> Optional[Dict]:
        user_uuid = str(uuid.uuid4())
        hashed = self._hash_password(password)
        try:
            db.execute(
                "INSERT INTO users (uuid, username, password_hash, permission) VALUES (?, ?, ?, ?)",
                (user_uuid, username, hashed, permission),
            )
            return {"uuid": user_uuid, "userName": username, "permission": permission}
        except Exception as e:
            logger.error(f"创建用户失败: {e}")
            return None

    def check_login(self, username: str, password: str) -> Optional[Dict]:
        row = db.fetchone(
            "SELECT uuid, username, password_hash, permission FROM users WHERE username = ?",
            (username,),
        )
        if row and self._check_password(password, row["password_hash"]):
            db.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE uuid = ?",
                (row["uuid"],),
            )
            return {
                "uuid": row["uuid"],
                "userName": row["username"],
                "permission": row["permission"],
            }
        return None

    def get_user_by_uuid(self, user_uuid: str) -> Optional[Dict]:
        row = db.fetchone(
            "SELECT uuid, username, permission FROM users WHERE uuid = ?", (user_uuid,)
        )
        if row:
            return {
                "uuid": row["uuid"],
                "userName": row["username"],
                "permission": row["permission"],
            }
        return None

    def update_password(self, username: str, new_password: str) -> bool:
        hashed = self._hash_password(new_password)
        count = db.execute(
            "UPDATE users SET password_hash = ? WHERE username = ?", (hashed, username)
        )
        return count > 0


user_manager = UserManager()

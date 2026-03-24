import logging
import sys

logger = logging.getLogger("comfyui_manager")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    ch.setFormatter(formatter)
    logger.addHandler(ch)

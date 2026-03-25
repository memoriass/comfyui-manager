import os
import json
import hashlib
import aiohttp
import asyncio
import mmap
import struct
from backend.services.log import logger

def get_safetensors_metadata_hash(file_path: str):
    """尝试从 safetensors 头部直接提取内置的 Hash，达到 0 毫秒计算"""
    if not file_path.endswith('.safetensors'):
        return None
    try:
        with open(file_path, 'rb') as f:
            header_size_bytes = f.read(8)
            if len(header_size_bytes) < 8:
                return None
            header_size = struct.unpack('<Q', header_size_bytes)[0]
            # 防御性检查，头部如果大于 100MB 可能是假文件
            if header_size > 100 * 1024 * 1024:
                return None
            header_bytes = f.read(header_size)
            header = json.loads(header_bytes)
            metadata = header.get('__metadata__', {})
            # 查找已知的标准 Hash 字段
            return metadata.get('modelspec.hash_sha256')
    except Exception as e:
        logger.debug(f"Failed to read safetensors metadata: {e}")
    return None

def calculate_sha256(file_path: str) -> str:
    """计算文件的 SHA256 (支持 metadata 提取和 mmap 零拷贝加速)"""
    # 1. 优先尝试从 metadata 获取
    meta_hash = get_safetensors_metadata_hash(file_path)
    if meta_hash and len(meta_hash) >= 10:
        logger.info(f"Got hash from safetensors metadata: {meta_hash[:10]}...")
        return meta_hash

    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        try:
            # 2. 尝试 mmap 内存映射读取，最大程度利用系统缓存页，避免内核态到用户态的内存复制
            with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as mm:
                sha256_hash.update(mm)
        except Exception:
            # 3. 如果 mmap 失败，回退到大内存分块读取 (16MB)
            f.seek(0)
            for byte_block in iter(lambda: f.read(16 * 1024 * 1024), b""):
                sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

async def sync_model_from_civitai(file_path: str, proxies: str = None, api_key: str = None):
    # 1. 计算 Hash
    logger.info(f"Calculating hash for {file_path}")
    loop = asyncio.get_event_loop()
    file_hash = await loop.run_in_executor(None, calculate_sha256, file_path)
    logger.info(f"Hash for {file_path} is {file_hash}")

    # 2. 请求 Civitai API
    headers = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    
    url = f"https://civitai.com/api/v1/model-versions/by-hash/{file_hash}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, proxy=proxies, timeout=30) as resp:
            if resp.status == 404:
                raise Exception("Model not found on Civitai (Hash mismatch)")
            if resp.status != 200:
                text = await resp.text()
                raise Exception(f"Civitai API error {resp.status}: {text}")
            data = await resp.json()
            
        # 3. 提取数据
        model_version_name = data.get("name", "")
        base_model = data.get("baseModel", "")
        trained_words = data.get("trainedWords", [])
        model_data = data.get("model", {})
        model_name = model_data.get("name", "")
        description = data.get("description", "") or model_data.get("description", "")
        
        images = data.get("images", [])
        image_url = images[0].get("url", "") if images else ""
        
        metadata = {
            "civitai_id": data.get("id"),
            "model_id": data.get("modelId"),
            "name": model_name,
            "version": model_version_name,
            "baseModel": base_model,
            "trainedWords": trained_words,
            "description": description,
            "image_url": image_url,
            "hash": file_hash
        }
        
        base_path = os.path.splitext(file_path)[0]
        json_path = f"{base_path}.json"
        
        # 保存 json
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)
            
        # 下载图片
        if image_url:
            preview_path = f"{base_path}.preview.png"
            try:
                async with session.get(image_url, proxy=proxies, timeout=30) as img_resp:
                    if img_resp.status == 200:
                        img_data = await img_resp.read()
                        with open(preview_path, "wb") as f:
                            f.write(img_data)
            except Exception as e:
                logger.error(f"Failed to download image from {image_url}: {e}")
                
        return metadata


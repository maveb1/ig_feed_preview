from flask import Flask, jsonify, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import httpx
import re
import os
import hashlib

BASE_URL = os.environ.get('RAILWAY_PUBLIC_DOMAIN', '')
if BASE_URL:
    BASE_URL = f'https://{BASE_URL}'
else:
    BASE_URL = f'http://localhost:{os.environ.get("PORT", 5050)}'

app = Flask(__name__)
CORS(app)

cache: dict = {}
CACHE_TTL = timedelta(minutes=10)

IMG_DIR = os.path.join(os.path.dirname(__file__), '.img_cache')
os.makedirs(IMG_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8',
    'X-IG-App-ID': '936619743392459',
    'X-ASBD-ID': '129477',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
}


def download_image(url: str) -> str:
    """Download image to local cache, return filename."""
    name = hashlib.md5(url.encode()).hexdigest() + '.jpg'
    path = os.path.join(IMG_DIR, name)
    if not os.path.exists(path):
        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=20) as client:
            r = client.get(url)
            r.raise_for_status()
            with open(path, 'wb') as f:
                f.write(r.content)
    return name


@app.route('/api/image/<filename>')
def serve_image(filename: str):
    path = os.path.join(IMG_DIR, filename)
    if not os.path.exists(path):
        return 'Not found', 404
    return send_file(path, mimetype='image/jpeg')


def fetch_via_api(username: str) -> list:
    url = f'https://www.instagram.com/api/v1/users/web_profile_info/?username={username}'
    with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=15) as client:
        r = client.get(url)
        r.raise_for_status()
        data = r.json()

    edges = (
        data.get('data', {})
            .get('user', {})
            .get('edge_owner_to_timeline_media', {})
            .get('edges', [])
    )
    posts = []
    for edge in edges[:15]:
        node = edge.get('node', {})
        shortcode = node.get('shortcode', '')
        cdn_url = node.get('display_url') or node.get('thumbnail_src', '')
        if cdn_url:
            filename = download_image(cdn_url)
            posts.append({'id': shortcode, 'imageUrl': f'{BASE_URL}/api/image/{filename}'})
    return posts


def fetch_via_html(username: str) -> list:
    url = f'https://www.instagram.com/{username}/'
    with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=15) as client:
        r = client.get(url)
        r.raise_for_status()
        html = r.text

    match = re.search(r'window\._sharedData\s*=\s*(\{.+?\});</script>', html)
    if not match:
        raise ValueError('Nepodařilo se extrahovat data ze stránky profilu.')

    import json
    shared = json.loads(match.group(1))
    edges = (
        shared.get('entry_data', {})
              .get('ProfilePage', [{}])[0]
              .get('graphql', {})
              .get('user', {})
              .get('edge_owner_to_timeline_media', {})
              .get('edges', [])
    )
    posts = []
    for edge in edges[:15]:
        node = edge.get('node', {})
        shortcode = node.get('shortcode', '')
        cdn_url = node.get('display_url') or node.get('thumbnail_src', '')
        if cdn_url:
            filename = download_image(cdn_url)
            posts.append({'id': shortcode, 'imageUrl': f'{BASE_URL}/api/image/{filename}'})
    return posts


@app.route('/api/profile/<username>')
def get_profile(username: str):
    if username in cache:
        ts, posts = cache[username]
        if datetime.now() - ts < CACHE_TTL:
            return jsonify({'posts': posts})

    posts = []
    last_error = ''

    try:
        posts = fetch_via_api(username)
    except Exception as e:
        last_error = str(e)
        print(f'API endpoint selhal: {e}, zkouším HTML scraping...')

    if not posts:
        try:
            posts = fetch_via_html(username)
        except Exception as e:
            last_error = str(e)

    if not posts:
        return jsonify({
            'error': f'Nepodařilo se načíst feed. Instagram blokuje požadavek. ({last_error})'
        }), 400

    cache[username] = (datetime.now(), posts)
    return jsonify({'posts': posts})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port, debug=False)

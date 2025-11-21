import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def get_url_metadata(url: str):
    """
    Fetches the title and a best-guess favicon for a given URL.
    """
    if not url.startswith('http'):
        url = 'https://' + url
        
    try:
        # Set a user agent to avoid being blocked by some sites
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Get Title
        title = soup.title.string if soup.title else urlparse(url).netloc
        title = title.strip() if title else "Novo Botão"
        
        # Get Favicon (Use Google's service for reliability in prototype)
        # Parsing <link rel="icon"> is complex due to relative paths and multiple sizes.
        # Google's service is a robust fallback.
        parsed_uri = urlparse(url)
        domain = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_uri)
        
        # We will use Google's service as the primary source for the icon URL
        # It returns a PNG, which is easy to handle.
        icon_url = f"https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={domain}&size=128"
        
        return {
            "title": title,
            "icon_url": icon_url,
            "original_url": url
        }
        
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        # Fallback if scraping fails
        return {
            "title": urlparse(url).netloc or "Link",
            "icon_url": "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://google.com&size=128", # Generic fallback
            "original_url": url
        }

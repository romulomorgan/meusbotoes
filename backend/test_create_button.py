import requests
import sys

BASE_URL = "http://localhost:8001/api"

def test_create_button():
    # 1. Login
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        response.raise_for_status()
        token = response.json()["access_token"]
        print("Login successful")
    except Exception as e:
        print(f"Login failed: {e}")
        print(response.text)
        return

    # 2. Create Button
    headers = {
        "Authorization": f"Bearer {token}"
    }
    button_data = {
        "original_url": "https://example.com",
        "category_id": None
    }
    
    try:
        response = requests.post(f"{BASE_URL}/buttons/", json=button_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        response.raise_for_status()
        print("Button created successfully")
    except Exception as e:
        print(f"Create button failed: {e}")

if __name__ == "__main__":
    test_create_button()

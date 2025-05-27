import requests

headers = {
    "Authorization": "Bearer abc1234xyz"
}

response = requests.get("http://localhost:7000/auth/tokens", headers=headers)

print("Status code:", response.status_code)
print("Raw response body:", response.text)

# Only try to parse JSON if status is OK
if response.status_code == 200:
    print("JSON:", response.json())

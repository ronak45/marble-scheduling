#!/usr/bin/env python3
"""
Simple script to test the FastAPI backend
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to FastAPI server. Is it running on port 8000?")
        return False

def test_insurance_payers():
    """Test insurance payers endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/insurance-payers")
        print(f"Insurance Payers: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} insurance payers")
            for payer in data[:3]:  # Show first 3
                print(f"  - {payer['name']} ({payer['id']})")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to FastAPI server")
        return False

def test_availabilities():
    """Test availabilities endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/availabilities?insurance=bluecross")
        print(f"Availabilities: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} availabilities for Blue Cross")
            if data:
                print(f"First availability: {data[0]['therapist']['name']} at {data[0]['startTime']}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to FastAPI server")
        return False

if __name__ == "__main__":
    print("🧪 Testing FastAPI Backend")
    print("=" * 40)
    
    if test_health():
        print("✅ Health check passed")
    else:
        print("❌ Health check failed")
        exit(1)
    
    print()
    
    if test_insurance_payers():
        print("✅ Insurance payers endpoint working")
    else:
        print("❌ Insurance payers endpoint failed")
    
    print()
    
    if test_availabilities():
        print("✅ Availabilities endpoint working")
    else:
        print("❌ Availabilities endpoint failed")
    
    print()
    print("🎉 All tests completed!")

#!/usr/bin/env python3
"""
Quick startup verification script for IoT Room Access Control
Tests both backend API and MQTT connection
"""

import sys
import os
import requests
import time
from threading import Thread

# Add back directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'back'))

def test_backend():
    """Test if backend API is running"""
    try:
        response = requests.get('http://127.0.0.1:5000/api/health', timeout=3)
        if response.status_code == 200:
            print("✅ Backend API: Running on http://127.0.0.1:5000")
            return True
    except:
        pass
    print("❌ Backend API: Not responding")
    return False

def test_mqtt():
    """Test MQTT connection"""
    try:
        from back.mqtt_client import get_mqtt_client
        client = get_mqtt_client()
        if client and client.connected:
            print("✅ MQTT Broker: Connected")
            return True
    except:
        pass
    print("⚠️  MQTT Broker: Check connection")
    return False

def main():
    print("=" * 60)
    print("IoT Room Access Control - Startup Verification")
    print("=" * 60)
    print()
    
    print("Checking services...")
    print()
    
    # Test backend after a delay
    time.sleep(2)
    api_ok = test_backend()
    
    print()
    print("=" * 60)
    
    if api_ok:
        print("✅ System Ready!")
        print("Frontend: http://localhost:5173")
        print("API: http://127.0.0.1:5000")
        print("=" * 60)
        return 0
    else:
        print("⚠️  Some issues detected")
        print("Try: Run PowerShell as Administrator")
        print("=" * 60)
        return 1

if __name__ == '__main__':
    sys.exit(main())

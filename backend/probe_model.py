import requests
import json

def probe_all():
    base_data = {"temperature": 30.0, "ph": 7.0, "dissolved_oxygen": 8.0, "turbidity": 5.0}
    
    params = [
        ("temperature", [10, 20, 25, 30, 35, 40]),
        ("ph", [4, 6, 7, 8, 9, 10]),
        ("dissolved_oxygen", [2, 4, 6, 8, 10]),
        ("turbidity", [0, 5, 20, 50, 100])
    ]

    for param_name, values in params:
        print(f"\nProbing {param_name}:")
        print(f"{'Val':<6} | {'Risk':<10} | {'Conf':<6}")
        print("-" * 30)
        
        for v in values:
            data = base_data.copy()
            data[param_name] = v
            try:
                resp = requests.post("http://127.0.0.1:8000/predict", json=data)
                res = resp.json()
                print(f"{str(v):<6} | {res['risk_status']:<10} | {res['confidence']:<6}")
            except Exception as e:
                print(f"{v}: Error {e}")

if __name__ == "__main__":
    probe_all()

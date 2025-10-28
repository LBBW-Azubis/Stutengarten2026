# Powershell:
# locust -f "C:\Users\jdjfc\Documents\GitHub\Stutengarten2026\backend\locustfile.py" --host http://localhost:5000

from locust import HttpUser, task, between

class SimpleUser(HttpUser):
    # kurze Pausen zwischen Requests
    wait_time = between(0.05, 0.2)

    @task(5)
    def health(self):
        # sehr leichtgewichtiger Check (DB-Connection + SELECT 1)
        self.client.get("/health", name="GET /health")

    @task(1)
    def customer_savingsbooks(self):
        # optional, etwas “echtere” DB-Last; falls leer, kommt einfach eine leere Liste
        self.client.get("/customersavingsbook", name="GET /customersavingsbook")

    @task(1)
    def company_savingsbooks(self):
        # optional
        self.client.get("/companysavingsbook", name="GET /companysavingsbook")
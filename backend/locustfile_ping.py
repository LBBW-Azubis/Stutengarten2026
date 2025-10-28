# Powershell
# locust -f "C:\Users\jdjfc\Documents\GitHub\Stutengarten2026\backend\locustfile_ping.py" --host http://localhost:5000

from locust import HttpUser, task, between
class PingUser(HttpUser):
    wait_time = between(0.1, 0.2)
    @task
    def ping(self):
        self.client.get("/ping", name="GET /ping")
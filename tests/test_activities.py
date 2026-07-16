def test_get_activities(client):
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    act = data["Chess Club"]
    for key in ("description", "schedule", "max_participants", "participants"):
        assert key in act


def test_signup_success(client):
    activity = "Basketball"
    email = "newstudent@mergington.edu"
    res = client.post(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 200
    assert "Signed up" in res.json().get("message", "")

    # Verify participant present after signup
    res2 = client.get("/activities")
    assert email in res2.json()[activity]["participants"]


def test_signup_duplicate(client):
    activity = "Basketball"
    email = "alex@mergington.edu"  # already present in initial data
    res = client.post(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 400
    assert res.json().get("detail")


def test_signup_activity_not_found(client):
    res = client.post("/activities/NoSuchActivity/signup?email=a@a.com")
    assert res.status_code == 404


def test_remove_participant_success(client):
    activity = "Basketball"
    email = "alex@mergington.edu"
    res = client.delete(f"/activities/{activity}/participants?email={email}")
    assert res.status_code == 200

    res2 = client.get("/activities")
    assert email not in res2.json()[activity]["participants"]


def test_remove_participant_not_found(client):
    activity = "Basketball"
    email = "not@there.com"
    res = client.delete(f"/activities/{activity}/participants?email={email}")
    assert res.status_code == 404

from fastapi import FastAPI
from model.recommender import hybrid_recommend, search_movies

app = FastAPI()

@app.get("/recommend/{user_id}")
def recommend(user_id: int):
    return hybrid_recommend(user_id)


@app.get("/search")
def search(q: str, limit: int = 30):
    return search_movies(q, limit)
import pandas as pd
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

# Load dataset once (global)
base_dir = Path(__file__).resolve().parents[1]
dataset_dir = base_dir / "dataset" / "ml-1m"

ratings = pd.read_csv(
    dataset_dir / "ratings.dat",
    sep="::",
    engine="python",
    names=["userId", "movieId", "rating", "timestamp"],
    encoding="latin1"
)

movies = pd.read_csv(
    dataset_dir / "movies.dat",
    sep="::",
    engine="python",
    names=["movieId", "title", "genres"],
    encoding="latin1"
)

movies["genres"] = movies["genres"].str.split("|")
movies["genres_str"] = movies["genres"].apply(lambda x: " ".join(x))
movies["releaseYear"] = (
    movies["title"]
    .str.extract(r"\((\d{4})\)\s*$", expand=False)
    .fillna("0")
    .astype(int)
)

movie_average_ratings = ratings.groupby("movieId")["rating"].mean().round(1)

# User-based matrix
user_movie_matrix = ratings.pivot_table(
    index="userId",
    columns="movieId",
    values="rating"
)

user_movie_filled = user_movie_matrix.fillna(0)
user_similarity = cosine_similarity(user_movie_filled)

user_similarity_df = pd.DataFrame(
    user_similarity,
    index=user_movie_matrix.index,
    columns=user_movie_matrix.index
)

# Content similarity
tfidf = TfidfVectorizer()
genre_matrix = tfidf.fit_transform(movies["genres_str"])
genre_similarity = cosine_similarity(genre_matrix)

def hybrid_recommend(user_id, top_n=10):

    if user_id not in user_similarity_df.index:
        return []

    # Collaborative
    similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:11]
    similar_user_ids = similar_users.index

    movies_rated = ratings[ratings["userId"].isin(similar_user_ids)]

    movie_scores = {}

    for _, row in movies_rated.iterrows():
        movie_id = row["movieId"]
        rating = row["rating"]
        sim_user = row["userId"]

        similarity = user_similarity_df.loc[user_id, sim_user]

        if movie_id not in movie_scores:
            movie_scores[movie_id] = 0

        movie_scores[movie_id] += similarity * rating

    cf = pd.DataFrame(movie_scores.items(), columns=["movieId", "cf_score"])

    # Content
    user_movies = ratings[ratings["userId"] == user_id]
    liked_movies = user_movies[user_movies["rating"] >= 4]
    liked_ids = liked_movies["movieId"].values

    content_scores = {}

    for movie_id in liked_ids:
        movie_rows = movies[movies["movieId"] == movie_id]
        if movie_rows.empty:
            continue

        idx = movie_rows.index[0]
        sim_scores = list(enumerate(genre_similarity[idx]))

        for i, score in sim_scores:
            target_movie_id = movies.iloc[i]["movieId"]

            if target_movie_id not in content_scores:
                content_scores[target_movie_id] = 0

            content_scores[target_movie_id] += score

    content = pd.DataFrame(content_scores.items(), columns=["movieId", "content_score"])

    # Merge
    hybrid = pd.merge(cf, content, on="movieId", how="outer").fillna(0)

    if hybrid.empty:
        return []

    cf_max = hybrid["cf_score"].max()
    content_max = hybrid["content_score"].max()

    hybrid["cf_score"] = 0 if pd.isna(cf_max) or cf_max == 0 else hybrid["cf_score"] / cf_max
    hybrid["content_score"] = 0 if pd.isna(content_max) or content_max == 0 else hybrid["content_score"] / content_max

    hybrid["final_score"] = 0.7 * hybrid["cf_score"] + 0.3 * hybrid["content_score"]

    rated = ratings[ratings["userId"] == user_id]["movieId"]
    hybrid = hybrid[~hybrid["movieId"].isin(rated)]

    hybrid = hybrid.sort_values("final_score", ascending=False)

    result = pd.merge(
        hybrid.head(top_n),
        movies[["movieId", "title", "genres", "releaseYear"]],
        on="movieId"
    )

    result["averageRating"] = result["movieId"].map(movie_average_ratings).fillna(0).round(1)

    return result[["movieId", "title", "genres", "releaseYear", "averageRating"]].to_dict(orient="records")


def search_movies(query, limit=30):
    normalized_query = str(query or "").strip().lower()

    if not normalized_query:
        return []

    title_match = movies["title"].str.lower().str.contains(normalized_query, na=False)
    genre_match = movies["genres_str"].str.lower().str.contains(normalized_query, na=False)

    results = movies[title_match | genre_match][["movieId", "title", "genres", "releaseYear"]].head(limit).copy()
    results["averageRating"] = results["movieId"].map(movie_average_ratings).fillna(0).round(1)
    return results.to_dict(orient="records")
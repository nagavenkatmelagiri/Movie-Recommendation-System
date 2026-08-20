import { useEffect, useState } from "react";
import axios from "axios";

export default function FriendsActivity({ userId }) {

  const [activity, setActivity] = useState([]);
  const normalizedUserId = Number(userId);

  useEffect(() => {
    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      setActivity([]);
      return;
    }

    axios.get(`http://localhost:8080/ratings/friends/${normalizedUserId}`)
      .then(res => setActivity(res.data))
      .catch(() => setActivity([]));
  }, [normalizedUserId]);

  return (
    <div>
      <h2>Friends Activity</h2>

      {activity.map((a, index) => (
        <div key={index}>
          <b>{a.user.name}</b> rated <b>{a.movie.title}</b> ⭐ {a.score}
        </div>
      ))}
    </div>
  );
}
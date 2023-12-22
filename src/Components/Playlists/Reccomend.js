import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const getRecPl = async (token, track) => {
  try {
    console.log(track.name)
    const { data } = await axios.get(`https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${track.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return Promise.resolve(data.tracks);
  } catch (error) {
    return Promise.reject(error);
  }
};

const Reccomend = () => {
  const location = useLocation();
  const { token = '', playlist = [] } = location.state || {};
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  console.log(playlist.tracks.total)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("here")
        if (playlist.tracks.total > 0) {
          console.log(playlist.tracks)
          const firstTrack = playlist.tracks;
          const recTracks = await getRecPl(token, firstTrack);
          setRecommendedTracks(recTracks);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchData();
  }, [token, playlist]);

  return (
    <div>
      <h2>Recommended Tracks</h2>
      <ul>
        {recommendedTracks.map((track) => (
          <li key={track.id}>{track.name} - {track.artists.map(artist => artist.name).join(', ')}</li>
        ))}
      </ul>
    </div>
  );
};

export default Reccomend;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const getRecPl = async (token, href) => {
  try {
    console.log(href)
    const { data } = await axios.get(href + "/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data.items[0])
    const track = data.items[0].track.id
    const artist = data.items[0].track.artists[0].id
    const genre = data.items[0].track.artists
    console.log(track)
    console.log(artist)
    console.log(genre)
    const { data: data2 } = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        seed_artists: artist,
        seed_genres: genre.map((artist) => artist.id).join(","), // assuming genre is an array
        seed_tracks: track,
      },
    });
    console.log(data2)
    return Promise.resolve(data2);
  } catch (error) {
    console.error(error.stack)
    return Promise.reject(error);
  }
};

const Reccomend = () => {
  const location = useLocation();
  const { token = '', playlist = [] } = location.state || {};
  const [recommendedTracks, setRecommendedTracks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(playlist)
        if (playlist.tracks.total > 0) {
          console.log(playlist.href)
          const recTracks = await getRecPl(token, playlist.href);
          setRecommendedTracks(recTracks.tracks);
        }
      } catch (error) {
        console.error(error.stack)
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


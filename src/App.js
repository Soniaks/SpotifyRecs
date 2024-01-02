import './App.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import NavBar from './Components/NavBar';
import TopTracks from './Components/TopTracks';
import Playlists from './Components/Playlists/Playlists';
import Reccomend from './Components/Playlists/Reccomend';
import Home from './Components/Home'


function App() {
  const CLIENT_ID = "ff3a2fd9b7d14faaaeb38b4653862f0f";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "access_token";
  const SCOPE = "user-read-private user-read-email playlist-read-private user-top-read"

  const [topTracks, setTopTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [profile, setProfile] = useState("");
  const [userID, setUserID] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        let params = new URLSearchParams(window.location.search);
        let code = params.get("code");
  
        if (!code) {
          redirectToAuthCodeFlow(CLIENT_ID);
          params = new URLSearchParams(window.location.search);
          code = params.get("code");
        }
  
        console.log(code);
        const token = await getAccessToken(CLIENT_ID, code);
        console.log(token);
        if(token) setToken(token);
        console.log(token)
      }catch(error){

      }};
  
      fetchData();
    }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(token);
        // Fetch top tracks and profile when the component mounts or when the token changes
        if (token) {
          console.log(token)
          const profileData = await getProfile();
          setProfile(profileData.id);
          console.log(profileData)
  
          const topTracksData = await getTopTracks();
          setTopTracks(topTracksData.items);
          console.log(topTracks)
          // Extract userID from profileData
          const userID = profileData.id;
          setUserID(userID);
  
          const playlistData = await getPlaylists(userID);
          setPlaylists(playlistData.items);
          console.log(playlists)
        }
      } catch (error) {
        console.log(token)
        console.error(error.stack)
        console.error("Error fetching data:", error);
        // Handle the error, e.g., show an error message to the user
      }
    };
  
    fetchData();
    setLoading(false);
  }, [token]);
  
  // Dependency array ensures the effect runs only when token changes
   async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    console.log(access_token);
    return access_token;
}

 async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:3000");
  params.append("scope", SCOPE);
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}


  const getTopTracks = async () => {
    try {
      console.log(token)
      // The axios.get method returns a Promise
      const { data } = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Returning the data wrapped in a resolved Promise
      return Promise.resolve(data);
    } catch (error) {
      console.log(error.stack)
      // Returning a rejected Promise in case of an error
      return Promise.reject(error);
    }
  };


  const getPlaylists = async (userID) => {
    try {
      console.log(userID)
    // The axios.get method returns a Promise
      const { data } = await axios.get("https://api.spotify.com/v1/users/" + userID + "/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(data)
      // Returning the data wrapped in a resolved Promise
      return Promise.resolve(data);
    } catch (error) {
      console.log(error)
      // Returning a rejected Promise in case of an error
      return Promise.reject(error);
    }
  };
  
  const getProfile = async () => {
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Promise.resolve(data);
    } catch (error) {
      console.error(error.stack);
      return Promise.reject(error)
    }
  };


  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <NavBar />
        <h1>Spotify App</h1>
        {loading ? (
          <p>Loading...</p>
        ) : !token ? (
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
            Login to Spotify
          </a>
        ) : (
          <Routes>
          <Route path="/top-tracks" element={<TopTracks topTracks={topTracks} />} />
          <Route path="/playlists" element={<Playlists Playlists={playlists} token={token} />} />
          <Route path="/recommendations/:playlistIndex" element={<Reccomend />} />
          <Route path="/" element={<Home token={token}/>} />
        </Routes>
        )}

      </header>
    </div>
  </Router>
  );
}

export default App;

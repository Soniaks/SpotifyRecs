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
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-read-private user-read-email playlist-read-private user-top-read"

  const [token, setToken] = useState("");
  const [topTracks, setTopTracks] = useState([]);
  const [profile, setProfile] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [userID, setUserID] = useState("");

  /*useEffect(() => {
    // Check if the user is already logged in (retrieve from localStorage)
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);*/

  /*const handleLogin = () => {
    // Perform your login logic here
    // Set the login status to true
    setIsLoggedIn(true);

    // Persist the login status in localStorage
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    // Perform your logout logic here
    setToken("");
    window.localStorage.removeItem("token");
    setIsLoggedIn(false);

    // Remove the login status from localStorage
    localStorage.removeItem('isLoggedIn');
  };*/

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hash = window.location.hash;
        let token = window.localStorage.getItem("token");
  
        if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
          window.location.hash = "";
          window.localStorage.setItem("token", token);
        }
  
        setToken(token);
  
        // Fetch top tracks and profile when the component mounts or when the token changes
        if (token) {
          const profileData = await getProfile();
          setProfile(profileData.id);
          console.log(profileData)
  
          const topTracksData = await getTopTracks();
          setTopTracks(topTracksData.items);
          console.log(topTracksData)
          // Extract userID from profileData
          const userID = profileData.id;
          setUserID(userID);
  
          const playlistData = await getPlaylists(userID);
          setPlaylists(playlistData.items);
          console.log(playlists)
        }
      } catch (error) {
        console.error(error.stack)
        console.error("Error fetching data:", error);
        // Handle the error, e.g., show an error message to the user
      }
    };
  
    fetchData();
  }, [token]);
  
  // Dependency array ensures the effect runs only when token changes

  const getTopTracks = async () => {
    try {
      console.log("top")
      // The axios.get method returns a Promise
      const { data } = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Returning the data wrapped in a resolved Promise
      return Promise.resolve(data);
    } catch (error) {
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
      return Promise.reject(error)
    }
  };


  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <NavBar />
        <h1>Spotify App</h1>
        {!token ? (
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
            Login to Spotify
          </a>
        ) : (
          <p></p>
        )}
      

        <Routes>
          <Route path="/top-tracks" element={<TopTracks topTracks={topTracks} />} />
          <Route path="/playlists" element={<Playlists Playlists={playlists} token={token} />} />
          <Route path="/recommendations/:playlistIndex" element={<Reccomend />} />
          <Route path="/" element={<Home token={token}/>} />
        </Routes>
      </header>
    </div>
  </Router>
  );
}

export default App;

import React, { useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import { useState } from "react";
import axios from "axios";

const rootUrl = "https://api.github.com";

//

const GithubContext = React.createContext();

//provider
const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUSer] = useState(mockUser);
  const [Repos, setRepos] = useState(mockRepos);
  const [Followers, setFlowers] = useState(mockFollowers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );
    if (response) {
      setGithubUSer(response.data);
      const { login, followers_url } = response.data;

      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results;
          const status = "fulfilled";
          if (repos.status === status) {
            setRepos(repos.value.data);
          }
          if (followers.status === status) {
            setFlowers(followers.value.data);
          }
        })
        .catch((err) => console.log(err));
    } else {
      toggleError(true, "there is no user with that username");
    }
    setLoading(false);
  };
  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }
  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then((data) => {})
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    checkRequest();
  }, []);

  return (
    <GithubContext.Provider value={{ githubUser, Repos, Followers,error, searchGithubUser, loading }}>
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };

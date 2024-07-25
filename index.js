import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('api/auth/yandex/user')
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleYandexLogin = () => {
    window.location.href = 'api/auth/yandex/login';
  };

  const handleYandexLogout = () => {
    axios.get('api/auth/yandex/logout')
      .then(() => {
        setUser(null);
      });
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <button onClick={handleYandexLogout}>Logout from Yandex</button>
        </div>
      ) : (
        <button onClick={handleYandexLogin}>Login with Yandex</button>
      )}
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import CallCompositeComponent from './CallCompositeComponent';
import { initializeIcons } from "@fluentui/react";
import './App.css';
import { createUserAndToken, createUserAndTokenLocal, UserAndToken } from './utils/server';

initializeIcons();

function App() {
  const [userAndToken, setUserAndToken] = useState<UserAndToken | null>(null);

  useEffect(() => {
    (async () => {
      let response;

      if (userAndToken !== null) {
        return;
      }

      if (process.env.REACT_APP_NODE_ENV === 'development') {
        response = await createUserAndTokenLocal();
      }
      else {
        response = await createUserAndToken();
      }
      setUserAndToken(response);
    })();
    
  }, [])

  if (userAndToken === null) {
    return <div>Loading...</div>;
  }

  console.log(JSON.stringify(userAndToken));
  const userId = userAndToken.userId;
  const token = userAndToken.token;
  const groupId = '376dbb90-b5ae-11ef-8b71-cde5a398544c';

  return (
    <div className="App">
      <CallCompositeComponent userId={userId} token={token} groupId={groupId} />
    </div>
  );
}

export default App;
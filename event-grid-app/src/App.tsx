import React, { useEffect, useState } from 'react';
import CallCompositeComponent from './CallCompositeComponent';
import { initializeIcons } from "@fluentui/react";
import './App.css';
import { createUserAndToken, UserAndToken } from './utils/server';

initializeIcons();

function App() {
  const [userAndToken, setUserAndToken] = useState<UserAndToken | null>(null);

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted
    (async () => {
      let response;

      if (userAndToken !== null) {
        return;
      }

      response = await createUserAndToken();
      if (isMounted) {
        setUserAndToken(response);
      }
    })();
    return () => {
      isMounted = false;
    }
  }, [userAndToken])

  if (userAndToken === null) {
    return <div>Loading...</div>;
  }

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
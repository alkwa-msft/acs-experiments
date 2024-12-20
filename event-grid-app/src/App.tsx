import React, { useEffect, useState } from 'react';
import CallCompositeComponent from './CallCompositeComponent';
import { initializeIcons } from "@fluentui/react";
import './App.css';
import { createUserAndToken, UserAndToken } from './utils/server';
initializeIcons();

function App() {
  const [userAndToken, setUserAndToken] = useState<UserAndToken | null>(null);
  const [groupCallResponse, setGroupCallResponse] = useState<string | null>(null);

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

  useEffect(()=>{
    (async() =>{
      const groupCallConfig = await fetch('/groupId');
      const groupCallConfigJson = await groupCallConfig.json();
      setGroupCallResponse(groupCallConfigJson.groupId);
    })();
  }, []);

  if (userAndToken === null) {
    return <div>Loading...</div>;
  }

  if (groupCallResponse === null) {
    return <div>Loading...</div>;
  }

  const userId = userAndToken.userId;
  const token = userAndToken.token;
  const groupId = groupCallResponse;

  return (
    <div className="App">
      <CallCompositeComponent userId={userId} token={token} groupId={groupId} />
    </div>
  );
}

export default App;